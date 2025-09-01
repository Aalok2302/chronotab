import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Bookmark } from '../../../services/bookmark.service';

@Component({
  selector: 'bookmark-item',
  standalone: false,
  templateUrl: './bookmark-item.html',
})
export class BookmarkItem {
  @Input() bookmark!: Bookmark;
  @Input() level: number = 0;
  @Input() isCollapsed: boolean = false;
  
  @Output() toggleFolder = new EventEmitter<string>();
  @Output() openBookmark = new EventEmitter<string>();
  @Output() removeBookmark = new EventEmitter<{bookmark: Bookmark, event: Event}>();

  onToggleFolder() {
    if (!this.bookmark.url && this.bookmark.id) {
      this.toggleFolder.emit(this.bookmark.id);
    }
  }

  onOpenBookmark() {
    if (this.bookmark.url) {
      this.openBookmark.emit(this.bookmark.url);
    }
  }

  onRemoveBookmark(event: Event) {
    event.stopPropagation();
    this.removeBookmark.emit({bookmark: this.bookmark, event});
  }

  getFaviconUrl(): string {
    if (!this.bookmark.url) return '';
    try {
      const domain = new URL(this.bookmark.url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return '';
    }
  }

  formatDate(timestamp?: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  get paddingLeft(): number {
    return 12 + (this.level * 20);
  }

  get isFolder(): boolean {
    return !this.bookmark.url;
  }

  get itemCount(): number {
    return this.bookmark.children?.length || 0;
  }

  get canRemove(): boolean {
    return this.bookmark.folderType !== 'bookmarks-bar' && 
           this.bookmark.folderType !== 'other' && 
           this.bookmark.title !== '';
  }
}
