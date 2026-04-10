import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="search-view">
        <h2>Search</h2>

        <form id="search-form">
            <label for="location">Where would you like to go?</label>
            <input type="text" id="location" name="location" placeholder="City or address">

            <p>Filter by:</p>
            <label for="min-price">Min price</label>
            <input type="number" id="min-price" name="min-price" min="0">

            <label for="max-price">Max price</label>
            <input type="number" id="max-price" name="max-price" min="0">

            <label for="rating">Min rating</label>
            <input type="number" id="rating" name="rating" min="1" max="5">

            <button type="submit">Search</button>
        </form>

        <div id="search-results-container" class="results-container">
             <!-- items added by JS here -->
             <p id="no-search-msg">Enter a location to find hotels.</p>
        </div>
        
        <button type="button" class="back-link" routerLink="/home">Back</button>
    </section>
  `,
  styles: []
})
export class SearchComponent {}
