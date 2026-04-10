import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="home">
        <h1>Select a page from the nav above.</h1>
    </section>
  `,
  styles: []
})
export class HomeComponent {}
