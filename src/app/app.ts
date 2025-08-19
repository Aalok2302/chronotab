import { Component, signal } from '@angular/core';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  title = 'Chrome Bookmark Manager';
  isChromeExtension = false;
  isDevelopment = false;

  ngOnInit() {
    // Check if running as Chrome extension
    this.isChromeExtension = !!(window as any).chrome && !!(window as any).chrome.bookmarks;
    
    // Check if in development mode
    this.isDevelopment = !environment.production;
    
    // Set up extension-specific behaviors
    if (this.isChromeExtension) {
      this.setupExtensionBehaviors();
    }
  }

  private setupExtensionBehaviors() {
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to clear search
      if (event.key === 'Escape') {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput && searchInput === document.activeElement) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
          searchInput.blur();
        }
      }
    });

    // Handle right-click context menu prevention on certain elements
    document.addEventListener('contextmenu', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('bookmark-item') || target.closest('.bookmark-item')) {
        // Allow context menu for bookmarks to enable "Open in new tab", etc.
        return;
      }
    });
  }
}
