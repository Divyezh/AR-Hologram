'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ARScene } from './ARScene';
import { HandLandmarks } from '../hand-tracking/HandLandmarks';
import { TrackingDebug } from '../hand-tracking/TrackingDebug';
import { GestureManager } from '../gestures/GestureManager';
import { AnimationController } from '../animations/AnimationController';
import { PalmAnchor } from '../../types/palm';
import { MultiHandTrackingResult, NormalizedLandmark } from '../../types/hand';
import { GestureDetectionResult } from '../../types/gestures';
import { EffectConfig } from '../../types/effects';
import { ViewportDimensions } from '../../lib/ar/coordinateMapping';
import { FPSTracker } from '../../lib/utils/performance';

interface AROverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraActive: boolean;
  isMirrored: boolean;
  debugMode: boolean;
  selectedEffect: EffectConfig;
  selectedCharacterId: string;
  selectedAnimationId: string;
  particlesEnabled: boolean;
  anchorRef: React.MutableRefObject<PalmAnchor>;
  processFrame: (video: HTMLVideoElement | null, timestamp: number) => MultiHandTrackingResult | null;
  updateAnchor: (tracking: MultiHandTrackingResult | null, dimensions: ViewportDimensions) => PalmAnchor;
  latestTrackingRef: React.MutableRefObject<MultiHandTrackingResult | null>;
  latestGestureRef: React.MutableRefObject<GestureDetectionResult | null>;
  latencyRef: React.MutableRefObject<number>;
  onTriggerAnimation: (anim: string) => void;
  onTelemetryUpdate: (fps: number, latency: number, isHandDetected: boolean, handSide: 'Left' | 'Right' | null) => void;
}

export const AROverlay: React.FC<AROverlayProps> = ({
  videoRef,
  isCameraActive,
  isMirrored,
  debugMode,
  selectedEffect,
  selectedCharacterId,
  selectedAnimationId,
  particlesEnabled,
  anchorRef,
  processFrame,
  updateAnchor,
  latestTrackingRef,
  latestGestureRef,
  latencyRef,
  onTriggerAnimation,
  onTelemetryUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    containerWidth: 1280,
    containerHeight: 720,
    videoWidth: 1280,
    videoHeight: 720,
    isMirrored: true,
  });

  const fpsTrackerRef = useRef(new FPSTracker());
  const [debugLandmarks, setDebugLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [debugGesture, setDebugGesture] = useState<GestureDetectionResult | null>(null);
  const [currentFps, setCurrentFps] = useState(60);

  // ResizeObserver on the AR viewport container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const video = videoRef.current;
        const vWidth = video?.videoWidth || 1280;
        const vHeight = video?.videoHeight || 720;

        setDimensions({
          containerWidth: Math.round(width),
          containerHeight: Math.round(height),
          videoWidth: vWidth,
          videoHeight: vHeight,
          isMirrored,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [videoRef, isMirrored]);

  // Update dimensions when mirror mode or video resolution changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setDimensions((prev) => ({
        ...prev,
        videoWidth: video.videoWidth || prev.videoWidth,
        videoHeight: video.videoHeight || prev.videoHeight,
        isMirrored,
      }));
    }
  }, [isMirrored, videoRef]);

  // Main high-frequency tracking & anchor loop
  useEffect(() => {
    if (!isCameraActive) return;

    let animId: number;
    let lastUiSync = 0;

    const loop = (timestamp: number) => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        // Run MediaPipe frame inference
        const trackingResult = processFrame(video, timestamp);

        // Update 3D Palm Anchor with coordinate mapping & smoothing
        updateAnchor(trackingResult, dimensions);

        // Track FPS
        const fps = fpsTrackerRef.current.tick();

        // Sync low-frequency debug UI (~8fps to prevent UI sluggishness)
        if (timestamp - lastUiSync > 120) {
          lastUiSync = timestamp;
          setCurrentFps(fps);

          const primaryHand = trackingResult?.primaryHand || null;
          const detected = !!primaryHand;
          const handSide = primaryHand?.handedness || null;

          if (debugMode) {
            setDebugLandmarks(primaryHand?.landmarks || null);
            setDebugGesture(latestGestureRef.current);
          } else {
            setDebugGesture(latestGestureRef.current);
          }

          onTelemetryUpdate(fps, latencyRef.current, detected, handSide);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    isCameraActive,
    videoRef,
    dimensions,
    processFrame,
    updateAnchor,
    debugMode,
    latestGestureRef,
    latencyRef,
    onTelemetryUpdate,
  ]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Three.js R3F Transparent AR Canvas */}
      <ARScene
        anchorRef={anchorRef}
        effect={selectedEffect}
        characterId={selectedCharacterId}
        animationName={selectedAnimationId}
        particlesEnabled={particlesEnabled}
      />

      {/* 2D Debug Landmarks Canvas (active when debugMode is ON) */}
      <HandLandmarks
        landmarks={debugLandmarks}
        dimensions={dimensions}
        isVisible={debugMode && isCameraActive}
      />

      {/* Telemetry Debug HUD */}
      <TrackingDebug
        palmAnchor={anchorRef.current}
        handResult={latestTrackingRef.current?.primaryHand || null}
        fps={currentFps}
        latencyMs={latencyRef.current}
        isVisible={debugMode && isCameraActive}
      />

      {/* Floating Active Gesture Badge */}
      <div className="absolute top-20 right-4 z-20 pointer-events-none">
        <GestureManager gestureData={debugGesture} isVisible={isCameraActive} />
      </div>

      {/* Controller to trigger animations on gestures */}
      <AnimationController
        gestureData={debugGesture}
        onTriggerAnimation={onTriggerAnimation}
      />
    </div>
  );
};
