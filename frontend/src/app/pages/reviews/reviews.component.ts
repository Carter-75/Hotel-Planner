import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  public authService = inject(AuthService);

  hotelId = signal('');
  hotelName = signal('Loading...');
  hotelAddress = signal('');
  reviews = signal<any[]>([]);

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.hotelId.set(params['hotelId']);
      if (this.hotelId()) {
        this.loadHotelDetails();
        this.loadReviews();
      }
    });
  }

  loadHotelDetails() {
    this.apiService.getHotel(this.hotelId()).subscribe({
      next: (hotel: any) => {
        this.hotelName.set(hotel.name);
        this.hotelAddress.set(hotel.address);
      },
      error: (err: any) => console.error('Failed to load hotel:', err)
    });
  }

  loadReviews() {
    this.apiService.getReviews(this.hotelId()).subscribe({
      next: (data: any[]) => this.reviews.set(data),
      error: (err: any) => console.error('Failed to load reviews:', err)
    });
  }

  removeReview(reviewId: string) {
    if (confirm('Are you sure you want to remove this review?')) {
      this.apiService.deleteReview(reviewId).subscribe({
        next: () => this.loadReviews(),
        error: (err: any) => alert(err.error?.error || 'Failed to remove review')
      });
    }
  }

  formatName(firstName: string, lastName: string): string {
    if (!firstName) return 'Anonymous';
    const lastInitial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : '';
    return `${firstName} ${lastInitial}`.trim();
  }

  goBack() {
    this.location.back();
  }
}
