import { Component, OnInit, ViewChild } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { OptionsComponent } from '../options/options.component'; 
import { Options, OptionsService } from '../../services/options.service';

@Component({
  selector: 'weather-card',
  standalone: false,
  templateUrl: './weather-card.html',
})
export class WeatherCard implements OnInit {
  @ViewChild(OptionsComponent) optionsComponent!: OptionsComponent<Options['weather']>;

  weatherData: any = null;
  isLoading: boolean = false;
  error: string | null = null;
  city: string = '';
  showOptions: boolean = false; // Control visibility of options popover
  showCityDropdown: boolean = false; // Control visibility of city dropdown
  cachedCities: string[] = []; // Store cached cities

  constructor(public weatherService: WeatherService) {}

  ngOnInit() {
    // Load city and API key from local storage if available
    this.city = this.weatherService.getSelectedCity();
    this.cachedCities = this.weatherService.getCachedCities();

    // Fetch weather data if both city and API key are available
    if (this.city) {
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
    this.weatherService.setSelectedCity(city);
    this.getWeather();
  }

  onOptionsSubmitted(options: Options['weather']) {
    if (options.city && options.apiKey) {
      this.selectCity(options.city);
    }
    this.showOptions = false;
  }

  getWeather() {
    if (!this.city) {
      this.error = 'Please provide both city and API key.';
      this.weatherData = null;
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.weatherData = null;

    this.weatherService.getWeather(this.city).subscribe({
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
