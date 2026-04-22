import { Injectable, signal } from '@angular/core';
import { UserDataSource } from '../models/user.datasource';

@Injectable({
  providedIn: 'root'
})
export class AdminStateService {
  // Feed Data
  items = signal<any[]>([]);
  totalResults = signal(0);
  currentPage = signal(1);
  hasMore = signal(false);
  
  // Filters
  usernameFilter = signal('');
  ratingFilter = signal<number | null>(null);
  
  // Scroll Position
  scrollIndex = signal(0);
  scrollOffset = signal(0);

  dataSource?: UserDataSource;

  // Clear state (e.g. for forced logout or reset)
  reset() {
    this.items.set([]);
    this.totalResults.set(0);
    this.currentPage.set(1);
    this.hasMore.set(false);
    this.usernameFilter.set('');
    this.ratingFilter.set(null);
    this.scrollIndex.set(0);
    this.scrollOffset.set(0);
    this.dataSource = undefined;
  }
}
