import { Component, Input, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'calendar',
  standalone: false,
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit {
  @Input() highlightedDates: string = ''; // Comma separated string of dates dd-mmm-yyyy

  currentDate: Date = new Date();
  displayMonth: Date = new Date();
  selectedDate: Date | null = null; // To store the actively selected date
  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dates: (Date | null)[] = [];
  defaultWeatherCode: number = 10000; // Default to Clear, Sunny (Day)

  constructor(public themeService: ThemeService) { }

  ngOnInit(): void {
    this.selectedDate = this.currentDate; // Initialize selected date to today
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.dates = [];
    const year = this.displayMonth.getFullYear();
    const month = this.displayMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

    // Fill leading empty slots
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.dates.push(null);
    }

    // Fill days of the month
    for (let i = 1; i <= numDaysInMonth; i++) {
      this.dates.push(new Date(year, month, i));
    }
  }

  prevMonth(): void {
    const newMonth = new Date(this.displayMonth.getFullYear(), this.displayMonth.getMonth() - 1, 1);
    this.displayMonth = newMonth;
    this.generateCalendar();
  }

  nextMonth(): void {
    const newMonth = new Date(this.displayMonth.getFullYear(), this.displayMonth.getMonth() + 1, 1);
    this.displayMonth = newMonth;
    this.generateCalendar();
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    return date.toDateString() === this.currentDate.toDateString();
  }

  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }

  selectDate(date: Date | null): void {
    this.selectedDate = date;
  }

  isHighlighted(date: Date | null): boolean {
    if (!date || !this.highlightedDates) return false;
    const formattedDate = this.formatDate(date);
    return this.highlightedDates.split(',').includes(formattedDate);
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-us', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
