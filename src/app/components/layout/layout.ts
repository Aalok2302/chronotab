import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BookmarkList } from '../bookmark-list/bookmark-list';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements AfterViewInit {
  searchQuery: string = '';
  
  @ViewChild('bookmarkList') bookmarkList!: BookmarkList;

  ngAfterViewInit() {
    // Component is initialized
  }

  onSearchQueryChange(query: string) {
    this.searchQuery = query;
    // Pass the search query to the bookmark list component
    if (this.bookmarkList) {
      this.bookmarkList.onSearchQueryChange(query);
    }
  }
}
