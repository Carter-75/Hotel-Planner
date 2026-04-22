import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './hotel-card.component.html',
  styleUrls: ['./hotel-card.component.css']
})
export class HotelCardComponent {
  @Input({ required: true }) hotel: any;
  @Output() savedStateChange = new EventEmitter<string>();
  
  private authService = inject(AuthService);
  private router = inject(Router);

  // Check the global auth state to see if this card is already saved
  isSaved(): boolean {
    return this.authService.isHotelSaved(this.hotel._id);
  }

  // Handle the save/unsave button click (with buffering)
  toggleSave(event: Event) {
    event.stopPropagation(); // Don't trigger the card click
    
    // You gotta be logged in to save stuff
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Toggle the local buffer state
    this.authService.toggleBufferedSave(this.hotel._id);
    this.savedStateChange.emit(this.hotel._id); 
  }

  // Open the full detail view for this hotel
  goToDetails() {
    this.router.navigate(['/hotel', this.hotel._id]);
  }
}
