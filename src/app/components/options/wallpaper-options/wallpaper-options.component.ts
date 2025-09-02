import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Options, OptionsService } from '../../../services/options.service';
import { WallpaperService } from '../../../services/wallpaper.service';
import { Wallpaper } from '../../../../types/wallpaper';

@Component({
    selector: 'wallpaper-options',
    templateUrl: './wallpaper-options.component.html',
    standalone: false,
})
export class WallpaperOptionsComponent implements OnInit {
    @Output() closeOptions = new EventEmitter<void>();
    favoriteWallpapers: Wallpaper[] = [];
    favWallpaperId: string | null = null;

    wallpaperForm!: FormGroup;

    constructor(private optionsService: OptionsService, private wallpaperService: WallpaperService, private fb: FormBuilder) { }

    ngOnInit(): void {
        const {pexelsApiKey, favWallpaperId, showBackground, topics} = this.optionsService.getWallpaperOptions();
        this.favoriteWallpapers = this.wallpaperService.favWallpapers;
        this.wallpaperForm = this.fb.group({
            pexelsApiKey: [pexelsApiKey ? pexelsApiKey : '', Validators.required],
            topics: [topics ? topics : '', Validators.required],
            showBackground: [showBackground ? showBackground : true],
            favWallpaperId: [favWallpaperId ? favWallpaperId : '']
        });
    }

    onSelectFavoriteWallpaper(): void {
        const selectedUrl = this.wallpaperForm.get('favWallpaperId')?.value;
        if (selectedUrl === '') {
          this.wallpaperService.saveFavoriteWallpaper(null as any);
        } else {
          const selectedFav = this.favoriteWallpapers.find(fav => fav.id + '' === selectedUrl);
          if (selectedFav) {
            this.wallpaperService.saveFavoriteWallpaper(selectedFav);
          }
        }
    }

    onSubmit() {
        if (this.wallpaperForm.valid) {
          const options:Options['wallpaper'] = {
            pexelsApiKey: this.wallpaperForm.value['pexelsApiKey'],
            favWallpaperId: this.wallpaperForm.value['favWallpaperId'],
            showBackground: this.wallpaperForm.value['showBackground'],
            topics: this.wallpaperForm.value['topics'],
          }
          this.optionsService.setWallpaperOptions(options);
        }
      }

}