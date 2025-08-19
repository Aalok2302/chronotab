import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { App } from './app';
import { BookmarkList } from './components/bookmark-list/bookmark-list';
import { BookmarkService } from './services/bookmark-service';
import { ThemeService } from './services/theme.service';
import { BookmarkSearchBar } from './components/bookmark-search-bar/bookmark-search-bar';
import { BookmarkItem } from './components/bookmark-item/bookmark-item';
import { Layout } from './components/layout/layout';
import { ThemeSwitcher } from './components/theme-switcher/theme-switcher';

@NgModule({
  declarations: [
    App,
    BookmarkList,
    BookmarkSearchBar,
    BookmarkItem,
    Layout,
    ThemeSwitcher,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    BookmarkService,
    ThemeService
  ],
  bootstrap: [App]
})
export class AppModule { }
