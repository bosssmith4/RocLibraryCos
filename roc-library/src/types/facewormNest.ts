export interface MapMarker {
  id: string;
  name: string;
  type: 'property' | 'mini_boss' | 'boss';
  coordinates: [number, number]; // [x, y]: the cell the game shows
  description: string;
  imagePath?: string;
  level?: number;
  drops?: string[];
  stage?: number;
}

export interface GuidePath {
  id: string;
  name: string;
  coordinates: [number, number][];
  weight?: number;
  stage?: number; // Map stage (1-4), undefined = show in all stages
}

export interface FacewormNestMapData {
  mapName: string;
  center: [number, number];
  zoom: number;
  warp: MapMarker[];
  treasure: MapMarker[];
  miniBosses: MapMarker[];
  bosses: MapMarker[];
  paths?: GuidePath[];
}
