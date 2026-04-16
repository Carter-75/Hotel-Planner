import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hotel-details.component.html',
  styleUrls: ['./hotel-details.component.css']
})
export class HotelDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  hotel = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.loadHotel(id);
      }
    });
  }

  loadHotel(id: string) {
    this.isLoading.set(true);
    this.apiService.getHotel(id).subscribe({
      next: (data: any) => {
        this.hotel.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load hotel details:', err);
        this.isLoading.set(false);
      }
    });
  }

  isSaved(): boolean {
    const h = this.hotel();
    return h ? this.authService.isHotelSaved(h._id) : false;
  }

  toggleSave() {
    const h = this.hotel();
    if (!h) return;
    
    this.authService.toggleHotelSave(h._id).subscribe({
      next: () => {},
      error: (err: any) => console.error('Toggle save failed:', err)
    });
  }

  goBack() {
    this.location.back();
  }
}
