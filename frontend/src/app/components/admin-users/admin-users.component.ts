import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="admin-users">
        <h2>Only admin for users</h2>

        <form id="admin-filter-form">
            <label for="user-name-filter">Enter name</label>
            <input type="text" id="user-name-filter" name="username">

            <label for="user-score-filter">Min rating</label>
            <input type="number" id="user-score-filter" name="rating">

            <button type="submit">Go</button>
            <button type="button" id="sort-users-btn">A-Z</button>
        </form>

        <div id="admin-users-container" class="results-container">
            <!-- user items added by JS here -->
        </div>

        <button type="button" class="back-link" routerLink="/home">Back</button>
    </section>
  `,
  styles: []
})
export class AdminUsersComponent {}
