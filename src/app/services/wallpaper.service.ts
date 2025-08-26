import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Wallpaper, FavoriteWallpaper } from '../../types/wallpaper';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WallpaperService {
  private cache = new Map<string, { data: Wallpaper, timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minute in milliseconds

  private _currentWallpaper = new BehaviorSubject<Wallpaper | null>(null);
  currentWallpaper$: Observable<Wallpaper | null> = this._currentWallpaper.asObservable();

  private _wallpaperDownloadProgress = new Subject<number>();
  wallpaperDownloadProgress$: Observable<number> = this._wallpaperDownloadProgress.asObservable();

  private readonly WALLPAPER_STORAGE_KEY = 'favoriteWallpaper';

  constructor(private notificationService: NotificationService) {
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
      this._currentWallpaper.next(cached.data);
      this._wallpaperDownloadProgress.next(-1); // Hide progress bar
      return cached.data;
    }
    this.notificationService.sendNotification('Fetching new wallpaper...');
    this._wallpaperDownloadProgress.next(0); // Start progress for API call
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
      // API call successful, now download the image
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

        // Now download the actual image with progress
        this.notificationService.sendNotification('Downloading wallpaper image...');
        const downloadedImageUrl = await this._downloadImageWithProgress(wallpaper.originalHD);

        // Update wallpaper with the object URL for local display
        const finalWallpaper = { ...wallpaper, originalHD: downloadedImageUrl, large2xHD: downloadedImageUrl, largeHD: downloadedImageUrl, mediumHD: downloadedImageUrl };

        this._currentWallpaper.next(finalWallpaper); // Emit the new wallpaper
        this.notificationService.sendNotification('Wallpaper downloaded successfully!');
        this.cache.set(cacheKey, { data: finalWallpaper, timestamp: Date.now() });
        this._wallpaperDownloadProgress.next(100); // Complete
        return finalWallpaper;
      } else {
        throw new Error('No photos found');
      }
 
    } catch (error) {
      console.error('Error fetching or downloading wallpaper:', error);
      this.notificationService.sendNotification('Failed to fetch or download wallpaper.');
      this._wallpaperDownloadProgress.next(-1); // Hide progress bar on error
      return null;
    }
  }

  private _downloadImageWithProgress(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob'; // Get the response as a Blob

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          this._wallpaperDownloadProgress.next(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const imageUrl = URL.createObjectURL(xhr.response);
          resolve(imageUrl);
        } else {
          reject(new Error(`Failed to download image: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during image download.'));
      };

      xhr.send();
    });
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