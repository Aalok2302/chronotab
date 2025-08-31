import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService, Theme } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'digital-clock',
  templateUrl: './digital-clock.component.html',
  styleUrls: ['./digital-clock.component.css'],
  standalone: false
})
export class DigitalClockComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: Date = new Date();
  currentThemeName: string = '';
  private timer: any;
  private themeSubscription: Subscription = new Subscription();

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);

    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      (theme: Theme) => {
        this.currentThemeName = theme.name;
      }
    );
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.themeSubscription.unsubscribe();
  }

  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    this.currentDate = now;
  }
}