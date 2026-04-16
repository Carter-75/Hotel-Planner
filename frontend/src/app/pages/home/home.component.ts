import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HotelListComponent } from '../../components/hotel-list/hotel-list.component';
import { SearchResultsComponent } from '../../components/search-results/search-results.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchResultsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private api = inject(ApiService);

  // Search filters (where, how much, how many stars)
  location = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  rating = signal<number | null>(null);
  
  // The hotels we found and a loading spinner toggle
  hotels = signal<any[]>([]);
  isLoading = signal(false);

  // The big search button logic
  search() {
    this.isLoading.set(true);
    
    // Build our filter object for the API
    const filters: any = {};
    if (this.location()) filters.location = this.location();
    if (this.minPrice()) filters.minPrice = this.minPrice();
    if (this.maxPrice()) filters.maxPrice = this.maxPrice();
    if (this.rating()) filters.rating = this.rating();

    this.api.getHotels(filters).subscribe({
      next: (data: any[]) => {
        this.hotels.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Search failed:', err);
        this.isLoading.set(false);
      }
    });
  }
}
