export type GestureType =
  | 'NONE'
  | 'OPEN_PALM'
  | 'FIST'
  | 'POINT'
  | 'PEACE'
  | 'PINCH'
  | 'THUMBS_UP'
  | 'ROCK';

export interface GestureDetectionResult {
  gesture: GestureType;
  confidence: number;
  pinchDistance?: number;
  extendedFingers: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}
