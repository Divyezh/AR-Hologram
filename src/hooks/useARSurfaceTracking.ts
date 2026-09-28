'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export type SurfaceType = 'desk' | 'road';

export interface ARSurfaceTrackingState {
  scanStatus: 'scanning' | 'locked';
  hasGyro: boolean;
  isTiltTowardsRoad: boolean;
  roadAnchor: [number, number, number];
  targetPosition: [number, number, number];
  cameraRotation: [number, number, number];
  surfaceConfidence: number;
  isPikachuVisible: boolean;
  offscreenDirection: 'none' | 'left' | 'right' | 'up' | 'down';
  surfaceType: SurfaceType;
  setSurfaceType: (type: SurfaceType) => void;
  requestGyroPermission: () => Promise<boolean>;
  placeOnRoad: (clientX: number, clientY: number, containerRect: DOMRect) => [number, number, number];
  setManualRotation: (deltaPitch: number, deltaYaw: number) => void;
  rescanRoad: () => void;
  confirmSpawn: () => void;
}

// Preset heights for different real-world surfaces
const SURFACE_PRESETS = {
  desk: {
    height: -0.45, // Desk level relative to eye/webcam (~45cm below)
    distance: 1.5, // 1.5m distance in front
    initialPos: [0.3, -0.45, -1.5] as [number, number, number],
    initialPitch: -0.15, // ~8 deg down towards desk
  },
  road: {
    height: -1.15, // Ground / road level (~1.15m below)
    distance: 2.5, // 2.5m distance ahead
    initialPos: [0, -1.15, -2.5] as [number, number, number],
    initialPitch: -0.22, // ~12 deg down towards road
  },
};

export function useARSurfaceTracking(
  initialAutoPlaceDelayMs: number = 1200,
  defaultSurface: SurfaceType = 'desk'
): ARSurfaceTrackingState {
  const [surfaceType, setSurfaceTypeState] = useState<SurfaceType>(defaultSurface);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'locked'>('locked'); // Always locked & visible on mount
  const [hasGyro, setHasGyro] = useState<boolean>(false);
  const [isTiltTowardsRoad, setIsTiltTowardsRoad] = useState<boolean>(true);
  const [surfaceConfidence, setSurfaceConfidence] = useState<number>(1.0);

  const activePreset = SURFACE_PRESETS[surfaceType];

  // Fixed 3D world anchor for Pikachu
  const [roadAnchor, setRoadAnchor] = useState<[number, number, number]>(activePreset.initialPos);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>(activePreset.initialPos);
  const [cameraRotation, setCameraRotation] = useState<[number, number, number]>([
    activePreset.initialPitch,
    0,
    0,
  ]);

  // Visibility and off-screen detection: default TRUE
  const [isPikachuVisible, setIsPikachuVisible] = useState<boolean>(true);
  const [offscreenDirection, setOffscreenDirection] = useState<'none' | 'left' | 'right' | 'up' | 'down'>('none');

  // Motion smoothing refs
  const smoothEulerRef = useRef<{ pitch: number; yaw: number; roll: number }>({
    pitch: activePreset.initialPitch,
    yaw: 0,
    roll: 0,
  });
  const initialAlphaRef = useRef<number | null>(null);
  const manualOffsetRef = useRef<{ pitch: number; yaw: number }>({ pitch: 0, yaw: 0 });
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch surface type (Desk vs Road/Floor)
  const setSurfaceType = useCallback((type: SurfaceType) => {
    setSurfaceTypeState(type);
    const preset = SURFACE_PRESETS[type];
    setRoadAnchor(preset.initialPos);
    setTargetPosition(preset.initialPos);
    smoothEulerRef.current.pitch = preset.initialPitch;
    setCameraRotation([preset.initialPitch, smoothEulerRef.current.yaw, 0]);
    setIsPikachuVisible(true);
    setOffscreenDirection('none');
  }, []);

  // Request gyroscope permission for iOS 13+ devices
  const requestGyroPermission = useCallback(async (): Promise<boolean> => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceOrientation permission error:', err);
        return false;
      }
    }
    return true;
  }, []);

  // Place Pikachu directly where the user clicks or taps on the screen / surface!
  const placeOnRoad = useCallback(
    (clientX: number, clientY: number, containerRect: DOMRect): [number, number, number] => {
      const ndcX = ((clientX - containerRect.left) / containerRect.width) * 2 - 1;
      const ndcY = -(((clientY - containerRect.top) / containerRect.height) * 2 - 1);

      const aspect = containerRect.width / containerRect.height;
      const fovRad = (50 * Math.PI) / 180;
      const halfFOV = Math.tan(fovRad / 2);

      const currentDistance = surfaceType === 'desk' ? 1.5 : 2.5;
      const currentHeight = surfaceType === 'desk' ? -0.45 : -1.15;

      // Direct ray mapping: clicking on the screen projects Pikachu right at that screen location!
      const targetWorldX = ndcX * halfFOV * aspect * currentDistance;
      const targetWorldY = THREE.MathUtils.clamp(
        ndcY * halfFOV * currentDistance,
        currentHeight - 0.25,
        currentHeight + 0.35
      );
      const targetWorldZ = -currentDistance;

      const newPos: [number, number, number] = [targetWorldX, targetWorldY, targetWorldZ];
      setRoadAnchor(newPos);
      setTargetPosition(newPos);
      setScanStatus('locked');
      setSurfaceConfidence(1.0);
      setIsPikachuVisible(true);
      setOffscreenDirection('none');
      return newPos;
    },
    [surfaceType]
  );

  // Manual drag support (desktop or finger pan)
  const setManualRotation = useCallback((deltaPitch: number, deltaYaw: number) => {
    manualOffsetRef.current.pitch = Math.max(-1.4, Math.min(0.7, manualOffsetRef.current.pitch + deltaPitch));
    manualOffsetRef.current.yaw += deltaYaw;
  }, []);

  const confirmSpawn = useCallback(() => {
    setScanStatus('locked');
    setSurfaceConfidence(1.0);
    setIsPikachuVisible(true);
  }, []);

  const rescanRoad = useCallback(() => {
    setScanStatus('scanning');
    setSurfaceConfidence(0.5);
    // On rescan, place Pikachu right in the center view
    const preset = SURFACE_PRESETS[surfaceType];
    setRoadAnchor(preset.initialPos);
    setTargetPosition(preset.initialPos);
    setIsPikachuVisible(true);
    setOffscreenDirection('none');
  }, [surfaceType]);

  // Update visibility and offscreen guidance (only for active mobile gyroscope!)
  const updateVisibilityAndGuidance = useCallback((pitch: number, yaw: number, anchor: [number, number, number]) => {
    // If device does not have a physical gyroscope moving (e.g. desktop webcam), ALWAYS keep Pikachu visible!
    if (!hasGyro) {
      setIsPikachuVisible(true);
      setOffscreenDirection('none');
      return;
    }

    const pitchDeg = THREE.MathUtils.radToDeg(pitch);
    const anchorX = anchor[0];
    const anchorZ = anchor[2];
    const angleToAnchor = Math.atan2(anchorX, -anchorZ);

    let relYaw = angleToAnchor - yaw;
    while (relYaw > Math.PI) relYaw -= Math.PI * 2;
    while (relYaw < -Math.PI) relYaw += Math.PI * 2;
    const relYawDeg = THREE.MathUtils.radToDeg(relYaw);

    // On mobile phone with gyro, check if looking far away
    if (pitchDeg > 25) {
      setOffscreenDirection('down');
      setIsPikachuVisible(false);
    } else if (relYawDeg > 42) {
      setOffscreenDirection('right');
      setIsPikachuVisible(false);
    } else if (relYawDeg < -42) {
      setOffscreenDirection('left');
      setIsPikachuVisible(false);
    } else {
      setOffscreenDirection('none');
      setIsPikachuVisible(true);
    }
  }, [hasGyro]);

  // Device orientation / Gyroscope listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      setHasGyro(true);

      const beta = e.beta;
      const gamma = e.gamma;
      const alpha = e.alpha ?? 0;

      if (initialAlphaRef.current === null && e.alpha !== null) {
        initialAlphaRef.current = alpha;
      }

      const targetPitchDeg = THREE.MathUtils.clamp(beta - 90, -85, 45);
      const rawPitch = THREE.MathUtils.degToRad(targetPitchDeg) + manualOffsetRef.current.pitch;

      let deltaAlpha = alpha - (initialAlphaRef.current ?? alpha);
      while (deltaAlpha > 180) deltaAlpha -= 360;
      while (deltaAlpha < -180) deltaAlpha += 360;
      const rawYaw = THREE.MathUtils.degToRad(-deltaAlpha) + manualOffsetRef.current.yaw;

      const rawRoll = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(-gamma * 0.5, -45, 45));

      const lerpFactor = 0.22;
      smoothEulerRef.current.pitch = THREE.MathUtils.lerp(smoothEulerRef.current.pitch, rawPitch, lerpFactor);
      smoothEulerRef.current.yaw = THREE.MathUtils.lerp(smoothEulerRef.current.yaw, rawYaw, lerpFactor);
      smoothEulerRef.current.roll = THREE.MathUtils.lerp(smoothEulerRef.current.roll, rawRoll, lerpFactor);

      setCameraRotation([
        smoothEulerRef.current.pitch,
        smoothEulerRef.current.yaw,
        smoothEulerRef.current.roll,
      ]);

      updateVisibilityAndGuidance(smoothEulerRef.current.pitch, smoothEulerRef.current.yaw, roadAnchor);
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [roadAnchor, updateVisibilityAndGuidance]);

  return {
    scanStatus,
    hasGyro,
    isTiltTowardsRoad,
    roadAnchor,
    targetPosition,
    cameraRotation,
    surfaceConfidence,
    isPikachuVisible,
    offscreenDirection,
    surfaceType,
    setSurfaceType,
    requestGyroPermission,
    placeOnRoad,
    setManualRotation,
    rescanRoad,
    confirmSpawn,
  };
}
