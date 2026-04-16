import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  email = signal('');

  sendResetLink() {
    if (!this.email().includes('@')) {
      alert('Please enter a valid email address with an @ sign.');
      return;
    }

    this.authService.forgotPassword(this.email()).subscribe({
      next: () => this.router.navigate(['/reset-message']),
      error: () => this.router.navigate(['/reset-message'])
    });
  }
}
