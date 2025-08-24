import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

  constructor(private http: HttpClient) { }

  getWeather(city: string, apiKey: string): Observable<WeatherData> {
    const cacheKey = `weather_${city}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        console.log('Returning cached weather data for', city);
        return of(data);
      } else {
        console.log('Cached weather data expired for', city);
        localStorage.removeItem(cacheKey);
      }
    }

    let params = new HttpParams()
      .set('location', city)
      .set('apikey', apiKey || this.API_KEY_PLACEHOLDER); // Use provided API key or placeholder

    return this.http.get<WeatherData>(this.BASE_URL, { params }).pipe(
      tap(data => {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
      })
    );
  }
}