import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Wallpaper, FavoriteWallpaper } from '../../types/wallpaper';

@Injectable({
  providedIn: 'root'
})
export class WallpaperService {
  private cache = new Map<string, { data: Wallpaper, timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minute in milliseconds

  private _currentWallpaper = new BehaviorSubject<Wallpaper | null>(null);
  currentWallpaper$: Observable<Wallpaper | null> = this._currentWallpaper.asObservable();

  private readonly WALLPAPER_STORAGE_KEY = 'favoriteWallpaper';

  constructor() {
    this.loadFavoriteWallpaper();
  }

  private buildRandomHDLandscapeURL(topic: string = 'wallpaper'): string {
    const randomPage = Math.floor(Math.random() * 100) + 1; // Random page 1-100
    const randomPerPage = Math.floor(Math.random() * 30) + 50; // 50-80 results

    const params = new URLSearchParams({
      query: topic,
      page: randomPage.toString(),
      per_page: randomPerPage.toString(),
      orientation: 'landscape',
      size: 'large',        // Ensures HD quality
      locale: 'en-US'
    });

    return `https://api.pexels.com/v1/search?${params.toString()}`;
  }

  private buildRandomTopicURL(): string {
    const topics = [
      'nature', 'landscape', 'mountain', 'ocean', 'forest', 'sunset',
      'sunrise', 'sky', 'clouds', 'beach', 'desert', 'valley',
      'lake', 'river', 'waterfall', 'glacier', 'canyon', 'field',
      'hills', 'countryside', 'scenic', 'panorama', 'horizon'
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomPage = Math.floor(Math.random() * 50) + 1;

    const params = new URLSearchParams({
      query: randomTopic,
      page: randomPage.toString(),
      per_page: '80',
      orientation: 'landscape',
      size: 'large'
    });

    return `https://api.pexels.com/v1/search?${params.toString()}`;
  }

  async getRandomHDLandscape(topic?: string, apiKey?: string): Promise<Wallpaper | null> {
    const PEXELS_API_KEY = apiKey || localStorage.getItem('pexelsApiKey') || 'YOUR_DEFAULT_API_KEY_HERE'; // Use provided key, then stored, then default
    const cacheKey = `wallpaper-${topic || 'random'}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      console.log('Serving wallpaper from cache');
      return cached.data;
    }

    try {
      const url = topic ? this.buildRandomHDLandscapeURL(topic) : this.buildRandomTopicURL();

      console.log('Fetching new wallpaper from API URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': PEXELS_API_KEY,
          'User-Agent': 'CronotabApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.photos.length);
        const photo = data.photos[randomIndex];

        const wallpaper: Wallpaper = {
          originalHD: photo.src.original,
          large2xHD: photo.src.large2x,
          largeHD: photo.src.large,
          mediumHD: photo.src.medium,
          id: photo.id,
          photographer: photo.photographer,
          alt: photo.alt,
          width: photo.width,
          height: photo.height,
          avgColor: photo.avg_color,
          photoURL: photo.url
        };
        this._currentWallpaper.next(wallpaper); // Emit the new wallpaper

        this.cache.set(cacheKey, { data: wallpaper, timestamp: Date.now() });
        return wallpaper;
      } else {
        throw new Error('No photos found');
      }

    } catch (error) {
      console.error('Error fetching random HD image:', error);
      return null;
    }
  }

  setWallpaper(wallpaper: Wallpaper): void {
    this._currentWallpaper.next(wallpaper);
    this.saveFavoriteWallpaper(wallpaper);
  }

  private saveFavoriteWallpaper(wallpaper: Wallpaper | null): void {
    if (wallpaper) {
      const favoriteWallpaper: FavoriteWallpaper = {
        id: wallpaper.id,
        title: wallpaper.alt, // Using alt as title, adjust if a specific title is available
        url: wallpaper.originalHD, // Using originalHD as the main URL
        photographer: wallpaper.photographer,
        avgColor: wallpaper.avgColor
      };
      localStorage.setItem(this.WALLPAPER_STORAGE_KEY, JSON.stringify(favoriteWallpaper));
    } else {
      localStorage.removeItem(this.WALLPAPER_STORAGE_KEY);
    }
  }

  private loadFavoriteWallpaper(): void {
    const storedWallpaper = localStorage.getItem(this.WALLPAPER_STORAGE_KEY);
    if (storedWallpaper) {
      const favoriteWallpaper: FavoriteWallpaper = JSON.parse(storedWallpaper);
      // Reconstruct a Wallpaper object from FavoriteWallpaper for _currentWallpaper
      const wallpaper: Wallpaper = {
        id: favoriteWallpaper.id,
        alt: favoriteWallpaper.title,
        photographer: favoriteWallpaper.photographer,
        avgColor: favoriteWallpaper.avgColor,
        originalHD: favoriteWallpaper.url,
        large2xHD: favoriteWallpaper.url, // Using the same URL for all sizes for simplicity
        largeHD: favoriteWallpaper.url,
        mediumHD: favoriteWallpaper.url,
        width: 0, // Default or fetch if needed
        height: 0, // Default or fetch if needed
        photoURL: favoriteWallpaper.url
      };
      this._currentWallpaper.next(wallpaper);
    }
  }
}