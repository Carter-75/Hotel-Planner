import { Component, signal, inject, OnInit, computed, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdminStateService } from '../../services/admin-state.service';
import { UserDataSource } from '../../models/user.datasource';
import { HorizontalScrollDirective } from '../../directives/horizontal-scroll.directive';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink, FormsModule, ScrollingModule, DatePipe, HorizontalScrollDirective],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);
  public authService = inject(AuthService);
  private state = inject(AdminStateService);
  private _destroy$ = new Subject<void>();
  
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  // View Signals linked to State Service
  items = this.state.items;
  isLoading = signal(false);
  
  // Local form inputs for two-way binding
  usernameFilterInput = this.state.usernameFilter();
  ratingFilterInput = this.state.ratingFilter();
  
  currentPage = this.state.currentPage;
  totalResults = this.state.totalResults;
  hasMore = this.state.hasMore;

  dataSource!: UserDataSource;

  ngOnInit() {
    // Force fresh data on every navigation to this page
    if (!this.state.dataSource) {
      this.state.dataSource = new UserDataSource(this.apiService);
    }
    
    this.dataSource = this.state.dataSource;
    this.refresh(); // Ensure we don't show stale cached data from previous visit

    // Sync total results for empty state message
    this.dataSource.totalResults$
      .pipe(takeUntil(this._destroy$))
      .subscribe(total => this.totalResults.set(total));
  }

  private updateDataSource() {
    this.dataSource.updateFilters({
      search: this.state.usernameFilter(),
      rating: this.state.ratingFilter()
    });
  }

  ngAfterViewInit() {
    this.restoreScroll(5);
  }

  private restoreScroll(retries: number) {
    const targetOffset = this.state.scrollOffset();
    if (targetOffset <= 0) return;

    const isReady = this.viewport && this.dataSource.totalLength > 0;

    if (isReady) {
      requestAnimationFrame(() => {
        console.log(`[Admin] Ready! Fast restoring scroll to offset: ${targetOffset}px`);
        this.viewport?.scrollToOffset(targetOffset);
      });
    } else if (retries > 0) {
      console.warn(`[Admin] Viewport or data not ready, retrying scroll... (${retries} left)`);
      setTimeout(() => this.restoreScroll(retries - 1), 200);
    }
  }

  // Restart from page 1
  refresh() {
    this.state.usernameFilter.set(this.usernameFilterInput);
    this.state.ratingFilter.set(this.ratingFilterInput);
    this.updateDataSource();
  }

  // LoadMore is now handled by UserDataSource
  loadMore() { }

  private performLoad(append: boolean) { }

  // Handle scrolling in the virtual viewport
  onScroll(index: number) {
    // Save index in real-time
    this.state.scrollIndex.set(index);
  }

  onRawScroll() {
    if (this.viewport) {
      this.state.scrollOffset.set(this.viewport.measureScrollOffset());
    }
  }

  fastScrollToOffset(targetOffset: number, duration: number = 300) {
    if (!this.viewport) return;

    const startOffset = this.viewport.measureScrollOffset();
    const distance = targetOffset - startOffset;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.viewport?.scrollToOffset(startOffset + distance * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Administrative actions
  toggleRole(userId: string) {
    this.apiService.updateUserRole(userId).subscribe({
      next: () => this.dataSource.refreshPage(this.state.scrollIndex()),
      error: (err: any) => alert(err.error?.error || 'Failed to update role')
    });
  }

  toggleBan(userId: string) {
    this.apiService.toggleUserBan(userId).subscribe({
      next: () => this.dataSource.refreshPage(this.state.scrollIndex()),
      error: (err: any) => alert(err.error?.error || 'Failed to toggle ban')
    });
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user? This action is permanent and will remove all their data.')) {
      this.apiService.deleteUser(userId).subscribe({
        next: () => this.refresh(),
        error: (err: any) => alert(err.error?.error || 'Failed to delete user')
      });
    }
  }

  deleteReview(reviewId: string) {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.apiService.deleteReview(reviewId).subscribe({
        next: () => {
          // Refresh the current view to show the review is gone
          this.dataSource.refreshPage(this.state.scrollIndex());
        },
        error: (err: any) => alert(err.error?.error || 'Failed to delete review')
      });
    }
  }

  trackById(index: number, item: any) {
    return item ? item._id : `skeleton-${index}`;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
