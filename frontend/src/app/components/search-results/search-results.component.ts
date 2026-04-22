import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelListComponent } from '../hotel-list/hotel-list.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, HotelListComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent {
  // The list of hotels or DataSource we got from the search
  @Input({ required: true }) hotels: any;
  
  // Is the search still in progress?
  @Input() isLoading: boolean = false;
  @Input() totalResults: number = -1;

  @Output() nearEnd = new EventEmitter<void>();
  @Output() scrollIndexChange = new EventEmitter<number>();
  @Output() scrollOffsetChange = new EventEmitter<number>();

  @ViewChild(HotelListComponent) resultsList?: HotelListComponent;
}
