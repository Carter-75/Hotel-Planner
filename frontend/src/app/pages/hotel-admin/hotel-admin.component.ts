import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hotel-admin',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './hotel-admin.component.html',
  styleUrls: ['./hotel-admin.component.css']
})
export class HotelAdminComponent implements OnInit {
  private apiService = inject(ApiService);
  
  // Banana in a box model using signals
  hotelId = signal('');
  name = signal('');
  address = signal('');
  stars = signal(1);
  price = signal(0);
  amenities = signal('');
  description = signal('');

  hotels = signal<any[]>([]);
  isEditing = signal(false);

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.apiService.getHotels({}).subscribe({
      next: (data: any[]) => this.hotels.set(data),
      error: (err: any) => console.error('Failed to load hotels:', err)
    });
  }

  saveHotel() {
    const hotelData = {
      name: this.name(),
      address: this.address(),
      stars: this.stars(),
      price: this.price(),
      amenities: this.amenities().split(',').map(a => a.trim()).filter(a => a),
      description: this.description()
    };

    if (this.isEditing() && this.hotelId()) {
      this.apiService.putData(`hotels/${this.hotelId()}`, hotelData).subscribe({
        next: () => {
          this.resetForm();
          this.loadHotels();
        },
        error: (err: any) => console.error('Update failed:', err)
      });
    } else {
      this.apiService.postData('hotels', hotelData).subscribe({
        next: () => {
          this.resetForm();
          this.loadHotels();
        },
        error: (err: any) => console.error('Creation failed:', err)
      });
    }
  }

  editHotel(hotel: any) {
    this.isEditing.set(true);
    this.hotelId.set(hotel._id);
    this.name.set(hotel.name);
    this.address.set(hotel.address);
    this.stars.set(hotel.stars);
    this.price.set(hotel.price);
    this.amenities.set(hotel.amenities.join(', '));
    this.description.set(hotel.description || '');
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteHotel(id: string) {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.apiService.deleteData(`hotels/${id}`).subscribe({
        next: () => this.loadHotels(),
        error: (err: any) => console.error('Delete failed:', err)
      });
    }
  }

  resetForm() {
    this.isEditing.set(false);
    this.hotelId.set('');
    this.name.set('');
    this.address.set('');
    this.stars.set(1);
    this.price.set(0);
    this.amenities.set('');
    this.description.set('');
  }
}
