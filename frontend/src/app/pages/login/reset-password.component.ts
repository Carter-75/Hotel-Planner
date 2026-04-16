import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token: string | null = null;
  newPassword = signal('');
  message = signal('');

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.message.set('Invalid or missing reset token.');
    }
  }

  updatePassword() {
    if (!this.token) return;

    this.authService.resetPassword(this.token, this.newPassword()).subscribe({
      next: (res: any) => {
        alert('Password updated successfully!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.message.set(err.error?.message || 'Reset failed');
      }
    });
  }
}
