import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HotelListComponent } from '../../components/hotel-list/hotel-list.component';

@Component({
  selector: 'app-saved-hotels',
  standalone: true,
  imports: [HotelListComponent],
  templateUrl: './saved-hotels.component.html',
  styleUrls: ['./saved-hotels.component.css']
})
export class SavedHotelsComponent implements OnInit {
  private apiService = inject(ApiService);
  private location = inject(Location);
  
  savedHotels = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchSavedHotels();
  }

  fetchSavedHotels() {
    this.isLoading.set(true);
    this.apiService.getSavedHotels().subscribe({
      next: (data: any[]) => {
        this.savedHotels.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load saved hotels:', err);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
