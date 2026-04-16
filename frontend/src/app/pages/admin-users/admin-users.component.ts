import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  private apiService = inject(ApiService);
  public authService = inject(AuthService);
  
  // Moderation feed data (users and their latest reviews)
  items = signal<any[]>([]); 
  usernameFilter = signal('');
  ratingFilter = signal<number | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Magically calculate the filtered and sorted list
  filteredItems = computed(() => {
    const filter = this.usernameFilter().toLowerCase();
    const rating = this.ratingFilter();
    
    // Filter by name/email and star rating
    let result = this.items().filter(item => {
      const user = item.userId;
      if (!user) return false;
      
      const nameMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(filter) || 
                        user.email?.toLowerCase().includes(filter);
      
      const ratingMatch = rating ? item.rating === rating : true;
      
      return nameMatch && ratingMatch;
    });

    // Sort alphabetically by full name
    result.sort((a, b) => {
      const nameA = `${a.userId?.firstName} ${a.userId?.lastName}`.toLowerCase();
      const nameB = `${b.userId?.firstName} ${b.userId?.lastName}`.toLowerCase();
      
      const comparison = nameA.localeCompare(nameB);
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  ngOnInit() {
    this.loadFeed(); // Get the initial feed
  }

  // Refresh the list of users from the server
  loadFeed() {
    this.apiService.getAllUsers().subscribe({
      next: (data: any[]) => this.items.set(data),
      error: (err: any) => console.error('Failed to load moderation feed:', err)
    });
  }

  // Promote to admin or demote to user
  toggleRole(userId: string) {
    this.apiService.updateUserRole(userId).subscribe({
      next: () => this.loadFeed(),
      error: (err: any) => alert(err.error?.error || 'Failed to update role')
    });
  }

  // Ban or unban a user instantly
  toggleBan(userId: string) {
    this.apiService.toggleUserBan(userId).subscribe({
      next: () => this.loadFeed(),
      error: (err: any) => alert(err.error?.error || 'Failed to toggle ban')
    });
  }

  // The 'nuclear' option - permanently delete a user
  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user? This action is permanent.')) {
      this.apiService.deleteUser(userId).subscribe({
        next: () => this.loadFeed(),
        error: (err: any) => alert(err.error?.error || 'Failed to delete user')
      });
    }
  }

  // Toggle sorting between A-Z and Z-A
  toggleSort() {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }
}
