import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, skipWhile, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * authGuard:
 * Ensures the user is logged in before accessing a route.
 * Waits for initial auth check to complete.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.isLoading).pipe(
    skipWhile(loading => loading),
    take(1),
    map(() => {
      if (auth.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

/**
 * rootGuard:
 * Used on the empty path ('') to redirect users based on login status.
 */
export const rootGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.isLoading).pipe(
    skipWhile(loading => loading),
    take(1),
    map(() => {
      if (auth.isAuthenticated()) {
        router.navigate(['/home']);
      } else {
        router.navigate(['/login']);
      }
      return false;
    })
  );
};
