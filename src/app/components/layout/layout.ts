import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkList } from '../bookmark-list/bookmark-list';
import { WallpaperOptionComponent } from '../wallpaper-option/wallpaper-option.component';
import { WallpaperService } from '../../services/wallpaper.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, AfterViewInit {
  searchQuery: string = '';
  showWallpaperOptions: boolean = false;
  currentWallpaperUrl: string | null = null;
  showBackground: boolean = true;
  isBackgroundVisible: boolean = false; // New property to control background visibility

  constructor(private wallpaperService: WallpaperService) { }

  ngOnInit(): void {
    this.loadBackgroundSettings();
    this.isBackgroundVisible = this.showBackground; // Initialize based on stored setting
    if (this.showBackground) {
      this.fetchAndSetWallpaper();
    } else {
      this.currentWallpaperUrl = null; // Ensure no background image if toggle is off
    }
  }
  
  @ViewChild('bookmarkList') bookmarkList!: BookmarkList;

  ngAfterViewInit() { }

  loadBackgroundSettings(): void {
    this.showBackground = localStorage.getItem('showBackground') === 'true';
  }

  async fetchAndSetWallpaper(): Promise<void> {
    const topics = localStorage.getItem('wallpaperTopics');
    const apiKey = localStorage.getItem('pexelsApiKey');
    const wallpaper = await this.wallpaperService.getRandomHDLandscape(topics || undefined, apiKey || undefined);
    if (wallpaper) {
      this.currentWallpaperUrl = wallpaper.large2xHD;
      this.isBackgroundVisible = true;
    } else {
      this.currentWallpaperUrl = null;
      this.isBackgroundVisible = false;
    }
  }

  onShowBackgroundChange(show: boolean): void {
    this.showBackground = show;
    this.isBackgroundVisible = show; // Update visibility based on toggle
    if (this.showBackground) {
      this.fetchAndSetWallpaper();
    } else {
      this.currentWallpaperUrl = null; // Clear background image
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
}
