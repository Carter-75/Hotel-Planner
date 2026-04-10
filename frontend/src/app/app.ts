import { Component, signal, inject, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';




import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private api = inject(ApiService);
  protected readonly title = signal('Hotel-Planner');
  
  ngOnInit() {
    // Example universal call
    this.api.getData('ping').subscribe(res => console.log('API Status:', res));
  }

  

}
