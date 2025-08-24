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

  weatherDescriptions: { [key: number]: string } = {
    "0": "Unknown",
    "1000": "Clear, Sunny",
    "10000": "Clear, Sunny",
    "10001": "Clear",
    "1001": "Cloudy",
    "10010": "Cloudy",
    "10011": "Cloudy",
    "1100": "Mostly Clear",
    "11000": "Mostly Clear",
    "11001": "Mostly Clear",
    "1101": "Partly Cloudy",
    "11010": "Partly Cloudy",
    "11011": "Partly Cloudy",
    "1102": "Mostly Cloudy",
    "11020": "Mostly Cloudy",
    "11021": "Mostly Cloudy",
    "11030": "Partly Cloudy and Mostly Clear",
    "11031": "Partly Cloudy and Mostly Clear",
    "2000": "Fog",
    "20000": "Fog",
    "20001": "Fog",
    "2100": "Light Fog",
    "21000": "Light Fog",
    "21001": "Light Fog",
    "21010": "Mostly Clear and Light Fog",
    "21011": "Mostly Clear and Light Fog",
    "21020": "Partly Cloudy and Light Fog",
    "21021": "Partly Cloudy and Light Fog",
    "21030": "Mostly Cloudy and Light Fog",
    "21031": "Mostly Cloudy and Light Fog",
    "21060": "Mostly Clear and Fog",
    "21061": "Mostly Clear and Fog",
    "21070": "Partly Cloudy and Fog",
    "21071": "Partly Cloudy and Fog",
    "21080": "Mostly Cloudy and Fog",
    "21081": "Mostly Cloudy and Fog",
    "4000": "Drizzle",
    "40000": "Drizzle",
    "40001": "Drizzle",
    "4001": "Rain",
    "40010": "Rain",
    "40011": "Rain",
    "4200": "Light Rain",
    "42000": "Light Rain",
    "42001": "Light Rain",
    "4201": "Heavy Rain",
    "42010": "Heavy Rain",
    "42011": "Heavy Rain",
    "42020": "Partly Cloudy and Heavy Rain",
    "42021": "Partly Cloudy and Heavy Rain",
    "42030": "Mostly Clear and Drizzle",
    "42031": "Mostly Clear and Drizzle",
    "42040": "Partly Cloudy and Drizzle",
    "42041": "Partly Cloudy and Drizzle",
    "42050": "Mostly Cloudy and Drizzle",
    "42051": "Mostly Cloudy and Drizzle",
    "42080": "Partly Cloudy and Rain",
    "42081": "Partly Cloudy and Rain",
    "42090": "Mostly Clear and Rain",
    "42091": "Mostly Clear and Rain",
    "42100": "Mostly Cloudy and Rain",
    "42101": "Mostly Cloudy and Rain",
    "42110": "Mostly Clear and Heavy Rain",
    "42111": "Mostly Clear and Heavy Rain",
    "42120": "Mostly Cloudy and Heavy Rain",
    "42121": "Mostly Cloudy and Heavy Rain",
    "42130": "Mostly Clear and Light Rain",
    "42131": "Mostly Clear and Light Rain",
    "42140": "Partly Cloudy and Light Rain",
    "42141": "Partly Cloudy and Light Rain",
    "42150": "Mostly Cloudy and Light Rain",
    "42151": "Mostly Cloudy and Light Rain",
    "5000": "Snow",
    "50000": "Snow",
    "50001": "Snow",
    "5001": "Flurries",
    "50010": "Flurries",
    "50011": "Flurries",
    "5100": "Light Snow",
    "51000": "Light Snow",
    "51001": "Light Snow",
    "5101": "Heavy Snow",
    "51010": "Heavy Snow",
    "51011": "Heavy Snow",
    "51020": "Mostly Clear and Light Snow",
    "51021": "Mostly Clear and Light Snow",
    "51030": "Partly Cloudy and Light Snow",
    "51031": "Partly Cloudy and Light Snow",
    "51040": "Mostly Cloudy and Light Snow",
    "51041": "Mostly Cloudy and Light Snow",
    "51050": "Mostly Clear and Snow",
    "51051": "Mostly Clear and Snow",
    "51060": "Partly Cloudy and Snow",
    "51061": "Partly Cloudy and Snow",
    "51070": "Mostly Cloudy and Snow",
    "51071": "Mostly Cloudy and Snow",
    "51080": "Rain and Snow",
    "51081": "Rain and Snow",
    "51100": "Drizzle and Snow",
    "51101": "Drizzle and Snow",
    "51120": "Snow and Ice Pellets",
    "51121": "Snow and Ice Pellets",
    "51140": "Snow and Freezing Rain",
    "51141": "Snow and Freezing Rain",
    "51150": "Mostly Clear and Flurries",
    "51151": "Mostly Clear and Flurries",
    "51160": "Partly Cloudy and Flurries",
    "51161": "Partly Cloudy and Flurries",
    "51170": "Mostly Cloudy and Flurries",
    "51171": "Mostly Cloudy and Flurries",
    "51190": "Mostly Clear and Heavy Snow",
    "51191": "Mostly Clear and Heavy Snow",
    "51200": "Partly Cloudy and Heavy Snow",
    "51201": "Partly Cloudy and Heavy Snow",
    "51210": "Mostly Cloudy and Heavy Snow",
    "51211": "Mostly Cloudy and Heavy Snow",
    "51220": "Drizzle and Light Snow",
    "51221": "Drizzle and Light Snow",
    "6000": "Freezing Drizzle",
    "60000": "Freezing Drizzle",
    "60001": "Freezing Drizzle",
    "6001": "Freezing Rain",
    "60010": "Freezing Rain",
    "60011": "Freezing Rain",
    "60020": "Partly Cloudy and Freezing drizzle",
    "60021": "Partly Cloudy and Freezing drizzle",
    "60030": "Mostly Clear and Freezing drizzle",
    "60031": "Mostly Clear and Freezing drizzle",
    "60040": "Mostly Cloudy and Freezing drizzle",
    "60041": "Mostly Cloudy and Freezing drizzle",
    "6200": "Light Freezing Rain",
    "62000": "Light Freezing Rain",
    "62001": "Light Freezing Rain",
    "6201": "Heavy Freezing Rain",
    "62010": "Heavy Freezing Rain",
    "62011": "Heavy Freezing Rain",
    "62020": "Partly Cloudy and Heavy Freezing Rain",
    "62021": "Partly Cloudy and Heavy Freezing Rain",
    "62030": "Partly Cloudy and Light Freezing Rain",
    "62031": "Partly cloudy and Light Freezing Rain",
    "62040": "Drizzle and Freezing Drizzle",
    "62041": "Drizzle and Freezing Drizzle",
    "62050": "Mostly Clear and Light Freezing Rain",
    "62051": "Mostly Clear and Light Freezing Rain",
    "62060": "Light Rain and Freezing Drizzle",
    "62061": "Light Rain and Freezing Drizzle",
    "62070": "Mostly Clear and Heavy Freezing Rain",
    "62071": "Mostly Clear and Heavy Freezing Rain",
    "62080": "Mostly Cloudy and Heavy Freezing Rain",
    "62081": "Mostly Cloudy and Heavy Freezing Rain",
    "62090": "Mostly Cloudy and Light Freezing Rain",
    "62091": "Mostly Cloudy and Light Freezing Rain",
    "62120": "Drizzle and Freezing Rain",
    "62121": "Drizzle and Freezing Rain",
    "62130": "Mostly Clear and Freezing Rain",
    "62131": "Mostly Clear and Freezing Rain",
    "62140": "Partly Cloudy and Freezing Rain",
    "62141": "Partly Cloudy and Freezing Rain",
    "62150": "Mostly Cloudy and Freezing Rain",
    "62151": "Mostly Cloudy and Freezing Rain",
    "62200": "Light Rain and Freezing Rain",
    "62201": "Light Rain and Freezing Rain",
    "62220": "Rain and Freezing Rain",
    "62221": "Rain and Freezing Rain",
    "7000": "Ice Pellets",
    "70000": "Ice Pellets",
    "70001": "Ice Pellets",
    "7101": "Heavy Ice Pellets",
    "71010": "Heavy Ice Pellets",
    "71011": "Heavy Ice Pellets",
    "7102": "Light Ice Pellets",
    "71020": "Light Ice Pellets",
    "71021": "Light Ice Pellets",
    "71030": "Freezing Rain and Heavy Ice Pellets",
    "71031": "Freezing Rain and Heavy Ice Pellets",
    "71050": "Drizzle and Ice Pellets",
    "71051": "Drizzle and Ice Pellets",
    "71060": "Freezing Rain and Ice Pellets",
    "71061": "Freezing Rain and Ice Pellets",
    "71070": "Partly Cloudy and Ice Pellets",
    "71071": "Partly Cloudy and Ice Pellets",
    "71080": "Mostly Clear and Ice Pellets",
    "71081": "Mostly Clear and Ice Pellets",
    "71090": "Mostly Cloudy and Ice Pellets",
    "71091": "Mostly Cloudy and Ice Pellets",
    "71100": "Mostly Clear and Light Ice Pellets",
    "71101": "Mostly Clear and Light Ice Pellets",
    "71110": "Partly Cloudy and Light Ice Pellets",
    "71111": "Partly Cloudy and Light Ice Pellets",
    "71120": "Mostly Cloudy and Light Ice Pellets",
    "71121": "Mostly Cloudy and Light Ice Pellets",
    "71130": "Mostly Clear and Heavy Ice Pellets",
    "71131": "Mostly Clear and Heavy Ice Pellets",
    "71140": "Partly Cloudy and Heavy Ice Pellets",
    "71141": "Partly Cloudy and Heavy Ice Pellets",
    "71150": "Light Rain and Ice Pellets",
    "71151": "Light Rain and Ice Pellets",
    "71160": "Mostly Cloudy and Heavy Ice Pellets",
    "71161": "Mostly Cloudy and Heavy Ice Pellets",
    "71170": "Rain and Ice Pellets",
    "71171": "Rain and Ice Pellets",
    "8000": "Thunderstorm",
    "80000": "Thunderstorm",
    "80001": "Thunderstorm",
    "80010": "Mostly Clear and Thunderstorm",
    "80011": "Mostly Clear and Thunderstorm",
    "80020": "Mostly Cloudy and Thunderstorm",
    "80021": "Mostly Cloudy and Thunderstorm",
    "80030": "Partly Cloudy and Thunderstorm",
    "80031": "Partly Cloudy and Thunderstorm"
  };
  gradientMap: { [key: number]: string } = {
    // Clear, Sunny
    10000: 'from-blue-300 to-blue-500', // Day
    10001: 'from-indigo-700 to-gray-900', // Night

    // Mostly Clear
    11000: 'from-blue-200 to-blue-400', // Day
    11001: 'from-indigo-600 to-gray-800', // Night

    // Partly Cloudy
    11010: 'from-blue-200 to-blue-300', // Day
    11011: 'from-indigo-500 to-gray-700', // Night

    // Mostly Cloudy, Cloudy
    11020: 'from-gray-300 to-gray-500', // Day
    10010: 'from-gray-400 to-gray-600', // Day
    11021: 'from-gray-600 to-gray-800', // Night
    10011: 'from-gray-700 to-gray-900', // Night

    // Fog
    20000: 'from-gray-400 to-gray-600', // Day
    21000: 'from-gray-300 to-gray-500', // Light Fog Day
    20001: 'from-gray-600 to-gray-800', // Night
    21001: 'from-gray-500 to-gray-700', // Light Fog Night

    // Drizzle, Light Rain, Rain, Heavy Rain
    40000: 'from-gray-400 to-gray-600', // Day
    42000: 'from-gray-400 to-gray-600', // Light Rain Day
    40010: 'from-gray-500 to-gray-700', // Day
    42010: 'from-gray-600 to-gray-800', // Heavy Rain Day
    40001: 'from-gray-700 to-gray-900', // Night
    42001: 'from-gray-700 to-gray-900', // Light Rain Night
    40011: 'from-gray-800 to-gray-900', // Night
    42011: 'from-gray-900 to-black', // Heavy Rain Night

    // Snow, Flurries, Light Snow, Heavy Snow
    50000: 'from-blue-200 to-blue-400', // Day
    50010: 'from-blue-100 to-blue-300', // Flurries Day
    51000: 'from-blue-200 to-blue-400', // Light Snow Day
    51010: 'from-blue-300 to-blue-500', // Heavy Snow Day
    50001: 'from-blue-400 to-blue-600', // Night
    50011: 'from-blue-300 to-blue-500', // Flurries Night
    51001: 'from-blue-400 to-blue-600', // Light Snow Night
    51011: 'from-blue-500 to-blue-700', // Heavy Snow Night

    // Freezing Drizzle, Freezing Rain, Light Freezing Rain, Heavy Freezing Rain
    60000: 'from-blue-300 to-blue-500', // Day
    60010: 'from-blue-400 to-blue-600', // Freezing Rain Day
    62000: 'from-blue-300 to-blue-500', // Light Freezing Rain Day
    62010: 'from-blue-500 to-blue-700', // Heavy Freezing Rain Day
    60001: 'from-blue-500 to-blue-700', // Night
    60011: 'from-blue-600 to-blue-800', // Freezing Rain Night
    62001: 'from-blue-500 to-blue-700', // Light Freezing Rain Night
    62011: 'from-blue-700 to-blue-900', // Heavy Freezing Rain Night

    // Ice Pellets, Light Ice Pellets, Heavy Ice Pellets
    70000: 'from-blue-400 to-blue-600', // Day
    71020: 'from-blue-300 to-blue-500', // Light Ice Pellets Day
    71010: 'from-blue-500 to-blue-700', // Heavy Ice Pellets Day
    70001: 'from-blue-600 to-blue-800', // Night
    71021: 'from-blue-500 to-blue-700', // Light Ice Pellets Night
    71011: 'from-blue-700 to-blue-900', // Heavy Ice Pellets Night

    // Thunderstorm
    80000: 'from-indigo-500 to-indigo-700', // Day
    80001: 'from-indigo-700 to-indigo-900', // Night

    // Default for unknown or unlisted codes
    0: 'from-gray-400 to-gray-600',
  };

  constructor(private http: HttpClient) { }

  private isDay(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18; // Assuming day is 6 AM to 6 PM
  }

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
    return this.weatherDescriptions[codeToUse] || this.weatherDescriptions[weatherCode] || this.weatherDescriptions[0];
  }
  getWeatherGradientClass(weatherCode: number): string {
    const isDay = this.isDay();

    let codeToUse = weatherCode;
    if (isDay) {
      codeToUse = parseInt(`${weatherCode}0`);
    } else {
      codeToUse = parseInt(`${weatherCode}1`);
    }

    return `bg-gradient-to-br ${this.gradientMap[codeToUse] || this.gradientMap[0]} text-white`;
  }
}