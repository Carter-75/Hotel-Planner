import { Injectable, signal } from '@angular/core';
import { HotelDataSource } from '../models/hotel.datasource';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  // Persistence for the Home Search
  hotels = signal<any[]>([]);
  totalResults = signal(0);
  currentPage = signal(1);
  hasMore = signal(false);
  
  // Persistence for Filters
  location = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  rating = signal<number | null>(null);
  
  // Scroll Position Persistence
  scrollIndex = signal(0);
  scrollOffset = signal(0);
  
  dataSource?: HotelDataSource;

  // Clear state when needed
  reset() {
    this.hotels.set([]);
    this.totalResults.set(0);
    this.currentPage.set(1);
    this.hasMore.set(false);
    this.scrollIndex.set(0);
    this.scrollOffset.set(0);
    this.dataSource = undefined;
  }
}
