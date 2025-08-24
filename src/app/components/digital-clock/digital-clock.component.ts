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
  currentThemeName: string = '';
  private timer: any;
  private themeSubscription: Subscription = new Subscription();

  constructor(private themeService: ThemeService) {}

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
  }

  getThemeGradientClasses() {
    switch (this.currentThemeName) {
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