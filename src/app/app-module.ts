import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { App } from './app';
import { BookmarkListComponent } from './components/bookmark-list-component/bookmark-list-component';
import { BookmarkService } from './services/bookmark-service';

@NgModule({
  declarations: [
    App,
    BookmarkListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    BookmarkService
  ],
  bootstrap: [App]
})
export class AppModule { }
