import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="reviews">
        <h2>Reviews</h2>

        <article class="hotel-info">
            <h3 id="reviews-hotel-name">[Hotel Name / Address]</h3>

            <div id="reviews-list-container">
                <!-- reviews added by JS here -->
            </div>

            <button type="button" class="back-link" routerLink="/search">Back</button>
        </article>
    </section>
  `,
  styles: []
})
export class ReviewsComponent {}
