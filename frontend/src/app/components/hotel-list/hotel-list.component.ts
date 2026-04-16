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
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      padding: 20px 0;
    }
    .empty-msg {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      color: #64748b;
      font-style: italic;
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
