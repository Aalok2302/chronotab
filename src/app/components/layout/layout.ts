import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkList } from '../bookmark/bookmark-list/bookmark-list';
import { WallpaperService } from '../../services/wallpaper.service';
import { ThemeService, Theme } from '../../services/theme.service'; // Import Theme
import { Wallpaper } from '../../../types/wallpaper';
import { Subscription } from 'rxjs';
import { Options, OptionsService } from '../../services/options.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bookmarkList') bookmarkList!: BookmarkList;

  searchQuery: string = '';

  showWallpaperOptions: boolean = false;
  currentWallpaperUrl: string | null = null;
  currentWallpaper: Wallpaper | null = null;

  isBackgroundVisible: boolean = false; // New property to control background visibility

  wallpaperDownloadProgress: number = -1; // -1 means hidden, 0-100 for progress
  currentThemeName: string = ''; // To store the current theme name

  private wallpaperSubscription: Subscription = new Subscription();
  private progressSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription(); // New subscription for theme

  constructor(
    private wallpaperService: WallpaperService,
    private themeService: ThemeService,
    private options: OptionsService
  ) { }

  ngOnInit(): void {
    this.isBackgroundVisible = this.options.getWallpaperOptions().showBackground;

    this.progressSubscription = this.wallpaperService.wallpaperDownloadProgress$.subscribe(progress => {
      this.wallpaperDownloadProgress = progress;
      // If progress is 100, hide after a short delay, or immediately if -1
      if (progress === 100) {
        setTimeout(() => this.wallpaperDownloadProgress = -1, 500);
      } else if (progress === -1) {
        this.wallpaperDownloadProgress = -1;
      }
    });

    if (this.isBackgroundVisible) {
      if (!this.currentWallpaper) {
        this.refreshWallpaperInLayout();
      }
    } else {
      this.currentWallpaperUrl = null;
    }

    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      (theme: Theme) => {
        this.currentThemeName = theme.name;
      }
    );

    this.wallpaperSubscription = this.wallpaperService.currentWallpaper$.subscribe(
      (wallpaper: Wallpaper | null) => {
        if (wallpaper) {
          this.currentWallpaper = wallpaper;
          this.currentWallpaperUrl = wallpaper.photoURL;
        }
      }
    )
  }

  ngAfterViewInit() { }

  ngOnDestroy(): void {
    this.wallpaperSubscription.unsubscribe();
    this.progressSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
  }

  async refreshWallpaperInLayout(): Promise<void> {
    await this.wallpaperService.getRandomHDLandscape();
  }

  toggleFavoriteWallpaper() {
    if (this.currentWallpaper) {
      this.wallpaperService.toggleFavoriteWallpaper(this.currentWallpaper);
    }
  }

  checkIfCurrentWallpaperIsFavorite() {
    if (this.currentWallpaper) {
      return this.wallpaperService.checkIfCurrentWallpaperIsFavorite(this.currentWallpaper);
    }
    return false;
  }

  onWallpaperOptionsChange(options: Options['wallpaper']) {
    this.isBackgroundVisible = options.showBackground;

    if (options.showBackground) {
      if (this.currentWallpaper) {
        this.wallpaperService.setWallpaper(this.currentWallpaper);
      } else {
        this.refreshWallpaperInLayout();
      }
    } else {
      this.wallpaperService.setWallpaper(null as any);
    }
  }

  toggleWallpaperOptions(): void {
    this.showWallpaperOptions = !this.showWallpaperOptions;
  }

  onSearchQueryChange(query: string) {
    this.searchQuery = query;
    if (this.bookmarkList) {
      this.bookmarkList.onSearchQueryChange(query);
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

  getProgressBarGradientClasses() {
    switch (this.currentThemeName) {
      case 'light':
        return 'from-gray-200 to-gray-400';
      case 'dark':
        return 'from-gray-700 to-gray-900';
      case 'blue':
        return 'from-blue-500 to-cyan-600';
      case 'purple':
        return 'from-purple-500 to-pink-600';
      case 'green':
        return 'from-green-500 to-teal-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  }
}
