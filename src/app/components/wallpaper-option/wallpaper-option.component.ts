import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoriteWallpaper, Wallpaper } from '../../../types/wallpaper';
import { WallpaperService } from '../../services/wallpaper.service';

@Component({
  selector: 'app-wallpaper-option',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallpaper-option.component.html',
  styleUrls: ['./wallpaper-option.component.css']
})
export class WallpaperOptionComponent implements OnInit {
  pexelsApiKey: string = '';
  topics: string = '';
  showBackground: boolean = true;

  @Input() favoriteWallpapers: FavoriteWallpaper[] = [];
  @Input() selectedWallpaperUrl: string | null = null; // New input for selected wallpaper URL
  @Output() showBackgroundChange = new EventEmitter<boolean>();
  @Output() refreshWallpaper = new EventEmitter<void>();
  @Output() selectFavoriteWallpaper = new EventEmitter<FavoriteWallpaper>();

  constructor(private wallpaperService: WallpaperService) { }

  ngOnInit(): void {
    this.loadSettings();
    // If selectedWallpaperUrl is null (no favorite wallpaper), set it to "null" string to match the option value
    if (this.selectedWallpaperUrl === null) {
      this.selectedWallpaperUrl = 'null';
    }
  }

  onSelectFavoriteWallpaper(event: Event): void {
    const selectedUrl = (event.target as HTMLSelectElement).value;
    if (selectedUrl === 'null') { // Check for the string "null"
      this.wallpaperService.setWallpaper(null as any); // Clear the wallpaper
      this.selectedWallpaperUrl = null; // Update the input property to reflect the cleared selection
    } else {
      const selectedFav = this.favoriteWallpapers.find(fav => fav.url === selectedUrl);
      if (selectedFav) {
        // Create a dummy Wallpaper object to pass to the service
        const dummyWallpaper: Wallpaper = {
          id: selectedFav.id,
          originalHD: selectedFav.url,
          large2xHD: selectedFav.url, // Using originalHD for all for simplicity
          largeHD: selectedFav.url,
          mediumHD: selectedFav.url,
          photographer: selectedFav.photographer,
          alt: selectedFav.title.split(' - ')[1] || '', // Extract alt from title
          width: 0, // Not available in FavoriteWallpaper
          height: 0, // Not available in FavoriteWallpaper
          avgColor: selectedFav.avgColor,
          photoURL: selectedFav.url
        };
        this.wallpaperService.setWallpaper(dummyWallpaper);
      }
    }
  }

  loadSettings(): void {
    this.pexelsApiKey = localStorage.getItem('pexelsApiKey') || '';
    this.topics = localStorage.getItem('wallpaperTopics') || '';
    this.showBackground = localStorage.getItem('showBackground') === 'true';
  }

  saveSettings(): void {
    localStorage.setItem('pexelsApiKey', this.pexelsApiKey);
    localStorage.setItem('wallpaperTopics', this.topics);
    localStorage.setItem('showBackground', this.showBackground.toString());
    this.showBackgroundChange.emit(this.showBackground);
  }

  onApiKeyChange(event: Event): void {
    this.pexelsApiKey = (event.target as HTMLInputElement).value;
    this.saveSettings();
  }

  onTopicsChange(event: Event): void {
    this.topics = (event.target as HTMLInputElement).value;
    this.saveSettings();
  }

  onToggleBackground(): void {
    this.showBackground = !this.showBackground;
    this.saveSettings();
    this.showBackgroundChange.emit(this.showBackground);
  }

  onRefreshWallpaper(): void {
    if (this.showBackground) {
      this.refreshWallpaper.emit();
    }
  }
}