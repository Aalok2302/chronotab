import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, skip } from "rxjs/operators";

export interface Options {
    event:string,
    weather: {
        apiKey:string,
        city:string
    },
    wallpaper: {
        pexelsApiKey: string,
        topics: string,
        showBackground: boolean,
        selectedWallpaperUrl: string
    }
}

@Injectable({
    providedIn: 'root'
  })
export class OptionsService {

    private optionsSubject;
    public options$;

    constructor(){
        const weather: Options['weather'] = this.getOptions('weatherOptions', {apiKey:'', city:''});
        const wallpaper: Options['wallpaper'] = this.getOptions('wallpaperOptions', {pexelsApiKey: '', topics: '', showBackground: false, selectedWallpaperUrl: ''});
        this.optionsSubject = new BehaviorSubject<Options>({event:'', weather, wallpaper})
        this.options$ = this.optionsSubject.asObservable().pipe(skip(1));
    }

    private saveOptions(key: string, object:any){
        try{
            localStorage.setItem(key, JSON.stringify(object));
        }catch(error){
            localStorage.setItem(key, '');
        }
    }

    private getOptions<T>(key: string, defaultValue: T): T{
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    }

    public getWeatherOptions(){
        return this.optionsSubject.value.weather;
    }

    public setWeatherOptions(weather:Options['weather']){
        this.saveOptions('weatherOptions', weather);
        this.optionsSubject.next({...this.optionsSubject.value, weather, event:'WEATHER'});
    }

    public getWeatherOptionsEvents():Observable<Options['weather']>{
        return this.options$.pipe(
            filter(options => options.event === 'WEATHER'),
            map(options => options.weather)
        )
    }

    public getWallpaperOptions(){
        return this.optionsSubject.value.weather;
    }

    public setWallpaperOptions(wallpaper:Options['wallpaper']){
        this.saveOptions('wallpaperOptions', wallpaper);
        this.optionsSubject.next({...this.optionsSubject.value, wallpaper, event:'WALLPAPER'});
    }

    public getWallpaperOptionsEvents():Observable<Options['wallpaper']>{
        return this.options$.pipe(
            filter(options => options.event === 'WALLPAPER'),
            map(options => options.wallpaper)
        )
    }
}