import { CAMERA_CONFIG } from '../../config/camera.config';

export const MEDIAPIPE_CONFIG = {
  wasmUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm',
  fallbackWasmUrl: 'https://unpkg.com/@mediapipe/tasks-vision@0.10.20/wasm',
  modelPath: CAMERA_CONFIG.localModelPath,
  cdnModelPath: CAMERA_CONFIG.cdnModelPath,
  numHands: 2,
  minDetectionConfidence: 0.5,
  minPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
};
