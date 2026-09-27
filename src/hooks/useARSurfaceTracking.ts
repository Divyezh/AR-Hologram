'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export interface ARSurfaceTrackingState {
  scanStatus: 'scanning' | 'locked';
  hasGyro: boolean;
  isTiltTowardsRoad: boolean;
  roadAnchor: [number, number, number];
  targetPosition: [number, number, number];
  cameraRotation: [number, number, number]; // pitch, yaw, roll in radians for Three.js
  surfaceConfidence: number; // 0 to 1
  requestGyroPermission: () => Promise<boolean>;
  placeOnRoad: (clientX: number, clientY: number, containerRect: DOMRect) => [number, number, number];
  rescanRoad: () => void;
  confirmSpawn: () => void;
}

const DEFAULT_ROAD_HEIGHT = -1.1; // Ground plane height relative to camera
const DEFAULT_INITIAL_POS: [number, number, number] = [0, DEFAULT_ROAD_HEIGHT, -2.5];

export function useARSurfaceTracking(initialAutoPlaceDelayMs: number = 1800): ARSurfaceTrackingState {
  const [scanStatus, setScanStatus] = useState<'scanning' | 'locked'>('scanning');
  const [hasGyro, setHasGyro] = useState<boolean>(false);
  const [isTiltTowardsRoad, setIsTiltTowardsRoad] = useState<boolean>(false);
  const [surfaceConfidence, setSurfaceConfidence] = useState<number>(0.2);

  // Road anchor in 3D world space
  const [roadAnchor, setRoadAnchor] = useState<[number, number, number]>(DEFAULT_INITIAL_POS);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>(DEFAULT_INITIAL_POS);
  const [cameraRotation, setCameraRotation] = useState<[number, number, number]>([0, 0, 0]);

  // Motion smoothing refs
  const smoothEulerRef = useRef<{ pitch: number; yaw: number; roll: number }>({ pitch: 0, yaw: 0, roll: 0 });
  const initialAlphaRef = useRef<number | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Raycast screen coordinates to horizontal road plane (Y = DEFAULT_ROAD_HEIGHT)
  const placeOnRoad = useCallback(
    (clientX: number, clientY: number, containerRect: DOMRect): [number, number, number] => {
      const ndcX = ((clientX - containerRect.left) / containerRect.width) * 2 - 1;
      const ndcY = -(((clientY - containerRect.top) / containerRect.height) * 2 - 1);

      // Camera FOV 50 deg, aspect ratio
      const aspect = containerRect.width / containerRect.height;
      const fovRad = (50 * Math.PI) / 180;
      const vFOV = 2 * Math.tan(fovRad / 2);

      // Ray direction in camera local space
      const rayDir = new THREE.Vector3(
        (ndcX * (vFOV * aspect)) / 2,
        (ndcY * vFOV) / 2,
        -1
      ).normalize();

      // Apply current camera tilt/rotation
      const euler = new THREE.Euler(
        smoothEulerRef.current.pitch,
        smoothEulerRef.current.yaw,
        0,
        'YXZ'
      );
      rayDir.applyEuler(euler);

      // Intersect with horizontal road plane Y = DEFAULT_ROAD_HEIGHT
      // Ray: P = O + t * D. We want P.y = DEFAULT_ROAD_HEIGHT.
      // 0 + t * rayDir.y = DEFAULT_ROAD_HEIGHT => t = DEFAULT_ROAD_HEIGHT / rayDir.y
      let worldX = 0;
      let worldZ = -2.5;

      if (rayDir.y < -0.05) {
        const t = DEFAULT_ROAD_HEIGHT / rayDir.y;
        worldX = Math.max(-2.5, Math.min(2.5, rayDir.x * t));
        worldZ = Math.max(-5.5, Math.min(-1.3, rayDir.z * t));
      } else {
        // Fallback for near-horizon taps
        worldX = Math.max(-2.0, Math.min(2.0, ndcX * 2.0));
        worldZ = Math.max(-4.5, Math.min(-1.8, -2.5 - (ndcY + 0.3) * 1.8));
      }

      const newPos: [number, number, number] = [worldX, DEFAULT_ROAD_HEIGHT, worldZ];
      setRoadAnchor(newPos);
      setTargetPosition(newPos);
      setScanStatus('locked');
      setSurfaceConfidence(1.0);
      return newPos;
    },
    []
  );

  const confirmSpawn = useCallback(() => {
    setScanStatus('locked');
    setSurfaceConfidence(1.0);
  }, []);

  const rescanRoad = useCallback(() => {
    setScanStatus('scanning');
    setSurfaceConfidence(0.3);
  }, []);

  // Listen to device motion & orientation (gyroscope)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let roadStableFrames = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      setHasGyro(true);

      const beta = e.beta; // Pitch [-180, 180]. When tilted forward pointing at the road/ground, beta is ~35° to 75°
      const gamma = e.gamma; // Roll [-90, 90]
      const alpha = e.alpha || 0; // Compass Yaw [0, 360]

      if (initialAlphaRef.current === null && alpha !== null) {
        initialAlphaRef.current = alpha;
      }
      const relYaw = ((alpha - (initialAlphaRef.current || 0)) * Math.PI) / 180;

      // Convert degrees to camera pitch (looking down towards ground = positive pitch)
      // When phone is vertical (beta = 90), pitch = 0.
      // When phone tilts forward towards road (beta = 45), pitch = +45 deg down.
      const rawPitch = THREE.MathUtils.degToRad(Math.max(-45, Math.min(65, 80 - beta)));
      const rawRoll = THREE.MathUtils.degToRad(Math.max(-30, Math.min(30, gamma * 0.4)));

      // Smooth with low-pass filter
      const lerpFactor = 0.18;
      smoothEulerRef.current.pitch = THREE.MathUtils.lerp(smoothEulerRef.current.pitch, rawPitch, lerpFactor);
      smoothEulerRef.current.yaw = THREE.MathUtils.lerp(smoothEulerRef.current.yaw, -relYaw * 0.5, lerpFactor);
      smoothEulerRef.current.roll = THREE.MathUtils.lerp(smoothEulerRef.current.roll, rawRoll, lerpFactor);

      setCameraRotation([
        smoothEulerRef.current.pitch,
        smoothEulerRef.current.yaw,
        smoothEulerRef.current.roll,
      ]);

      // Detect if user is pointing camera down at the road or land
      const isPointingAtRoad = beta >= 25 && beta <= 85;
      setIsTiltTowardsRoad(isPointingAtRoad);

      if (isPointingAtRoad) {
        roadStableFrames++;
        setSurfaceConfidence((prev) => Math.min(1.0, prev + 0.04));

        // Once the camera has steadily tracked the road for a moment, auto-lock surface
        if (roadStableFrames > 25 && scanStatus === 'scanning') {
          setScanStatus('locked');
        }
      } else {
        roadStableFrames = Math.max(0, roadStableFrames - 1);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    // Automatic fallback for desktop / non-gyro devices:
    // After initial scan delay (1.8s), the road surface locks automatically
    scanTimerRef.current = setTimeout(() => {
      setScanStatus((current) => {
        if (current === 'scanning') {
          setSurfaceConfidence(1.0);
          return 'locked';
        }
        return current;
      });
    }, initialAutoPlaceDelayMs);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
    };
  }, [scanStatus, initialAutoPlaceDelayMs]);

  return {
    scanStatus,
    hasGyro,
    isTiltTowardsRoad,
    roadAnchor,
    targetPosition,
    cameraRotation,
    surfaceConfidence,
    requestGyroPermission,
    placeOnRoad,
    rescanRoad,
    confirmSpawn,
  };
}
