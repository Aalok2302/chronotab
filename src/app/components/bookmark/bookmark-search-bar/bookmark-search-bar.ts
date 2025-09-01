import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bookmark-search-bar',
  standalone: false,
  templateUrl: './bookmark-search-bar.html',
})
export class BookmarkSearchBar {
  @Input() searchQuery!:string;
  @Output() searchQueryChange: EventEmitter<string> = new EventEmitter<string>();

  onQueryChange() {
    this.searchQueryChange.emit(this.searchQuery);
  }
}
