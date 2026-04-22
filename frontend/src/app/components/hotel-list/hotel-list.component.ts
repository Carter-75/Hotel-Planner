import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HotelCardComponent } from '../hotel-card/hotel-card.component';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [HotelCardComponent],
  template: `
    <div class="hotel-list-container">
      @for (hotel of hotels; track hotel._id) {
        <app-hotel-card [hotel]="hotel" (savedStateChange)="onToggle($event)"></app-hotel-card>
      } @empty {
        <p class="empty-msg">{{ emptyMessage }}</p>
      }
    </div>
  `,
  styles: [`
    .hotel-list-container {
      display: grid;
      gap: 32px;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      padding: 0;
    }
    .empty-msg {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 40px;
      color: var(--text-muted);
      font-size: 1.1rem;
      background: white;
      border-radius: var(--radius-lg);
      border: 1px dashed #e2e8f0;
    }
  `]
})
export class HotelListComponent {
  @Input({ required: true }) hotels: any[] = [];
  @Input() emptyMessage: string = 'No hotels found.';
  @Output() savedStateChange = new EventEmitter<string>();

  onToggle(hotelId: string) {
    this.savedStateChange.emit(hotelId);
  }
}
