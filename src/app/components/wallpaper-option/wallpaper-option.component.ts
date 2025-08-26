import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FavoriteWallpaper, Wallpaper } from '../../../types/wallpaper';
import { ToggleApiKeyVisibilityDirective } from '../../directives/toggle-api-key-visibility.directive';
import { WallpaperService } from '../../services/wallpaper.service';

@Component({
  selector: 'app-wallpaper-option',
  standalone: false,
  templateUrl: './wallpaper-option.component.html',
  styleUrls: ['./wallpaper-option.component.css']
})
export class WallpaperOptionComponent implements OnInit {
  wallpaperForm!: FormGroup;

  @Input() favoriteWallpapers: FavoriteWallpaper[] = [];
  @Input() selectedWallpaperUrl: string | null = null; // New input for selected wallpaper URL
  @Output() showBackgroundChange = new EventEmitter<boolean>();
  @Output() refreshWallpaper = new EventEmitter<void>();
  @Output() selectFavoriteWallpaper = new EventEmitter<FavoriteWallpaper>();

  constructor(private wallpaperService: WallpaperService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.wallpaperForm = this.fb.group({
      pexelsApiKey: ['', Validators.required],
      topics: ['', Validators.required],
      showBackground: [true],
      selectedWallpaperUrl: ['null']
    });
    this.loadSettings();

    this.wallpaperForm.valueChanges.subscribe(values => {
      this.saveSettings();
    });
  }

  onSelectFavoriteWallpaper(): void {
    const selectedUrl = this.wallpaperForm.get('selectedWallpaperUrl')?.value;
    if (selectedUrl === 'null') {
      this.wallpaperService.setWallpaper(null as any);
    } else {
      const selectedFav = this.favoriteWallpapers.find(fav => fav.url === selectedUrl);
      if (selectedFav) {
        const dummyWallpaper: Wallpaper = {
          id: selectedFav.id,
          originalHD: selectedFav.url,
          large2xHD: selectedFav.url,
          largeHD: selectedFav.url,
          mediumHD: selectedFav.url,
          photographer: selectedFav.photographer,
          alt: selectedFav.title.split(' - ')[1] || '',
          width: 0,
          height: 0,
          avgColor: selectedFav.avgColor,
          photoURL: selectedFav.url
        };
        this.wallpaperService.setWallpaper(dummyWallpaper);
      }
    }
  }

  loadSettings(): void {
    this.wallpaperForm.patchValue({
      pexelsApiKey: localStorage.getItem('pexelsApiKey') || '',
      topics: localStorage.getItem('wallpaperTopics') || '',
      showBackground: localStorage.getItem('showBackground') === 'true',
      selectedWallpaperUrl: this.selectedWallpaperUrl || 'null'
    });
  }

  saveSettings(): void {
    const { pexelsApiKey, topics, showBackground, selectedWallpaperUrl } = this.wallpaperForm.value;
    localStorage.setItem('pexelsApiKey', pexelsApiKey);
    localStorage.setItem('wallpaperTopics', topics);
    localStorage.setItem('showBackground', showBackground.toString());
    this.showBackgroundChange.emit(showBackground);
    // Update selectedWallpaperUrl input property if it changes via form
    if (this.selectedWallpaperUrl !== selectedWallpaperUrl) {
      this.selectedWallpaperUrl = selectedWallpaperUrl;
      this.onSelectFavoriteWallpaper(); // Re-apply wallpaper if selection changes
    }
  }


  onRefreshWallpaper(): void {
    if (this.wallpaperForm.get('showBackground')?.value) {
      this.wallpaperForm.get('selectedWallpaperUrl')?.setValue('null'); // Unselect favorite wallpaper
      this.refreshWallpaper.emit();
    }
  }
}