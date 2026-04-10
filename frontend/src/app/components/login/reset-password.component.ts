import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [],
  template: `
    <section id="reset-password">
        <h2>Password Reset</h2>

        <form id="reset-password-form" method="POST">
            <label for="new-password">Enter your new password</label>
            <input type="password" id="new-password" name="new-password" required minlength="8">

            <button type="submit">Submit</button>
        </form>
    </section>
  `,
  styles: []
})
export class ResetPasswordComponent {}
