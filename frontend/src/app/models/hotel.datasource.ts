import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription, Subject, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { takeUntil, debounceTime } from 'rxjs/operators';

export class HotelDataSource extends DataSource<any | undefined> {
  private _length = 0;
  private _pageSize = 20;
  private _cachedData = new Map<number, (any | undefined)[]>();
  private _fetchedPages = new Set<number>();
  private _dataStream = new BehaviorSubject<(any | undefined)[]>([]);
  private _subscription = new Subscription();
  private _destroy$ = new Subject<void>();
  
  // Public stream for components to watch the total count
  public totalResults$ = new BehaviorSubject<number>(0);

  // Current filter state
  private _filters: any = {};

  get totalLength(): number {
    return this._length;
  }

  constructor(private apiService: ApiService) {
    super();
  }

  /**
   * Sets new filters and resets the cache
   */
  updateFilters(filters: any) {
    // Clean filters: remove null, undefined, or empty strings
    this._filters = Object.keys(filters).reduce((acc: any, key) => {
      const val = filters[key];
      if (val !== null && val !== undefined && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});
    
    this._cachedData.clear();
    this._fetchedPages.clear();
    this._length = 0;
    this._dataStream.next([]);
    
    // Bootstrap: Fetch the first page immediately to get total results
    // This allows the viewport to realize how big the list is
    this._fetchPage(0);
  }

  connect(collectionViewer: CollectionViewer): Observable<(any | undefined)[]> {
    this._subscription.add(
      collectionViewer.viewChange.pipe(debounceTime(20)).subscribe(range => {
        const startPage = Math.floor(range.start / this._pageSize);
        const endPage = Math.floor((range.end - 1) / this._pageSize);

        for (let i = startPage; i <= endPage; i++) {
          this._fetchPage(i);
        }

        // Proactively unload pages that are far away (buffer of 3 pages)
        this._cleanupCache(startPage, endPage);
      })
    );
    return this._dataStream;
  }

  disconnect(): void {
    // We only unsubscribe the internal connection listeners, 
    // but WE DO NOT complete the subjects because this DataSource is a singleton
    // that survives multiple connect/disconnect cycles.
    this._subscription.unsubscribe();
    this._subscription = new Subscription();
  }

  private _fetchPage(pageIndex: number) {
    if (this._fetchedPages.has(pageIndex)) {
      return;
    }

    this._fetchedPages.add(pageIndex);

    const params = {
      ...this._filters,
      page: pageIndex + 1,
      limit: this._pageSize
    };

    console.log(`[DataSource] Fetching page ${pageIndex + 1}...`);
    
    this.apiService.getHotels(params).subscribe((res: any) => {
      this._length = res.total;
      this.totalResults$.next(res.total);
      
      // Update our sparse representation
      const pageData = res.hotels;
      this._cachedData.set(pageIndex, pageData);

      // Construct a full array for the stream (filled with undefined for missing parts)
      // This tells CDK exactly how long the list is
      this._updateDataStream();
    });
  }

  private _updateDataStream() {
    const fullData = Array.from({ length: this._length });
    this._cachedData.forEach((data, pageIndex) => {
      const start = pageIndex * this._pageSize;
      for (let i = 0; i < data.length; i++) {
        fullData[start + i] = data[i];
      }
    });
    this._dataStream.next(fullData);
  }

  private _cleanupCache(startPage: number, endPage: number) {
    const buffer = 3; // Keep 3 pages above and below
    this._cachedData.forEach((_, pageIndex) => {
      if (pageIndex < startPage - buffer || pageIndex > endPage + buffer) {
        console.log(`[DataSource] Unloading page ${pageIndex + 1} from memory`);
        this._cachedData.delete(pageIndex);
        this._fetchedPages.delete(pageIndex);
      }
    });
    // We don't always need to push to stream here unless we want to show skeletons immediately
  }
}
