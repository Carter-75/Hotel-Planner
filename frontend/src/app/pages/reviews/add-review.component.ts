import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  
  // Banana in a box model using signals
  hotelId = signal('');
  reviewId = signal('');
  hotelName = signal('Loading...');
  rating = signal(5);
  comment = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.hotelId.set(params['hotelId']);
      this.reviewId.set(params['reviewId']);

      if (this.hotelId()) {
        this.loadHotelDetails();
      }

      if (this.reviewId()) {
        this.loadReviewDetails();
      }
    });
  }

  loadReviewDetails() {
    this.apiService.getReview(this.reviewId()).subscribe({
      next: (review: any) => {
        this.rating.set(review.rating);
        this.comment.set(review.comment || '');
      },
      error: (err: any) => console.error('Failed to load review:', err)
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

    if (this.comment() && this.comment().trim().length < 2) {
      alert('If you write a comment, it must be at least 2 characters.');
      return;
    }

    const reviewData = {
      hotelId: this.hotelId(),
      rating: Number(this.rating()), //Ensure numeric
      comment: (this.comment() || '').trim()
    };

    if (this.reviewId()) {
      // Edit mode
      this.apiService.updateReview(this.reviewId(), reviewData).subscribe({
        next: () => this.location.back(),
        error: (err: any) => {
          console.error('Review update failed:', err);
          alert(err.error?.error || 'Failed to update review.');
        }
      });
    } else {
      // Create mode
      this.apiService.postData('reviews', reviewData).subscribe({
        next: () => {
          // Sync local state since backend auto-saved this hotel
          this.authService.forceSaveLocal(this.hotelId());
          this.location.back();
        },
        error: (err: any) => {
          console.error('Review submission failed:', err);
          alert(err.error?.error || 'Failed to submit review. Please ensure you are logged in.');
        }
      });
    }
  }

  cancel() {
    this.location.back();
  }
}
