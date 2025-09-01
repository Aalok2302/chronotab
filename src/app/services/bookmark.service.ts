import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, of, throwError, fromEvent } from 'rxjs';
import { map, catchError, tap, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../environment/environment';

declare let chrome: any;

export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  children?: Bookmark[];
  dateAdded?: number;
  parentId?: string;
  index?: number;
  syncing?: boolean;
  dateGroupModified?: number;
  folderType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private mockBookmarks: Bookmark[] = environment?.dummyBookmarks;

  // Reactive state management
  private bookmarksSubject = new BehaviorSubject<Bookmark[]>([]);
  private errorSubject = new Subject<string>();

  // Public observables
  public bookmarks$ = this.bookmarksSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Bookmark change events
  private bookmarkCreated$ = new Subject<Bookmark>();
  private bookmarkRemoved$ = new Subject<string>();
  private bookmarkChanged$ = new Subject<{id: string, changeInfo: any}>();

  constructor() {
    this.initializeBookmarkListeners();
  }

  // Initialize Chrome bookmark event listeners
  private initializeBookmarkListeners(): void {
    if (chrome && chrome.bookmarks) {
      chrome.bookmarks.onCreated.addListener((id: string, bookmark: Bookmark) => {
        this.bookmarkCreated$.next(bookmark);
        this.refreshBookmarks();
      });

      chrome.bookmarks.onRemoved.addListener((id: string, removeInfo: any) => {
        this.bookmarkRemoved$.next(id);
        this.refreshBookmarks();
      });

      chrome.bookmarks.onChanged.addListener((id: string, changeInfo: any) => {
        this.bookmarkChanged$.next({id, changeInfo});
        this.refreshBookmarks();
      });
    }
  }

  // Get all bookmarks as Observable with loading state
  getAllBookmarks(): Observable<{ bookmarks: Bookmark[], loading: boolean }> {
    // Clear bookmarks to show loading state
    this.bookmarksSubject.next([]);

    // Use mock data in development environment
    if (!environment.production) {
      console.log('Using mock bookmarks data in development');
      
      return new Observable<{ bookmarks: Bookmark[], loading: boolean }>(observer => {
        // Emit loading state immediately
        observer.next({ bookmarks: [], loading: true });
        
        // Simulate async loading with mock data
        setTimeout(() => {
          this.bookmarksSubject.next(this.mockBookmarks);
          observer.next({ bookmarks: this.mockBookmarks, loading: false });
          observer.complete();
        }, 100);
      });
    }

    return new Observable<{ bookmarks: Bookmark[], loading: boolean }>(observer => {
      // Emit loading state immediately
      observer.next({ bookmarks: [], loading: true });
      
      if (chrome && chrome.bookmarks) {
        chrome.bookmarks.getTree((bookmarkTree: Bookmark[]) => {
          if (chrome.runtime.lastError) {
            console.log("error loading bookmarks");
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.next({ bookmarks: [], loading: false });
            observer.error(chrome.runtime.lastError);
          } else {
            console.log("bookmarks loaded successfully");
            
            // Transform the bookmark tree to assign folder types
            const transformedBookmarks = this.transformBookmarkFolders(bookmarkTree);
            
            console.log(transformedBookmarks);
            this.bookmarksSubject.next(transformedBookmarks);
            observer.next({ bookmarks: transformedBookmarks, loading: false });
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.next({ bookmarks: [], loading: false });
        observer.error(error);
      }
    }).pipe(
      shareReplay(1),
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Get recent bookmarks as Observable
  getRecentBookmarks(count: number = 10): Observable<Bookmark[]> {
    // In development, return mock recent bookmarks
    if (!environment.production) {
      const recentMockBookmarks = this.flattenBookmarks(this.mockBookmarks)
        .filter(b => b.url)
        .slice(0, count);
      return of(recentMockBookmarks);
    }

    return new Observable<Bookmark[]>(observer => {
      if (chrome && chrome.bookmarks) {
        chrome.bookmarks.getRecent(count, (bookmarks: Bookmark[]) => {
          if (chrome.runtime.lastError) {
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.error(chrome.runtime.lastError);
          } else {
            observer.next(bookmarks);
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Search bookmarks as Observable
  searchBookmarks(query: string): Observable<Bookmark[]> {
    // In development, search mock bookmarks
    if (!environment.production) {
      const searchResults = this.flattenBookmarks(this.mockBookmarks)
        .filter(bookmark =>
          bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
          (bookmark.url && bookmark.url.toLowerCase().includes(query.toLowerCase()))
        );
      return of(searchResults);
    }

    return new Observable<Bookmark[]>(observer => {
      if (chrome && chrome.bookmarks) {
        chrome.bookmarks.search(query, (bookmarks: Bookmark[]) => {
          if (chrome.runtime.lastError) {
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.error(chrome.runtime.lastError);
          } else {
            observer.next(bookmarks);
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Check if bookmark tree has actual content (bookmarks or folders with content)
  private hasBookmarkContent(bookmarks: Bookmark[]): boolean {
    for (const bookmark of bookmarks) {
      // If it has a URL, it's a bookmark
      if (bookmark.url) {
        return true;
      }
      // If it's a folder with children, check recursively
      if (bookmark.children && bookmark.children.length > 0) {
        if (this.hasBookmarkContent(bookmark.children)) {
          return true;
        }
      }
    }
    return false;
  }

  // Flatten bookmark tree to get all bookmark URLs
  flattenBookmarks(bookmarkTree: Bookmark[]): Bookmark[] {
    const flattened: Bookmark[] = [];
    
    const traverse = (bookmarks: Bookmark[]) => {
      bookmarks.forEach(bookmark => {
        if (bookmark.url) {
          flattened.push(bookmark);
        }
        if (bookmark.children) {
          traverse(bookmark.children);
        }
      });
    };
    
    traverse(bookmarkTree);
    return flattened;
  }

  // Get bookmarks in a specific folder as Observable
  getBookmarksInFolder(folderId?: string): Observable<Bookmark[]> {
    // In development, return mock folder contents
    if (!environment.production) {
      const id = folderId || '1';
      const folder = this.findBookmarkById(this.mockBookmarks, id);
      return of(folder?.children || []);
    }

    return new Observable<Bookmark[]>(observer => {
      if (chrome && chrome.bookmarks) {
        const id = folderId || '1'; // Default to bookmarks bar
        chrome.bookmarks.getChildren(id, (children: Bookmark[]) => {
          if (chrome.runtime.lastError) {
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.error(chrome.runtime.lastError);
          } else {
            observer.next(children);
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Helper method to find bookmark by ID
  private findBookmarkById(bookmarks: Bookmark[], id: string): Bookmark | null {
    for (const bookmark of bookmarks) {
      if (bookmark.id === id) {
        return bookmark;
      }
      if (bookmark.children) {
        const found = this.findBookmarkById(bookmark.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Create a new folder as Observable
  createFolder(title: string, parentId?: string): Observable<Bookmark> {
    // In development, simulate folder creation
    if (!environment.production) {
      const mockFolder: Bookmark = {
        id: Date.now().toString(),
        title,
        parentId: parentId || '1',
        dateAdded: Date.now(),
        children: []
      };
      return of(mockFolder);
    }

    return new Observable<Bookmark>(observer => {
      if (chrome && chrome.bookmarks) {
        const folderInfo = {
          title: title,
          parentId: parentId || '1'
        };
        
        chrome.bookmarks.create(folderInfo, (folder: Bookmark) => {
          if (chrome.runtime.lastError) {
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.error(chrome.runtime.lastError);
          } else {
            observer.next(folder);
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Create new bookmark as Observable
  createBookmark(title: string, url: string, parentId?: string): Observable<Bookmark> {
    // In development, simulate bookmark creation
    if (!environment.production) {
      const mockBookmark: Bookmark = {
        id: Date.now().toString(),
        title,
        url,
        parentId: parentId || '1',
        dateAdded: Date.now()
      };
      return of(mockBookmark);
    }

    return new Observable<Bookmark>(observer => {
      if (chrome && chrome.bookmarks) {
        const bookmarkInfo = {
          title: title,
          url: url,
          parentId: parentId
        };
        
        chrome.bookmarks.create(bookmarkInfo, (bookmark: Bookmark) => {
          if (chrome.runtime.lastError) {
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.error(chrome.runtime.lastError);
          } else {
            observer.next(bookmark);
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Remove bookmark as Observable
  removeBookmark(id: string): Observable<void> {
    // In development, simulate bookmark removal
    if (!environment.production) {
      return of(void 0);
    }

    return new Observable<void>(observer => {
      if (chrome && chrome.bookmarks) {
        chrome.bookmarks.remove(id, () => {
          if (chrome.runtime.lastError) {
            this.errorSubject.next(chrome.runtime.lastError.message);
            observer.error(chrome.runtime.lastError);
          } else {
            observer.next();
            observer.complete();
          }
        });
      } else {
        const error = 'Chrome bookmarks API not available';
        this.errorSubject.next(error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.errorSubject.next(error);
        return throwError(() => error);
      })
    );
  }

  // Refresh bookmarks (trigger reload)
  refreshBookmarks(): void {
    this.getAllBookmarks().subscribe({
      next: (result) => {
        // Just trigger the reload, the bookmarksSubject is already updated in getAllBookmarks
      },
      error: (error) => {
        console.error('Error refreshing bookmarks:', error);
      }
    });
  }

  // Get bookmark change event streams
  getBookmarkCreated$(): Observable<Bookmark> {
    return this.bookmarkCreated$.asObservable();
  }

  getBookmarkRemoved$(): Observable<string> {
    return this.bookmarkRemoved$.asObservable();
  }

private transformBookmarkFolders(bookmarks: Bookmark[]): Bookmark[] {
    return bookmarks.map(bookmark => {
      if (!bookmark.url) { // It's a folder
        let folderType = 'default';
        if (bookmark.title === 'Bookmarks bar') {
          folderType = 'bookmarks-bar';
        } else if (bookmark.title === 'Other bookmarks') {
          folderType = 'other';
        }
        
        const newBookmark: Bookmark = {
          ...bookmark,
          folderType: folderType
        };

        if (newBookmark.children) {
          newBookmark.children = this.transformBookmarkFolders(newBookmark.children);
        }
        
        return newBookmark;
      }
      return bookmark;
    });
  }
  getBookmarkChanged$(): Observable<{id: string, changeInfo: any}> {
    return this.bookmarkChanged$.asObservable();
  }
}