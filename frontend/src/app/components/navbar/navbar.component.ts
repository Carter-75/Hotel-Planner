import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header>
        <div id="user-display">
            <span id="welcome-msg">Hello [User First Name]</span>
            <span id="user-email">[User Email]</span>
            <button id="logout-btn">Logout</button>
        </div>

        <nav id="main-nav">
            <button type="button" id="nav-saved" routerLink="/saved">Saved</button>
            <button type="button" id="nav-users" routerLink="/admin/users">Users</button>
            <button type="button" id="nav-hotels" routerLink="/admin/hotels">Motels / Hotels</button>
        </nav>
    </header>
  `,
  styles: []
})
export class NavbarComponent {}
