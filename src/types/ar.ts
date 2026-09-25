export interface ARStudioState {
  // Camera & Tracking status
  isCameraActive: boolean;
  isModelLoaded: boolean;
  isTrackingReady: boolean;
  isHandDetected: boolean;
  activeHandSide: 'Left' | 'Right' | null;

  // Selected Options
  selectedCharacterId: string;
  selectedEffectId: string;
  selectedAnimationId: string;

  // Control toggles
  debugMode: boolean;
  isMirrored: boolean;
  effectsIntensity: number;
  particlesEnabled: boolean;
  audioFeedback: boolean;

  // Performance telemetry
  fps: number;
  detectionLatency: number;
}
