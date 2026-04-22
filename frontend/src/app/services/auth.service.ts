import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable, forkJoin } from 'rxjs';

// This is what a user object looks like in our app
export interface User {
  _id: string;
  googleId?: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  role: 'user' | 'admin';
  isBanned: boolean;
  savedHotels?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = inject(ApiService);

  // App state signals
  private _currentUser = signal<User | null>(null); // Who is logged in?
  private _isLoading = signal<boolean>(true); // Are we still checking auth?
  readonly pendingCredentials = signal<{email: string, password: string} | null>(null); // Temp storage for signup
  
  // Storage for toggles that haven't been committed to the DB yet
  // Maps hotelId -> final target state (true = saved, false = unsaved)
  private _pendingSaves = new Map<string, boolean>();

  // Computed shortcuts for auth state
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  /**
   * Check if a hotel is in the user's saved list
   */
  // Quick check if a hotel id is in our saved list (accounting for pending changes)
  isHotelSaved(hotelId: string): boolean {
    // If there's a pending change for this hotel, trust that first
    if (this._pendingSaves.has(hotelId)) {
      return this._pendingSaves.get(hotelId) === true;
    }

    const user = this._currentUser();
    return !!user?.savedHotels?.includes(hotelId);
  }

  /**
   * Toggles the local state in a buffer without hitting the API immediately
   */
  toggleBufferedSave(hotelId: string): void {
    const currentState = this.isHotelSaved(hotelId);
    const targetState = !currentState;

    // If the target state matches the actual DB state, we can just remove the pending change
    const dbState = !!this._currentUser()?.savedHotels?.includes(hotelId);
    if (targetState === dbState) {
      this._pendingSaves.delete(hotelId);
    } else {
      this._pendingSaves.set(hotelId, targetState);
    }
  }

  /**
   * Commits all pending save/unsave actions to the backend
   * Returns an observable that completes when all requests are finished
   */
  commitSaves(): Observable<any> {
    if (this._pendingSaves.size === 0) return of(true);

    const changes = Array.from(this._pendingSaves.entries());
    this._pendingSaves.clear(); // Clear immediately so we don't double-commit
    
    console.log(`[AuthService] Committing ${changes.length} pending save changes...`);

    const requests = changes.map(([hotelId, targetState]) => {
      const dbState = !!this._currentUser()?.savedHotels?.includes(hotelId);
      
      if (dbState !== targetState) {
        return this.api.toggleSaveHotel(hotelId).pipe(
          tap(savedIds => {
            const user = this._currentUser();
            if (user) {
              this._currentUser.set({ ...user, savedHotels: savedIds });
            }
          }),
          catchError(err => {
            console.error(`Failed to sync hotel ${hotelId}:`, err);
            return of(null);
          })
        );
      }
      return of(null);
    });

    return forkJoin(requests);
  }

  /**
   * Toggle saved status of a hotel and update local state
   */
  // Save/unsave a hotel and update the local state immediately
  toggleHotelSave(hotelId: string): Observable<string[]> {
    return this.api.toggleSaveHotel(hotelId).pipe(
      tap(savedIds => {
        const user = this._currentUser();
        if (user) {
          this._currentUser.set({ ...user, savedHotels: savedIds });
        }
      })
    );
  }

  /**
   * Force save a hotel in local state (used for auto-save on review)
   */
  forceSaveLocal(hotelId: string): void {
    const user = this._currentUser();
    if (user && !user.savedHotels?.includes(hotelId)) {
      const newSaves = [...(user.savedHotels || []), hotelId];
      this._currentUser.set({ ...user, savedHotels: newSaves });
    }
  }

  // Constructor logic simplified
  constructor() {
    this.checkAuthStatus(); // Check login status as soon as the app starts
  }

  /**
   * Check if the user is currently authenticated with the backend
   */
  // Ask the server if we're still logged in
  checkAuthStatus(): void {
    this._isLoading.set(true);
    this.api.getData<User>('auth/user').pipe(
      tap((user: User) => {
        this._currentUser.set(user);
        this._isLoading.set(false);

        // If you're banned, you can't be here
        if (user && user.isBanned) {
          this.router.navigate(['/banned']);
        }
      }),
      catchError((err: any) => {
        this._currentUser.set(null);
        this._isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Register a new user
   */
  // Create a brand new account
  register(details: any): Observable<User> {
    return this.api.postData<User>('auth/register', details).pipe(
      tap(user => {
        this._currentUser.set(user);
        this.router.navigate(['/home']);
      })
    );
  }

  /**
   * Login with email and password
   */
  // Sign in with email and password
  login(credentials: any): Observable<User> {
    return this.api.postData<User>('auth/login', credentials).pipe(
      tap((user: User) => {
        this._currentUser.set(user);
        this.router.navigate(['/home']);
      }),
      catchError((err: any) => {
        alert(err.error?.message || 'Login failed');
        throw err;
      })
    );
  }

  /**
   * Request a password reset email
   */
  // Request a password reset link to be sent to an email
  forgotPassword(email: string): Observable<any> {
    return this.api.postData<any>('auth/forgot-password', { email });
  }

  /**
   * Check user status (exists/banned) by email
   */
  // Check if an email has an account and if it's banned
  checkUserStatus(email: string): Observable<{ exists: boolean, isBanned: boolean }> {
    return this.api.postData<{ exists: boolean, isBanned: boolean }>('auth/check-status', { email });
  }

  /**
   * Reset password using a token
   */
  // Set a new password using a secret token from an email
  resetPassword(token: string, password: string): Observable<any> {
    return this.api.postData<any>('auth/reset-password', { token, password });
  }

  /**
   * Logout the user
   */
  // Log out and clear everything
  logout(): void {
    this.api.getData<{message: string}>('auth/logout').subscribe({
      next: () => {
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Logout failed:', err);
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      }
    });
  }
}
