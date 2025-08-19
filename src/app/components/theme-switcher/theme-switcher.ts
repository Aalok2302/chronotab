import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService, Theme } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'theme-switcher',
  templateUrl: './theme-switcher.html',
  styleUrls: ['./theme-switcher.css'],
  standalone: false
})
export class ThemeSwitcher implements OnInit, OnDestroy {
  themes: Theme[] = [];
  currentTheme!: Theme;
  isOpen = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themes = this.themeService.getAvailableThemes();
    this.currentTheme = this.themeService.getCurrentTheme();
    
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      theme => this.currentTheme = theme
    );
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme.name);
    this.isOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeIcon(themeName: string): string {
    const icons: { [key: string]: string } = {
      'light': '☀️',
      'dark': '🌙',
      'blue': '🌊',
      'purple': '👑',
      'green': '🌿'
    };
    return icons[themeName] || '🎨';
  }

  closeDropdown(event: Event): void {
    // Close dropdown when clicking outside
    if (!(event.target as HTMLElement).closest('.theme-switcher-container')) {
      this.isOpen = false;
    }
  }
}