import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import FormsModule and ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { App } from './app';
import { BookmarkList } from './components/bookmark/bookmark-list/bookmark-list';
import { BookmarkService } from './services/bookmark.service';
import { ThemeService } from './services/theme.service';
import { BookmarkSearchBar } from './components/bookmark/bookmark-search-bar/bookmark-search-bar';
import { BookmarkItem } from './components/bookmark/bookmark-item/bookmark-item';
import { Layout } from './components/layout/layout';
import { ThemeSwitcher } from './components/theme-switcher/theme-switcher';
import { WeatherCard } from './components/weather-card/weather-card';
import { OptionsComponent } from './components/options/options.component'; // Import OptionsComponent
import { DigitalClockComponent } from './components/digital-clock/digital-clock.component';
import { WallpaperOptionComponent } from './components/wallpaper-option/wallpaper-option.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ToggleApiKeyVisibilityDirective } from './directives/toggle-api-key-visibility.directive';
import { Calendar } from './components/calendar/calendar';
import { WeatherOptionsComponent } from './components/options/weather-options/weather-options.component';

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
    DigitalClockComponent,
    WallpaperOptionComponent,
    NotificationComponent,
    Calendar,
    WeatherOptionsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
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
