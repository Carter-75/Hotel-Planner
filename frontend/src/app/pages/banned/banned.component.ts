import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-banned',
  standalone: true,
  imports: [],
  templateUrl: './banned.component.html',
  styleUrls: ['./banned.component.css']
})
export class BannedComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
