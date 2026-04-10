import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="add-review">
        <h2>Add Review</h2>

        <form id="add-review-form">
            <!-- hidden input to store the hotel ID the user is reviewing -->
            <input type="hidden" id="review-hotel-id" name="hotelId">

            <label for="review-rating">Rating</label>
            <select id="review-rating" name="rating" required>
                <option value="">Select rating</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>

            <label for="review-message">Message</label>
            <textarea id="review-message" name="message" required></textarea>

            <div class="form-actions">
                <button type="button" class="back-link" routerLink="/reviews">Back</button>
                <button type="submit">Add</button>
            </div>
        </form>
    </section>
  `,
  styles: []
})
export class AddReviewComponent {}
