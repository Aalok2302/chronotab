import { Component, OnInit, ViewChild } from '@angular/core';
import { WeatherService } from '../../services/weather.service'; // Import WeatherService
import { OptionsComponent } from '../options/options.component'; // Import OptionsComponent
import { Options } from '../../services/options.service';

@Component({
  selector: 'weather-card',
  standalone: false,
  templateUrl: './weather-card.html',
})
export class WeatherCard implements OnInit {
  @ViewChild (OptionsComponent) optionsComponent!: OptionsComponent<Options['weather']>;

  weatherData: any = null;
  isLoading: boolean = false;
  error: string | null = null;
  city: string = '';
  apiKey: string = '';
  showOptions: boolean = false; // Control visibility of options popover
  showCityDropdown: boolean = false; // Control visibility of city dropdown
  cachedCities: string[] = []; // Store cached cities

  constructor(public weatherService: WeatherService) { }

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
    this.cachedCities = this.weatherService.getCachedCities();

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

  toggleCityDropdown() {
    this.showCityDropdown = !this.showCityDropdown;
  }

  selectCity(city: string) {
    this.city = city;
    localStorage.setItem('weatherCity', this.city);
    this.getWeather();
  }

  onOptionsSubmitted(options: Options['weather']) {
    this.city = options.city;
    this.apiKey = options.apiKey;
    
    localStorage.setItem('weatherCity', this.city);
    localStorage.setItem('weatherApiKey', this.apiKey);

    this.getWeather()
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
        this.weatherService.addCachedCity(this.city);
        this.cachedCities = this.weatherService.getCachedCities();
      },
      error: (err) => {
        console.error('Error fetching weather:', err);
        this.error = 'Failed to fetch weather data. Please check your API key and city.';
        this.isLoading = false;
        this.weatherData = null; // Clear weather data on error
      }
    });
  }

  refreshWeather() {
    this.getWeather();
  }
}
