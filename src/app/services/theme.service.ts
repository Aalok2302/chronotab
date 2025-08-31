import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Theme {
  name: string;
  displayName: string;
  properties: {
    // Primary colors
    '--color-primary': string;
    '--color-primary-hover': string;
    '--color-primary-active': string;
    
    // Secondary colors
    '--color-secondary': string;
    '--color-secondary-hover': string;
    '--color-secondary-active': string;
    
    // Accent colors
    '--color-accent': string;
    '--color-accent-hover': string;
    '--color-accent-active': string;
    
    // Background colors
    '--color-bg-primary': string;
    '--color-bg-secondary': string;
    '--color-bg-tertiary': string;
    '--color-bg-elevated': string;
    
    // Text colors
    '--color-text-primary': string;
    '--color-text-secondary': string;
    '--color-text-tertiary': string;
    '--color-text-inverse': string;
    
    // Border colors
    '--color-border-primary': string;
    '--color-border-secondary': string;
    '--color-border-focus': string;
    
    // Status colors
    '--color-success': string;
    '--color-warning': string;
    '--color-error': string;
    '--color-info': string;
    
    // Shadow colors
    '--color-shadow': string;
    '--color-shadow-hover': string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Map<string, Theme> = new Map();
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;
  
  constructor() {
    this.initializeThemes();
    
    // Load saved theme or default to light
    const savedThemeName = localStorage.getItem('selectedTheme') || 'light';
    const initialTheme = this.themes.get(savedThemeName) || this.themes.get('light')!;
    
    this.currentThemeSubject = new BehaviorSubject<Theme>(initialTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    
    // Apply initial theme
    this.applyTheme(initialTheme);
  }
  
  private initializeThemes(): void {
    // Light Theme
    this.themes.set('light', {
      name: 'light',
      displayName: 'Light',
      properties: {
        '--color-primary': '#1a73e8',
        '--color-primary-hover': '#1765cc',
        '--color-primary-active': '#1557b0',
        
        '--color-secondary': '#5f6368',
        '--color-secondary-hover': '#4a4e52',
        '--color-secondary-active': '#3c4043',
        
        '--color-accent': '#ea4335',
        '--color-accent-hover': '#d33b2c',
        '--color-accent-active': '#b52d1f',
        
        '--color-bg-primary': '#ffffff',
        '--color-bg-secondary': '#f8f9fa',
        '--color-bg-tertiary': '#f1f3f4',
        '--color-bg-elevated': '#ffffff',
        
        '--color-text-primary': '#202124',
        '--color-text-secondary': '#5f6368',
        '--color-text-tertiary': '#80868b',
        '--color-text-inverse': '#ffffff',
        
        '--color-border-primary': '#dadce0',
        '--color-border-secondary': '#e8eaed',
        '--color-border-focus': '#1a73e8',
        
        '--color-success': '#34a853',
        '--color-warning': '#fbbc04',
        '--color-error': '#ea4335',
        '--color-info': '#4285f4',
        
        '--color-shadow': 'rgba(0, 0, 0, 0.1)',
        '--color-shadow-hover': 'rgba(0, 0, 0, 0.2)'
      }
    });
    
    // Dark Theme
    this.themes.set('dark', {
      name: 'dark',
      displayName: 'Dark',
      properties: {
        '--color-primary': '#8ab4f8',
        '--color-primary-hover': '#aecbfa',
        '--color-primary-active': '#669df6',
        
        '--color-secondary': '#9aa0a6',
        '--color-secondary-hover': '#bdc1c6',
        '--color-secondary-active': '#80868b',
        
        '--color-accent': '#f28b82',
        '--color-accent-hover': '#f4a199',
        '--color-accent-active': '#ef7567',
        
        '--color-bg-primary': '#202124',
        '--color-bg-secondary': '#292a2d',
        '--color-bg-tertiary': '#35363a',
        '--color-bg-elevated': '#3c4043',
        
        '--color-text-primary': '#e8eaed',
        '--color-text-secondary': '#9aa0a6',
        '--color-text-tertiary': '#80868b',
        '--color-text-inverse': '#202124',
        
        '--color-border-primary': '#5f6368',
        '--color-border-secondary': '#3c4043',
        '--color-border-focus': '#8ab4f8',
        
        '--color-success': '#81c995',
        '--color-warning': '#fdd663',
        '--color-error': '#f28b82',
        '--color-info': '#8ab4f8',
        
        '--color-shadow': 'rgba(0, 0, 0, 0.3)',
        '--color-shadow-hover': 'rgba(0, 0, 0, 0.5)'
      }
    });
    
    // Blue Theme
    this.themes.set('blue', {
      name: 'blue',
      displayName: 'Ocean Blue',
      properties: {
        '--color-primary': '#0077be',
        '--color-primary-hover': '#006ba6',
        '--color-primary-active': '#005a8b',
        
        '--color-secondary': '#4a90a4',
        '--color-secondary-hover': '#3f7a8c',
        '--color-secondary-active': '#346474',
        
        '--color-accent': '#00a8cc',
        '--color-accent-hover': '#0096b7',
        '--color-accent-active': '#0084a1',
        
        '--color-bg-primary': '#f0f8ff',
        '--color-bg-secondary': '#e6f3ff',
        '--color-bg-tertiary': '#d4e8fc',
        '--color-bg-elevated': '#ffffff',
        
        '--color-text-primary': '#003f5c',
        '--color-text-secondary': '#2c5f7c',
        '--color-text-tertiary': '#5a7f9a',
        '--color-text-inverse': '#ffffff',
        
        '--color-border-primary': '#b8d4e8',
        '--color-border-secondary': '#d4e8fc',
        '--color-border-focus': '#0077be',
        
        '--color-success': '#2e8b57',
        '--color-warning': '#ff8c00',
        '--color-error': '#dc143c',
        '--color-info': '#4169e1',
        
        '--color-shadow': 'rgba(0, 119, 190, 0.1)',
        '--color-shadow-hover': 'rgba(0, 119, 190, 0.2)'
      }
    });
    
    // Purple Theme
    this.themes.set('purple', {
      name: 'purple',
      displayName: 'Royal Purple',
      properties: {
        '--color-primary': '#6b46c1',
        '--color-primary-hover': '#5e3fb0',
        '--color-primary-active': '#52389f',
        
        '--color-secondary': '#9061f9',
        '--color-secondary-hover': '#8454e8',
        '--color-secondary-active': '#7847d7',
        
        '--color-accent': '#e74694',
        '--color-accent-hover': '#d63c84',
        '--color-accent-active': '#c53274',
        
        '--color-bg-primary': '#faf5ff',
        '--color-bg-secondary': '#f3e8ff',
        '--color-bg-tertiary': '#ede0ff',
        '--color-bg-elevated': '#ffffff',
        
        '--color-text-primary': '#2e1065',
        '--color-text-secondary': '#4c1d95',
        '--color-text-tertiary': '#6b46c1',
        '--color-text-inverse': '#ffffff',
        
        '--color-border-primary': '#ddd6fe',
        '--color-border-secondary': '#ede0ff',
        '--color-border-focus': '#6b46c1',
        
        '--color-success': '#10b981',
        '--color-warning': '#f59e0b',
        '--color-error': '#ef4444',
        '--color-info': '#6366f1',
        
        '--color-shadow': 'rgba(107, 70, 193, 0.1)',
        '--color-shadow-hover': 'rgba(107, 70, 193, 0.2)'
      }
    });
    
    // Green Theme
    this.themes.set('green', {
      name: 'green',
      displayName: 'Forest Green',
      properties: {
        '--color-primary': '#059669',
        '--color-primary-hover': '#047857',
        '--color-primary-active': '#065f46',
        
        '--color-secondary': '#10b981',
        '--color-secondary-hover': '#0d9668',
        '--color-secondary-active': '#0a7c55',
        
        '--color-accent': '#84cc16',
        '--color-accent-hover': '#71b012',
        '--color-accent-active': '#5e940f',
        
        '--color-bg-primary': '#f0fdf4',
        '--color-bg-secondary': '#dcfce7',
        '--color-bg-tertiary': '#bbf7d0',
        '--color-bg-elevated': '#ffffff',
        
        '--color-text-primary': '#064e3b',
        '--color-text-secondary': '#047857',
        '--color-text-tertiary': '#059669',
        '--color-text-inverse': '#ffffff',
        
        '--color-border-primary': '#a7f3d0',
        '--color-border-secondary': '#d1fae5',
        '--color-border-focus': '#059669',
        
        '--color-success': '#059669',
        '--color-warning': '#eab308',
        '--color-error': '#dc2626',
        '--color-info': '#0891b2',
        
        '--color-shadow': 'rgba(5, 150, 105, 0.1)',
        '--color-shadow-hover': 'rgba(5, 150, 105, 0.2)'
      }
    });
  }
  
  public getAvailableThemes(): Theme[] {
    return Array.from(this.themes.values());
  }
  
  public getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }
  
  public setTheme(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (theme) {
      this.applyTheme(theme);
      this.currentThemeSubject.next(theme);
      localStorage.setItem('selectedTheme', themeName);
    }
  }
  
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.properties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Add theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${theme.name}`);
  }
  
  public toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const themes = this.getAvailableThemes();
    const currentIndex = themes.findIndex(t => t.name === currentTheme.name);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex].name);
  }

  public getThemeGradientClasses() {
    switch (this.currentThemeSubject.value.name) {
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
        return 'from-blue-500 to-purple-600'; // Default gradient
    }
  }
}