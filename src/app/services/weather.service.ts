import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { App } from '../constants/App.constants';
import { OptionsService } from './options.service';
import { CacheService } from './cache.service';

interface WeatherData {
  data: {
    time: string;
    values: {
      cloudBase: number;
      cloudCeiling: number;
      cloudCover: number;
      dewPoint: number;
      freezingRainIntensity: number;
      humidity: number;
      precipitationProbability: number;
      pressureSurfaceLevel: number;
      rainIntensity: number;
      sleetIntensity: number;
      snowIntensity: number;
      temperature: number;
      temperatureApparent: number;
      uvHealthConcern: number;
      uvIndex: number;
      visibility: number;
      weatherCode: number;
      windDirection: number;
      windGust: number;
      windSpeed: number;
    };
  };
  location: {
    lat: number;
    lon: number;
    name: string;
    type: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private API_KEY_PLACEHOLDER = 'YOUR_TOMORROW_IO_API_KEY'; // Placeholder for API Key
  private BASE_URL = 'https://api.tomorrow.io/v4/weather/realtime';
  private CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  private CACHED_CITIES_KEY = 'cachedWeatherCities';

  constructor(private http: HttpClient, private notificationService: NotificationService, private optionsService: OptionsService, private cache: CacheService) { }

  private isDay(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18; // Assuming day is 6 AM to 6 PM
  }

  getWeather(city: string): Observable<WeatherData> {
    this.notificationService.sendNotification(`Fetching weather for ${city}...`);
    const cacheKey = `weather_${city}`;
    const cachedData = this.cache.getCachedItemByKey(cacheKey, this.CACHE_DURATION);
    if (cachedData) {
      return of(cachedData);
    }
    let params = new HttpParams()
      .set('location', city)
      .set('apikey', this.optionsService.getWeatherOptions().apiKey || this.API_KEY_PLACEHOLDER); // Use provided API key or placeholder

    return this.http.get<WeatherData>(this.BASE_URL, { params }).pipe(
      tap(data => {
        this.cache.setCacheItemByKey(cacheKey, data);
        this.notificationService.sendNotification(`Weather updated for ${city}.`);
      }),
      catchError(error => {
        console.error('Error fetching weather:', error);
        this.notificationService.sendNotification(`Failed to fetch weather for ${city}.`);
        return throwError(() => new Error('Failed to fetch weather.'));
      })
    );
  }

  getWeatherIconPath(weatherCode: number): string {
    const isDay = this.isDay();
    let codeToUse = weatherCode;
    if (isDay) {
      codeToUse = parseInt(`${weatherCode}0`);
    } else {
      codeToUse = parseInt(`${weatherCode}1`);
    }
    return `assets/weather/${codeToUse}@2x.png`;
  }

  getWeatherDescription(weatherCode: number): string {
    const isDay = this.isDay();
    let codeToUse = weatherCode;
    if (isDay) {
      codeToUse = parseInt(`${weatherCode}0`);
    } else {
      codeToUse = parseInt(`${weatherCode}1`);
    }
    return App.WeatherConstant.weatherDescriptions[String(codeToUse)] || App.WeatherConstant.weatherDescriptions[String(weatherCode)] || App.WeatherConstant.weatherDescriptions["0"];
  }

  getWeatherGradientClass(weatherCode: number): string {
    const isDay = this.isDay();
    let codeToUse = weatherCode;
    if (isDay) {
      codeToUse = parseInt(`${weatherCode}0`);
    } else {
      codeToUse = parseInt(`${weatherCode}1`);
    }
    return `bg-gradient-to-br ${App.WeatherConstant.gradientMap[codeToUse] || App.WeatherConstant.gradientMap[0]} text-white`;
  }

  getCachedCities(): string[] {
    const cachedCities = localStorage.getItem(this.CACHED_CITIES_KEY);
    return cachedCities ? JSON.parse(cachedCities) : [];
  }

  addCachedCity(city: string): void {
    const cities = this.getCachedCities();
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem(this.CACHED_CITIES_KEY, JSON.stringify(cities));
    }
  }

  getSelectedCity() {
    const city = localStorage.getItem('weatherCity');
    return city ? city : '';
  }
  setSelectedCity(city: string) {
    localStorage.setItem('weatherCity', city);
  }
}