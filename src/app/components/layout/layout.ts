import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkList } from '../bookmark-list/bookmark-list';
import { WallpaperOptionComponent } from '../wallpaper-option/wallpaper-option.component';
import { WallpaperService } from '../../services/wallpaper.service';
import { ThemeService } from '../../services/theme.service';
import { Wallpaper, FavoriteWallpaper } from '../../../types/wallpaper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, AfterViewInit, OnDestroy {
  searchQuery: string = '';
  showWallpaperOptions: boolean = false;
  currentWallpaperUrl: string | null = null;
  currentWallpaper: Wallpaper | null = null; // To store the full wallpaper object
  showBackground: boolean = true;
  isBackgroundVisible: boolean = false; // New property to control background visibility
  favoriteWallpapers: FavoriteWallpaper[] = [];
  isCurrentWallpaperFavorite: boolean = false; // New property to track if current wallpaper is a favorite
  private wallpaperSubscription: Subscription = new Subscription();

  constructor(
    private wallpaperService: WallpaperService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.loadBackgroundSettings();
    this.loadFavoriteWallpapers();
    this.isBackgroundVisible = this.showBackground; // Initialize based on stored setting

    this.wallpaperSubscription = this.wallpaperService.currentWallpaper$.subscribe(wallpaper => {
      this.currentWallpaper = wallpaper;
      this.currentWallpaperUrl = wallpaper ? wallpaper.originalHD : null;
      this.isBackgroundVisible = this.showBackground && !!wallpaper;
      this.checkIfCurrentWallpaperIsFavorite(); // Check favorite status when wallpaper changes
      if (wallpaper && wallpaper.avgColor) {
        this.setThemeBasedOnAvgColor(wallpaper.avgColor);
      }
    });

    if (this.showBackground) {
      // If a wallpaper is already set (e.g., from localStorage), use it.
      // Otherwise, fetch a new random one.
      if (!this.currentWallpaper) {
        this.fetchAndSetWallpaper();
      }
    } else {
      this.currentWallpaperUrl = null; // Ensure no background image if toggle is off
    }
  }
  
  @ViewChild('bookmarkList') bookmarkList!: BookmarkList;

  ngAfterViewInit() { }

  ngOnDestroy(): void {
    this.wallpaperSubscription.unsubscribe();
  }
 
   loadBackgroundSettings(): void {
     this.showBackground = localStorage.getItem('showBackground') === 'true';
  }

 async fetchAndSetWallpaper(): Promise<void> {
   const topics = localStorage.getItem('wallpaperTopics');
   const apiKey = localStorage.getItem('pexelsApiKey');
   // The service will emit the wallpaper through the observable
   await this.wallpaperService.getRandomHDLandscape(topics || undefined, apiKey || undefined);
 }

 onShowBackgroundChange(show: boolean): void {
   this.showBackground = show;
   this.isBackgroundVisible = show; // Update visibility based on toggle
   if (this.showBackground && !this.currentWallpaper) {
     this.fetchAndSetWallpaper();
   } else if (!this.showBackground) {
     this.wallpaperService.setWallpaper(null as any); // Clear wallpaper via service
   }
 }

  toggleWallpaperOptions(): void {
    this.showWallpaperOptions = !this.showWallpaperOptions;
  }

  onSearchQueryChange(query: string) {
    this.searchQuery = query;
    // Pass the search query to the bookmark list component
    if (this.bookmarkList) {
      this.bookmarkList.onSearchQueryChange(query);
    }
  }

  toggleFavoriteWallpaper(): void {
    if (this.currentWallpaper) {
      const favWallpaper: FavoriteWallpaper = {
        id: this.currentWallpaper.id,
        title: `${this.currentWallpaper.photographer} - ${this.currentWallpaper.alt}`,
        url: this.currentWallpaper.originalHD,
        photographer: this.currentWallpaper.photographer,
        avgColor: this.currentWallpaper.avgColor
      };

      let existingFavorites = this.getFavoriteWallpapersFromLocalStorage();
      const isAlreadyFavorite = existingFavorites.some(fav => fav.id === favWallpaper.id);

      if (!isAlreadyFavorite) {
        existingFavorites.push(favWallpaper);
        console.log('Wallpaper added to favorites:', favWallpaper);
      } else {
        existingFavorites = existingFavorites.filter(fav => fav.id !== favWallpaper.id);
        console.log('Wallpaper removed from favorites:', favWallpaper);
      }
      localStorage.setItem('favoriteWallpapers', JSON.stringify(existingFavorites));
      this.favoriteWallpapers = existingFavorites; // Update the component's list
      this.checkIfCurrentWallpaperIsFavorite(); // Update favorite status
    }
  }

  loadFavoriteWallpapers(): void {
    this.favoriteWallpapers = this.getFavoriteWallpapersFromLocalStorage();
    this.checkIfCurrentWallpaperIsFavorite(); // Update favorite status after loading favorites
  }

  private getFavoriteWallpapersFromLocalStorage(): FavoriteWallpaper[] {
    const favorites = localStorage.getItem('favoriteWallpapers');
    return favorites ? JSON.parse(favorites) : [];
  }

  private checkIfCurrentWallpaperIsFavorite(): void {
    if (this.currentWallpaper) {
      this.isCurrentWallpaperFavorite = this.favoriteWallpapers.some((fav: FavoriteWallpaper) => fav.id === this.currentWallpaper?.id);
    } else {
      this.isCurrentWallpaperFavorite = false;
    }
  }

  private setThemeBasedOnAvgColor(avgColor: string): void {
    // Remove '#' if present
    const hex = avgColor.startsWith('#') ? avgColor.slice(1) : avgColor;

    // Parse r, g, b values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance (perceived brightness)
    // Formula: (R*299 + G*587 + B*114) / 1000
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255; // Normalize to 0-1

    // A common threshold for dark/light is 0.5.
    // If luminance is less than 0.5, it's a dark color, so use light theme.
    // Otherwise, it's a light color, so use dark theme.
    if (luminance < 0.5) {
      this.themeService.setTheme('dark');
    } else {
      this.themeService.setTheme('blue');
    }
  }
}
