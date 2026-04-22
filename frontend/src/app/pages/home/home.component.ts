import { Component, signal, inject, AfterViewInit, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SearchStateService } from '../../services/search-state.service';
import { SearchResultsComponent } from '../../components/search-results/search-results.component';
import { HotelDataSource } from '../../models/hotel.datasource';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchResultsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy, OnInit {
  private api = inject(ApiService);
  private state = inject(SearchStateService);
  private auth = inject(AuthService);
  private _destroy$ = new Subject<void>();

  @ViewChild(SearchResultsComponent) resultsComp?: SearchResultsComponent;

  // Local form inputs for two-way binding
  locationInput = this.state.location();
  minPriceInput = this.state.minPrice();
  maxPriceInput = this.state.maxPrice();
  ratingInput = this.state.rating();
  
  hotels = this.state.hotels;
  isLoading = signal(false);
  
  currentPage = this.state.currentPage;
  totalResults = this.state.totalResults;
  hasMore = this.state.hasMore;

  dataSource!: HotelDataSource;

  ngOnInit() {
    // Persistent DataSource logic to avoid white-screen on Back
    if (!this.state.dataSource) {
      this.state.dataSource = new HotelDataSource(this.api);
      this.dataSource = this.state.dataSource;
      this.updateDataSource();
    } else {
      this.dataSource = this.state.dataSource;
    }

    // Sync total results to handle empty state message
    this.dataSource.totalResults$
      .pipe(takeUntil(this._destroy$))
      .subscribe((total: number) => this.totalResults.set(total));
  }

  private updateDataSource() {
    this.dataSource.updateFilters({
      location: this.state.location(),
      minPrice: this.state.minPrice(),
      maxPrice: this.state.maxPrice(),
      rating: this.state.rating()
    });
  }

  ngAfterViewInit() {
    this.restoreScroll(5); // Attempt restoration with 5 retries
  }

  private restoreScroll(retries: number) {
    const targetOffset = this.state.scrollOffset();
    if (targetOffset <= 0) return;

    const viewport = this.resultsComp?.resultsList?.viewport;
    const isReady = viewport && this.dataSource.totalLength > 0;

    if (isReady) {
      // Small delay to ensure browser has updated its internal layout from the DataSource
      requestAnimationFrame(() => {
        console.log(`[Home] Ready! Fast restoring scroll to offset: ${targetOffset}px`);
        this.resultsComp?.resultsList?.fastScrollToOffset(targetOffset, 300);
      });
    } else if (retries > 0) {
      console.warn(`[Home] Viewport or data not ready, retrying scroll... (${retries} left)`);
      setTimeout(() => this.restoreScroll(retries - 1), 200);
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onScrollIndexChange(index: number) {
    // Persist scroll position immediately as the user moves
    this.state.scrollIndex.set(index);
  }

  onScrollOffsetChange(offset: number) {
    this.state.scrollOffset.set(offset);
  }

  // Resets filters and refreshes the data source
  search() {
    // Sync local inputs to persistent state
    this.state.location.set(this.locationInput);
    this.state.minPrice.set(this.minPriceInput);
    this.state.maxPrice.set(this.maxPriceInput);
    this.state.rating.set(this.ratingInput);

    this.state.scrollOffset.set(0);
    this.state.scrollIndex.set(0);
    this.updateDataSource();
  }

  // LoadMore is now handled automatically by the DataSource
  loadMore() {
    // No-op: DataSource handles paged fetching based on viewport range
  }
}
