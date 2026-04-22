import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { HotelCardComponent } from '../hotel-card/hotel-card.component';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [ScrollingModule, HotelCardComponent],
  template: `
    <div class="hotel-list-container">
      @if (totalResults === 0) {
        <div class="empty-msg">
          <p>{{ emptyMessage }}</p>
        </div>
      } @else {
        <cdk-virtual-scroll-viewport 
            itemSize="200" 
            class="hotel-viewport"
            (scrolledIndexChange)="onScroll($event)"
            (scroll)="onRawScroll()">
          <div *cdkVirtualFor="let hotel of hotels; trackBy: trackById" class="hotel-item">
            @if (hotel) {
              <app-hotel-card 
                  class="fade-in"
                  [hotel]="hotel" 
                  (savedStateChange)="onToggle($event)">
              </app-hotel-card>
            } @else {
              <div class="hotel-skeleton">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line sub"></div>
                <div class="skeleton-line price"></div>
              </div>
            }
          </div>
        </cdk-virtual-scroll-viewport>
      }
    </div>
  `,
  styles: [`
    .hotel-list-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .hotel-viewport {
      height: 100%; 
      width: 100%;
      min-height: 400px;
    }
    /* Hide scrollbar but allow scrolling for a seamless feel */
    .hotel-viewport::-webkit-scrollbar {
      width: 8px;
    }
    .hotel-viewport::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.1);
      border-radius: 10px;
    }
    .hotel-item {
      padding: 10px 0;
      height: 200px;
      box-sizing: border-box;
    }
    .empty-msg {
      text-align: center;
      padding: 80px 40px;
      color: var(--text-muted);
      font-size: 1.1rem;
      background: white;
      border-radius: var(--radius-lg);
      border: 1px dashed #e2e8f0;
    }
    .hotel-skeleton {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      height: 180px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .skeleton-line.title { height: 24px; width: 60%; }
    .skeleton-line.sub { height: 16px; width: 40%; }
    .skeleton-line.price { height: 32px; width: 30%; margin-top: auto; }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HotelListComponent {
  @Input({ required: true }) hotels: any[] = [];
  @Input() totalResults: number = -1; // -1 means unknown/loading initially
  @Input() emptyMessage: string = 'No hotels found.';
  @Output() savedStateChange = new EventEmitter<string>();
  @Output() nearEnd = new EventEmitter<void>();
  @Output() scrollIndexChange = new EventEmitter<number>();
  @Output() scrollOffsetChange = new EventEmitter<number>();

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  trackById(index: number, item: any) {
    return item ? item._id : `skeleton-${index}`;
  }

  scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
    this.viewport?.scrollToIndex(index, behavior);
  }

  /**
   * Performs a high-speed scroll to the target index
   * Faster and more predictable than native 'smooth'
   */
  fastScrollToIndex(index: number, duration: number = 300) {
    if (!this.viewport) return;

    const targetOffset = index * 200; // index * itemSize (200px)
    const startOffset = this.viewport.measureScrollOffset();
    const distance = targetOffset - startOffset;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Power-out easing: starts fast, slows down at the end
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.viewport?.scrollToOffset(startOffset + distance * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  onScroll(index: number) {
    // Emit the current index for state persistence
    this.scrollIndexChange.emit(index);
    
    // For simple arrays (like saved hotels), we still handle near-end loading
    if (Array.isArray(this.hotels)) {
      const end = this.hotels.length;
      if (index >= end - 7) {
        this.nearEnd.emit();
      }
    }
  }

  onRawScroll() {
    if (this.viewport) {
      this.scrollOffsetChange.emit(this.viewport.measureScrollOffset());
    }
  }

  /**
   * Performs a high-speed scroll to a specific pixel offset
   */
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

  onToggle(hotelId: string) {
    this.savedStateChange.emit(hotelId);
  }
}
