import { Component, EventEmitter, Output, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OptionsService } from '../../services/options.service';
import { Observable, of, Subscription } from 'rxjs';
import { Options } from '../../services/options.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  standalone: false,
})
export class OptionsComponent<T> implements OnInit{
  @Output() optionsSubmitted = new EventEmitter<T>();
  @Output() closeOptions = new EventEmitter<void>();
  @Input() calledFor:string = '';

  private currentSubscription: Subscription | undefined;

  constructor(private optionsService: OptionsService) { }

  private getOptionsEvent(): Observable<T | undefined> {
    switch(this.calledFor){
      case 'WEATHER': return this.optionsService.getWeatherOptionsEvents() as Observable<T>;
      case 'WALLPAPER': return this.optionsService.getWallpaperOptionsEvents() as Observable<T>;
      default: return of(undefined);
    }
  }

  ngOnInit(): void {
    this.currentSubscription = this.getOptionsEvent().subscribe((options: T | undefined) => {
      if (options) {
        this.optionsSubmitted.emit(options);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
  }

  onClose() {
    this.closeOptions.emit();
  }
}