import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import FormsModule and ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { App } from './app';
import { BookmarkList } from './components/bookmark-list/bookmark-list';
import { BookmarkService } from './services/bookmark-service';
import { ThemeService } from './services/theme.service';
import { BookmarkSearchBar } from './components/bookmark-search-bar/bookmark-search-bar';
import { BookmarkItem } from './components/bookmark-item/bookmark-item';
import { Layout } from './components/layout/layout';
import { ThemeSwitcher } from './components/theme-switcher/theme-switcher';
import { WeatherCard } from './components/weather-card/weather-card';
import { OptionsComponent } from './components/options/options.component'; // Import OptionsComponent
import { DigitalClockComponent } from './components/digital-clock/digital-clock.component';
import { WallpaperOptionComponent } from './components/wallpaper-option/wallpaper-option.component';
import { ToggleApiKeyVisibilityDirective } from './directives/toggle-api-key-visibility.directive';

@NgModule({
  declarations: [
    App,
    BookmarkList,
    BookmarkSearchBar,
    BookmarkItem,
    Layout,
    ThemeSwitcher,
    WeatherCard,
    OptionsComponent, // Declare OptionsComponent
    DigitalClockComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule, // Add ReactiveFormsModule
    HttpClientModule, // Add HttpClientModule
    WallpaperOptionComponent,
    ToggleApiKeyVisibilityDirective
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    BookmarkService,
    ThemeService
  ],
  bootstrap: [App]
})
export class AppModule { }
