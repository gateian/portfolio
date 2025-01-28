import { Vector3 } from 'three';

export enum MapMarkerImageType {
  Queens = 'queens',
  Terrain = 'terrain',
  Combat = 'combat',
}

export interface MapMarkerDefinition {
  type: 'navigate' | 'dialog';
  position: Vector3;
  image?: MapMarkerImageType;
  dialogContent?: React.ReactNode;
  onClick?: () => void;
  pointMode?: boolean;
}
