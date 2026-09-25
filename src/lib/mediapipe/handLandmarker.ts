import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_CONFIG } from './mediapipeConfig';

let landmarkerInstance: HandLandmarker | null = null;
let initPromise: Promise<HandLandmarker> | null = null;

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (landmarkerInstance) {
    return landmarkerInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // 1. Resolve vision tasks wasm
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_CONFIG.wasmUrl);
      } catch (err) {
        console.warn('Failed primary wasm CDN, attempting fallback:', err);
        vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_CONFIG.fallbackWasmUrl);
      }

      // 2. Attempt model loading with GPU delegate, fallback to CPU
      const createOptions = (modelUrl: string, delegate: 'GPU' | 'CPU') => ({
        baseOptions: {
          modelAssetPath: modelUrl,
          delegate,
        },
        runningMode: 'VIDEO' as const,
        numHands: MEDIAPIPE_CONFIG.numHands,
        minHandDetectionConfidence: MEDIAPIPE_CONFIG.minDetectionConfidence,
        minHandPresenceConfidence: MEDIAPIPE_CONFIG.minPresenceConfidence,
        minTrackingConfidence: MEDIAPIPE_CONFIG.minTrackingConfidence,
      });

      // Try local model first with GPU
      try {
        landmarkerInstance = await HandLandmarker.createFromOptions(
          vision,
          createOptions(MEDIAPIPE_CONFIG.modelPath, 'GPU')
        );
        return landmarkerInstance;
      } catch (err) {
        console.warn('GPU + local model initialization failed, attempting fallback:', err);
      }

      // Try local model with CPU
      try {
        landmarkerInstance = await HandLandmarker.createFromOptions(
          vision,
          createOptions(MEDIAPIPE_CONFIG.modelPath, 'CPU')
        );
        return landmarkerInstance;
      } catch (err) {
        console.warn('Local model with CPU failed, trying CDN model:', err);
      }

      // Try CDN model
      landmarkerInstance = await HandLandmarker.createFromOptions(
        vision,
        createOptions(MEDIAPIPE_CONFIG.cdnModelPath, 'GPU')
      );
      return landmarkerInstance;
    } catch (finalErr) {
      initPromise = null;
      throw new Error(`MediaPipe HandLandmarker initialization failed: ${finalErr instanceof Error ? finalErr.message : String(finalErr)}`);
    }
  })();

  return initPromise;
}

export function disposeHandLandmarker(): void {
  if (landmarkerInstance) {
    try {
      landmarkerInstance.close();
    } catch (e) {
      console.warn('Error closing HandLandmarker:', e);
    }
    landmarkerInstance = null;
    initPromise = null;
  }
}
