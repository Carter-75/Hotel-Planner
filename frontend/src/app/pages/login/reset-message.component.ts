import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-message',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reset-message.component.html',
  styleUrls: ['./reset-message.component.css']
})
export class ResetMessageComponent {}
