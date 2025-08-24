import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  @Output() showBackgroundChange = new EventEmitter<boolean>();
  @Output() refreshWallpaper = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    this.loadSettings();
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