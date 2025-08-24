export interface Wallpaper {
  originalHD: string;
  large2xHD: string;
  largeHD: string;
  mediumHD: string;
  id: number;
  photographer: string;
  alt: string;
  width: number;
  height: number;
  avgColor: string;
  photoURL: string;
}

export interface FavoriteWallpaper {
  id: number;
  title: string;
  url: string;
  photographer: string;
  avgColor: string;
}