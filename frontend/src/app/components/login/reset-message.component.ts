import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-message',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="reset-message">
        <p>If you have an account with us you will shortly get an email to reset your password.</p>
        <button type="button" class="back-link" routerLink="/login">Back</button>
    </section>
  `,
  styles: []
})
export class ResetMessageComponent {}
