export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export type Handedness = 'Left' | 'Right';

export interface HandTrackingResult {
  detected: boolean;
  handedness: Handedness | null;
  landmarks: NormalizedLandmark[];
  worldLandmarks?: NormalizedLandmark[];
  confidence: number;
  timestamp: number;
}

export interface MultiHandTrackingResult {
  hands: HandTrackingResult[];
  primaryHand: HandTrackingResult | null;
  timestamp: number;
}
