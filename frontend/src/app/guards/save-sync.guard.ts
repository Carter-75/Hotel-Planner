import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * A functional guard that ensures all pending hotel saves are committed
 * to the backend database BEFORE navigation proceeds to a new page.
 */
export const saveSyncGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.commitSaves();
};
