import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hotel-admin',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="hotel-admin">
        <h2 id="hotel-admin-title">Hotel Admin</h2>

        <!-- if editing, we'll show the current card here -->
        <article id="current-hotel-card" class="hotel-card" hidden>
            <!-- header populated by JS when editing -->
        </article>

        <form id="hotel-admin-form">
            <!-- hidden input for editing existing hotels -->
            <input type="hidden" id="hotel-id" name="id">

            <div>
                <label for="hotel-name">Name</label>
                <input type="text" id="hotel-name" name="name" required>
            </div>
            <div>
                <label for="hotel-address">Address</label>
                <input type="text" id="hotel-address" name="address" required>
            </div>
            <div>
                <label for="hotel-stars">Stars</label>
                <input type="number" id="hotel-stars" name="stars" step="0.1" min="1" max="5" required>
            </div>
            <div>
                <label for="hotel-price">Price</label>
                <input type="number" id="hotel-price" name="price" min="0" required>
            </div>
            <div>
                <label for="hotel-amenities">Amenities</label>
                <input type="text" id="hotel-amenities" name="amenities" placeholder="wifi, pool, etc.">
            </div>
            <button type="submit" id="hotel-admin-save-btn">Save</button>
        </form>
        
        <button type="button" class="back-link" routerLink="/home">Back</button>
    </section>
  `,
  styles: []
})
export class HotelAdminComponent {}
