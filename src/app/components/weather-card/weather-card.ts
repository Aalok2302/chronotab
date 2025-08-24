import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service'; // Import WeatherService
import { OptionsComponent } from '../options/options.component'; // Import OptionsComponent

@Component({
  selector: 'app-weather-card',
  standalone: false,
  templateUrl: './weather-card.html',
})
export class WeatherCard implements OnInit {
  weatherData: any = null;
  isLoading: boolean = false;
  error: string | null = null;
  city: string = '';
  apiKey: string = '';
  showOptions: boolean = false; // Control visibility of options popover

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    // Load city and API key from local storage if available
    const savedCity = localStorage.getItem('weatherCity');
    const savedApiKey = localStorage.getItem('weatherApiKey');

    if (savedCity) {
      this.city = savedCity;
    }
    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }

    // Fetch weather data if both city and API key are available
    if (this.city && this.apiKey) {
      this.getWeather();
    } else {
      this.showOptions = true; // Show options if no config found
    }
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  onOptionsSubmitted(options: { city: string; apiKey: string }) {
    this.city = options.city;
    this.apiKey = options.apiKey;
    localStorage.setItem('weatherCity', this.city);
    localStorage.setItem('weatherApiKey', this.apiKey);
    this.getWeather();
    this.showOptions = false; // Close options after submission
  }

  getWeather() {
    if (!this.city || !this.apiKey) {
      this.error = 'Please provide both city and API key.';
      this.weatherData = null; // Clear previous weather data
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.weatherData = null;

    this.weatherService.getWeather(this.city, this.apiKey).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching weather:', err);
        this.error = 'Failed to fetch weather data. Please check your API key and city.';
        this.isLoading = false;
        this.weatherData = null; // Clear weather data on error
      }
    });
  }

  getWeatherIconPath(weatherCode: number): string {
    // Map weatherCode to local asset path with the format ${CODE}.png (low resolution)
    return `assets/weather/${weatherCode}.png`;
  }
}
