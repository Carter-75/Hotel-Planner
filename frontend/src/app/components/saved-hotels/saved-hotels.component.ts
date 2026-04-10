import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-saved-hotels',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="saved-hotels">
        <h2>Saved</h2>

        <div id="saved-results-container" class="results-container">
            <!-- items added by JS here -->
            <p id="no-saved-msg">You haven't saved any hotels yet.</p>
        </div>

        <button type="button" class="back-link" routerLink="/home">Back</button>
    </section>
  `,
  styles: []
})
export class SavedHotelsComponent {}
