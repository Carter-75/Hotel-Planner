import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
//block non admins from users page, the ui will hide it but thats just the frontend
  if (authService.isAuthenticated() && authService.currentUser()?.role === 'admin') {
    return true;
  }

  // Redirect to home if not admin
  router.navigate(['/home']);
  return false;
};
