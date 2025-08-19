import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject, combineLatest, of } from 'rxjs';
import { takeUntil, switchMap, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Bookmark, BookmarkService } from '../../services/bookmark-service';

@Component({
  selector: 'app-bookmark-list-component',
  standalone: false,
  templateUrl: './bookmark-list-component.html',
  styleUrl: './bookmark-list-component.css'
})
export class BookmarkListComponent implements OnDestroy {
  bookmarkTree: Bookmark[] = [];
  searchQuery: string = '';
  loading: boolean = true;
  error: string | null = null;
  
  // Track collapsed/expanded state of folders
  collapsedFolders: Set<string> = new Set();

  // Subject for component destruction
  private destroy$ = new Subject<void>();
  
  // Subject for search query changes
  private searchQuery$ = new Subject<string>();

  constructor(private bookmarkService: BookmarkService, private cdr: ChangeDetectorRef) {
    this.initializeSubscriptions();
  }

  ngOnInit() {
    this.loadBookmarks();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    // Subscribe to error state
    this.bookmarkService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Subscribe to bookmark changes for real-time updates
    this.bookmarkService.getBookmarkCreated$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadBookmarks());

    this.bookmarkService.getBookmarkRemoved$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadBookmarks());

    this.bookmarkService.getBookmarkChanged$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadBookmarks());

    // Setup search with debouncing
    this.searchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => this.performSearch(query));
  }

  private loadBookmarks() {
    // Load bookmark tree with loading state
    this.bookmarkService.getAllBookmarks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.loading = result.loading;
          this.cdr.detectChanges(); 
          if (result.bookmarks && result.bookmarks.length > 0) {
            this.bookmarkTree = result.bookmarks;
          }
        },
        error: (error) => {
          console.error('Error loading bookmarks:', error);
          this.error = error;
          this.loading = false;
        }
      });
  }

  // Toggle folder collapse/expand state
  toggleFolder(folderId: string) {
    if (this.collapsedFolders.has(folderId)) {
      this.collapsedFolders.delete(folderId);
    } else {
      this.collapsedFolders.add(folderId);
    }
  }

  // Check if folder is collapsed
  isFolderCollapsed(folderId: string): boolean {
    return this.collapsedFolders.has(folderId);
  }

  // Get filtered bookmarks based on search
  getFilteredBookmarks(): Bookmark[] {
    if (!this.searchQuery.trim()) {
      return this.bookmarkTree;
    }
    
    return this.filterBookmarksRecursively(this.bookmarkTree, this.searchQuery.toLowerCase());
  }

  private filterBookmarksRecursively(bookmarks: Bookmark[], query: string): Bookmark[] {
    const filtered: Bookmark[] = [];
    
    for (const bookmark of bookmarks) {
      const matchesTitle = bookmark.title.toLowerCase().includes(query);
      const matchesUrl = bookmark.url && bookmark.url.toLowerCase().includes(query);
      
      if (bookmark.children) {
        // For folders, check if any children match
        const filteredChildren = this.filterBookmarksRecursively(bookmark.children, query);
        if (filteredChildren.length > 0 || matchesTitle) {
          filtered.push({
            ...bookmark,
            children: filteredChildren
          });
        }
      } else if (matchesTitle || matchesUrl) {
        // For bookmarks, add if they match
        filtered.push(bookmark);
      }
    }
    
    return filtered;
  }

  onSearch() {
    this.searchQuery$.next(this.searchQuery);
  }

  private performSearch(query: string) {
    // Search is now handled by getFilteredBookmarks() method
    // No additional logic needed here as the template will reactively update
  }

  openBookmark(url?: string) {
    if (url) {
      // In development mode or when Chrome APIs aren't available, use window.open
      if (chrome?.tabs) {
        chrome.tabs.create({ url: url });
      } else {
        window.open(url, '_blank');
      }
    }
  }

  removeBookmark(bookmark: Bookmark, event: Event) {
    event.stopPropagation();
    
    const itemType = bookmark.url ? 'bookmark' : 'folder';
    if (confirm(`Remove ${itemType} "${bookmark.title}"?`)) {
      this.bookmarkService.removeBookmark(bookmark.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Bookmark removed:', bookmark.id);
            this.loadBookmarks();
          },
          error: (error) => {
            console.error('Error removing bookmark:', error);
          }
        });
    }
  }

  getFaviconUrl(url?: string): string {
    if (!url) return '';
    try {
      const domain = new URL(url).origin;
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
}
