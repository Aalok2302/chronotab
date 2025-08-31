import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Bookmark, BookmarkService } from '../../services/bookmark-service';

@Component({
  selector: 'bookmark-list',
  standalone: false,
  templateUrl: './bookmark-list.html',
  styleUrl: './bookmark-list.css'
})
export class BookmarkList implements OnDestroy {
  bookmarkTree: Bookmark[] = [];
  query: string = '';
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

  public onSearchQueryChange(newQuery: string) {
    this.query = newQuery;
    this.onSearch();
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
            this.bookmarkTree = this.sortBookmarks(result.bookmarks);
            this.collapseSecondLayerFolders(); // Collapse second layer folders by default
          }
        },
        error: (error) => {
          console.error('Error loading bookmarks:', error);
          this.error = error;
          this.loading = false;
        }
      });
  }

  private collapseSecondLayerFolders() {
    this.collapsedFolders.clear(); // Clear any existing collapsed state
    this.collapseFoldersRecursive(this.bookmarkTree, 0);
  }

  private collapseFoldersRecursive(bookmarks: Bookmark[], currentLevel: number) {
    bookmarks.forEach(bookmark => {
      if (bookmark.children) { // It's a folder
        if (currentLevel >= 2) { // Collapse folders from the second level onwards (0-indexed)
          this.collapsedFolders.add(bookmark.id);
        }
        this.collapseFoldersRecursive(bookmark.children, currentLevel + 1);
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
    if (!this.query.trim()) {
      return this.bookmarkTree;
    }
    
    return this.filterBookmarksRecursively(this.bookmarkTree, this.query.toLowerCase());
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
    this.searchQuery$.next(this.query);
  }

  private performSearch(query: string) {
    // Search is now handled by getFilteredBookmarks() method
    // No additional logic needed here as the template will reactively update
  }

  openBookmark(url: string) {
    // In development mode or when Chrome APIs aren't available, use window.open
    if (chrome?.tabs) {
      chrome.tabs.create({ url: url });
    } else {
      window.open(url, '_blank');
    }
  }

  removeBookmark(data: {bookmark: Bookmark, event: Event}) {
    const { bookmark } = data;
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
  private sortBookmarks(bookmarks: Bookmark[]): Bookmark[] {
    if (!bookmarks || bookmarks.length === 0) {
      return [];
    }

    const folders: Bookmark[] = [];
    const files: Bookmark[] = [];

    bookmarks.forEach(bookmark => {
      if (bookmark.url) {
        files.push(bookmark);
      } else {
        folders.push(bookmark);
      }
    });

    // Sort folders by dateAdded (ascending)
    folders.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));

    // Sort files by dateAdded (ascending)
    files.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));

    // Recursively sort children of folders
    folders.forEach(folder => {
      if (folder.children) {
        folder.children = this.sortBookmarks(folder.children);
      }
    });

    return [...folders, ...files];
  }
}
