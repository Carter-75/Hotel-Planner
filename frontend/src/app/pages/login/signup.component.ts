import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Banana in a box model using signals
  firstName = signal('');
  lastName = signal('');

  ngOnInit() {
    // If no pending credentials, user shouldn't be here
    if (!this.authService.pendingCredentials()) {
      this.router.navigate(['/login']);
    }
  }

  signup() {
    const creds = this.authService.pendingCredentials();
    if (!creds) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.register({
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: creds.email,
      password: creds.password
    }).subscribe({
      next: () => {
        // Clear pending credentials after success
        this.authService.pendingCredentials.set(null);
      },
      error: (err: any) => console.error('Registration failed:', err)
    });
  }
}
