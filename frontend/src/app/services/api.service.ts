import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // Picks the right API URL based on where we are (local vs prod)
  private get apiUrl(): string {
    const isProd = ('false' as string) === 'true';
    const prodBackend = '' as string;
    
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    
    if (isLocal && !isProd) {
      return '/api';
    }

    if (prodBackend && prodBackend !== '' && !prodBackend.includes('__PROD_')) {
      return prodBackend.endsWith('/') ? prodBackend.slice(0, -1) + '/api' : prodBackend + '/api';
    }

    return '/api';
  }

  /**
   * Universal GET wrapper
   */
  // Basic GET wrapper
  getData<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { 
      params, 
      withCredentials: true 
    });
  }

  /**
   * Universal POST wrapper
   */
  // Basic POST wrapper
  postData<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, { withCredentials: true });
  }

  /**
   * Universal PUT wrapper
   */
  // Basic PUT wrapper
  putData<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, { withCredentials: true });
  }

  /**
   * Universal DELETE wrapper
   */
  // Basic DELETE wrapper
  deleteData<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { withCredentials: true });
  }

  // Get all hotels using filters
  getHotels(filters: any): Observable<any[]> {
    return this.getData<any[]>('hotels', filters);
  }

  // Get just one hotel by its ID
  getHotel(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hotels/${id}`);
  }

  // Fetch all reviews for a specific hotel
  getReviews(hotelId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews/hotel/${hotelId}`);
  }

  // Save or unsave a hotel for the logged-in user
  toggleSaveHotel(hotelId: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/user/save-hotel/${hotelId}`, {}, { withCredentials: true });
  }

  // Get the current user's list of saved hotels
  getSavedHotels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/saved-hotels`, { withCredentials: true });
  }

  // Admin: Get a list of all users on the platform
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`, { withCredentials: true });
  }

  // Admin: Change a user's role (User <-> Admin)
  updateUserRole(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${userId}/role`, {}, { withCredentials: true });
  }

  // Admin: Ban or unban a specific user
  toggleUserBan(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${userId}/ban`, {}, { withCredentials: true });
  }

  // Admin: Completely remove a user from the database
  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/users/${userId}`, { withCredentials: true });
  }

  // Admin: Remove a specific review
  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/reviews/${reviewId}`, { withCredentials: true });
  }
}
