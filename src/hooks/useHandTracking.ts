'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { getHandLandmarker } from '../lib/mediapipe/handLandmarker';
import { processVideoFrame } from '../lib/mediapipe/handTracking';
import { MultiHandTrackingResult } from '../types/hand';
import { GestureDetectionResult } from '../types/gestures';
import { detectHandGesture } from '../components/gestures/GestureDetector';

export function useHandTracking(isCameraActive: boolean) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHandDetected, setIsHandDetected] = useState(false);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const latestTrackingRef = useRef<MultiHandTrackingResult | null>(null);
  const latestGestureRef = useRef<GestureDetectionResult | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const latencyRef = useRef<number>(0);

  // Initialize MediaPipe model
  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        setError(null);
        const landmarker = await getHandLandmarker();
        if (!isCancelled) {
          landmarkerRef.current = landmarker;
          setIsReady(true);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('MediaPipe initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize MediaPipe Hand Landmarker');
        }
      }
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Process a video frame synchronously inside the render loop
  const processFrame = useCallback((videoElement: HTMLVideoElement | null, timestamp: number): MultiHandTrackingResult | null => {
    if (!landmarkerRef.current || !videoElement || videoElement.readyState < 2) {
      return null;
    }

    const startTime = performance.now();
    try {
      const result = processVideoFrame(landmarkerRef.current, videoElement, timestamp);
      latestTrackingRef.current = result;
      latencyRef.current = Math.round(performance.now() - startTime);

      if (result.primaryHand && result.primaryHand.landmarks) {
        latestGestureRef.current = detectHandGesture(result.primaryHand.landmarks);
      } else {
        latestGestureRef.current = null;
      }

      // Debounce detection state update to React state (only emit if state flipped or every ~200ms)
      const detected = !!result.primaryHand;
      const now = performance.now();
      if (detected !== isHandDetected || now - lastDetectionTimeRef.current > 250) {
        lastDetectionTimeRef.current = now;
        setIsHandDetected(detected);
      }

      return result;
    } catch (e) {
      console.warn('Frame processing dropped:', e);
      return null;
    }
  }, [isHandDetected]);

  return {
    isReady,
    error,
    isHandDetected,
    latestTrackingRef,
    latestGestureRef,
    latencyRef,
    processFrame,
  };
}
