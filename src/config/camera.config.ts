export const CAMERA_CONFIG = {
  defaultFacingMode: 'user' as const,
  idealWidth: 1280,
  idealHeight: 720,
  idealFrameRate: 60,
  fallbackWidth: 640,
  fallbackHeight: 480,
  mirroredDefault: true,
  mediaPipeCdnWasm: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm',
  localModelPath: '/models/hand_landmarker.task',
  cdnModelPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
};
