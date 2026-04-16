import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.css']
})
export class AddReviewComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  
  // Banana in a box model using signals
  hotelId = signal('');
  hotelName = signal('Loading...');
  rating = signal(5);
  comment = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.hotelId.set(params['hotelId']);
      if (this.hotelId()) {
        this.loadHotelDetails();
      }
    });
  }

  loadHotelDetails() {
    this.apiService.getHotel(this.hotelId()).subscribe({
      next: (hotel: any) => this.hotelName.set(hotel.name),
      error: (err: any) => console.error('Failed to load hotel:', err)
    });
  }

  submitReview() {
    if (!this.rating()) {
      alert('Please select a rating.');
      return;
    }

    const reviewData = {
      hotelId: this.hotelId(),
      rating: this.rating(),
      comment: this.comment()
    };

    this.apiService.postData('reviews', reviewData).subscribe({
      next: () => {
        this.location.back();
      },
      error: (err: any) => console.error('Review submission failed:', err)
    });
  }

  cancel() {
    this.location.back();
  }
}
