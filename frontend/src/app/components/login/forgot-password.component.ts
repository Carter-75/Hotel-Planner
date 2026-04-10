import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="forgot-password">
        <h2>Forgot Password</h2>

        <form id="forgot-password-form" method="POST">
            <label for="forgot-email">Enter email to reset password</label>
            <input type="email" id="forgot-email" name="forgot-email" required>

            <div class="form-actions">
                <button type="button" class="back-link" routerLink="/login">Back</button>
                <button type="submit">Submit</button>
            </div>
        </form>
    </section>
  `,
  styles: []
})
export class ForgotPasswordComponent {}
