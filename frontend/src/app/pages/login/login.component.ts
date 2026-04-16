import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  
  // The fields for the login form
  email = signal('');
  password = signal('');

  // Figure out what to do based on the email entered
  login() {
    // Basic email check
    if (!this.email().includes('@')) {
      alert('Please enter a valid email address with an @ sign.');
      return;
    }

    const email = this.email();
    const password = this.password();

    // Ask the server: Is this user new, returning, or banned?
    this.authService.checkUserStatus(email).subscribe({
      next: (status: { exists: boolean, isBanned: boolean }) => {
        if (!status.exists) {
          // New user: Save their email/pass in memory and go to signup page for their names
          this.authService.pendingCredentials.set({ email, password });
          inject(Router).navigate(['/signup']);
        } else if (status.isBanned) {
          // Banned user: Go to the "You are banned" jail page
          inject(Router).navigate(['/banned']);
        } else {
          // Existing user: Just sign them in normally
          this.authService.login({ email, password }).subscribe({
            error: (err: any) => console.error('Login failed:', err)
          });
        }
      },
      error: (err: any) => console.error('Status check failed:', err)
    });
  }
}
