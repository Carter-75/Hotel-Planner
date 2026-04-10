import { Component } from '@angular/core';

@Component({
  selector: 'app-banned',
  standalone: true,
  imports: [],
  template: `
    <section id="banned">
        <p>You are banned and can not use this app.</p>
        <button id="logout-banned" type="button">Logout</button>
    </section>
  `,
  styles: []
})
export class BannedComponent {}
