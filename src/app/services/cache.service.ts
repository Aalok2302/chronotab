import { Injectable } from "@angular/core";
import { of } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CacheService {


    public getCachedItemByKey(cacheKey: string, cacheDuration: number) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            if (Date.now() - timestamp < cacheDuration) {
                return data;
            } else {
                localStorage.removeItem(cacheKey);
                return null;
            }
        }
        return null;
    }

    public setCacheItemByKey(cacheKey:string, data:any){
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }))
    }

}