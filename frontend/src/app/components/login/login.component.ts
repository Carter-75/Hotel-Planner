import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="login">
        <h1>Login</h1>

        <form id="login-form" method="POST">
            <label for="login-email">Enter email</label>
            <input type="email" id="login-email" name="email" required placeholder="example@uwm.edu">

            <label for="login-password">Enter password</label>
            <input type="password" id="login-password" name="password" required>

            <div class="form-actions">
                <a routerLink="/forgot-password" id="forgot-password-link">Forgot password</a>
                <button type="submit">Login / Sign up</button>
            </div>
        </form>
    </section>
  `,
  styles: []
})
export class LoginComponent {}
