"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FoodModelDispatcher } from "./models/FoodModelDispatcher";
import { DishItem } from "../../data/restaurantMenu";
import { soundManager } from "../../lib/audio/soundManager";

export interface TableAnchorPosition {
  x: number;
  y: number;
  z: number;
}

interface InteractiveFoodSceneProps {
  dish: DishItem;
  onTapInfo: () => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onResetTriggered?: () => void;
  // AR Desk Surface & QR Anchor props
  isDeskAnchored?: boolean;
  onToggleDeskAnchor?: () => void;
  triggerTurningAnimToken?: number; // increments when QR detected or user taps summon
  qrAnchorPos?: { x: number; y: number } | null;
  onTapSurface?: (coords: { x: number; y: number }) => void;
}

/**
 * Holographic Tabletop AR Coaster that renders on the desk surface
 * below the plate, providing depth grounding, contact shadow, and
 * animated turning flare rings when a QR code or desk surface is locked.
 */
const HolographicTableCoaster: React.FC<{
  animProgress: number;
  isDeskAnchored: boolean;
  hasQrLock: boolean;
}> = ({ animProgress, isDeskAnchored, hasQrLock }) => {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
    }
  });

  // Scale of coaster during entrance animation
  const coasterScale = Math.min(1.0, animProgress * 1.3);
  const glowOpacity = Math.sin(animProgress * Math.PI) * 0.8 + (hasQrLock ? 0.45 : 0.25);

  return (
    <group
      position={[0, -0.68, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[coasterScale, coasterScale, coasterScale]}
    >
      {/* 1. Realistic Soft Dark Contact Shadow on the Physical Desk */}
      <mesh position={[0, 0, -0.02]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* 2. Outer Ambient Shadow Blur */}
      <mesh position={[0, 0, -0.03]} receiveShadow>
        <circleGeometry args={[2.9, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* 3. Glowing Holographic AR Coaster Ring on Table Plane */}
      {isDeskAnchored && (
        <group ref={ringRef}>
          {/* Main Gold / Amber Table Marker Ring */}
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[1.95, 2.05, 64]} />
            <meshBasicMaterial
              color={hasQrLock ? "#10b981" : "#f59e0b"}
              transparent
              opacity={glowOpacity}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Dotted Inner Reticle Ring */}
          <mesh position={[0, 0, 0.015]}>
            <ringGeometry args={[1.65, 1.7, 32]} />
            <meshBasicMaterial
              color={hasQrLock ? "#34d399" : "#fbbf24"}
              transparent
              opacity={glowOpacity * 0.6}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* 4 Corner Crosshair Ticks for Precision Desk Alignment */}
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
            <mesh
              key={`tick-${i}`}
              position={[Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0.02]}
              rotation={[0, 0, angle]}
            >
              <planeGeometry args={[0.2, 0.04]} />
              <meshBasicMaterial
                color={hasQrLock ? "#34d399" : "#f59e0b"}
                transparent
                opacity={glowOpacity * 0.9}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/**
 * Inner Scene Component containing 3D food model, desk surface anchor,
 * gyro tilt compensation, and the 360° turning intro animation.
 */
const FoodRig: React.FC<{
  dish: DishItem;
  onTapInfo: () => void;
  isAutoRotate: boolean;
  scale: number;
  userRotation: { x: number; y: number };
  userPosition: { x: number; y: number; z: number };
  triggerTurningAnimToken?: number;
  isDeskAnchored: boolean;
  hasQrLock: boolean;
  gyroTilt: { pitch: number; roll: number };
}> = ({
  dish,
  onTapInfo,
  isAutoRotate,
  scale,
  userRotation,
  userPosition,
  triggerTurningAnimToken,
  isDeskAnchored,
  hasQrLock,
  gyroTilt,
}) => {
  const outerGroupRef = useRef<THREE.Group>(null);
  const autoSpinRef = useRef<number>(0);
  const { viewport } = useThree();

  // 360° Turning Entrance Animation State
  // Progress goes from 0.0 to 1.0
  const animProgressRef = useRef<number>(1.0);
  const [animProgressState, setAnimProgressState] = useState<number>(1.0);

  // Trigger turning animation when token changes or dish changes
  useEffect(() => {
    animProgressRef.current = 0.0;
    setAnimProgressState(0.0);
  }, [triggerTurningAnimToken, dish.id]);

  // Responsive device-adaptive base sizing:
  const isPortrait = viewport.aspect < 1.0;
  const targetPlateUnits = isPortrait
    ? Math.min(viewport.width * 0.7, 1.3)
    : Math.min(viewport.height * 0.5, 1.8);
  const baseDeviceMultiplier = targetPlateUnits / 3.6;

  // On mobile portrait, bottom HUD takes up ~28% of screen height.
  // Shifting the model upward puts it dead-center in the open camera view over the desk.
  const baseVerticalOffset = isPortrait ? 0.35 : 0.0;

  useFrame((_, delta) => {
    if (!outerGroupRef.current) return;

    // 1. Advance Turning Entrance Animation
    if (animProgressRef.current < 1.0) {
      // 1.2 second duration for a rich gourmet entrance
      animProgressRef.current = Math.min(1.0, animProgressRef.current + delta * 0.85);
      setAnimProgressState(animProgressRef.current);
    }

    const p = animProgressRef.current;
    // Ease-out back curve for bouncy settle on desk
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const easeOut = p >= 1.0 ? 1.0 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);

    // 360°–720° turning spin during entrance!
    // As progress goes from 0 to 1, spinAngle decelerates to 0
    const turningSpinAngle = (1.0 - p) * (Math.PI * 3.5);

    // Drop onto desk surface during entrance
    const dropY = (1.0 - p) * 0.7;

    if (isAutoRotate) {
      autoSpinRef.current += delta * 0.55;
    }

    // 2. Gyro & Desk Surface Pitch Stabilization:
    // When pointing camera down at desk (pitch > 0), adjust Y and Z so the plate
    // remains flat on the desk plane instead of flying around with phone tilt!
    let gyroCompensatedY = 0;
    let gyroCompensatedX = 0;
    let gyroCompensatedRotX = 0;

    if (isDeskAnchored) {
      // Gyro pitch compensation (normalizes tilt so model stays grounded on table)
      gyroCompensatedY = -gyroTilt.pitch * 0.015;
      gyroCompensatedX = gyroTilt.roll * 0.015;
      gyroCompensatedRotX = gyroTilt.pitch * 0.008;
    }

    // Target rotations
    const targetRotY = userRotation.y + autoSpinRef.current + turningSpinAngle;
    const targetRotX = THREE.MathUtils.clamp(userRotation.x + gyroCompensatedRotX, -0.6, 0.8);

    outerGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      outerGroupRef.current.rotation.y,
      targetRotY,
      0.18
    );
    outerGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      outerGroupRef.current.rotation.x,
      targetRotX,
      0.18
    );

    // Target positions with desk anchoring & drop
    const targetPosX = userPosition.x + gyroCompensatedX;
    const targetPosY = userPosition.y + baseVerticalOffset + dropY + gyroCompensatedY;
    const targetPosZ = userPosition.z;

    outerGroupRef.current.position.x = THREE.MathUtils.lerp(
      outerGroupRef.current.position.x,
      targetPosX,
      0.18
    );
    outerGroupRef.current.position.y = THREE.MathUtils.lerp(
      outerGroupRef.current.position.y,
      targetPosY,
      0.18
    );
    outerGroupRef.current.position.z = THREE.MathUtils.lerp(
      outerGroupRef.current.position.z,
      targetPosZ,
      0.18
    );

    // Target scale with entrance scale-up and user pinch zoom
    const entranceScaleMultiplier = Math.max(0.01, easeOut);
    const targetScale = dish.defaultScale * baseDeviceMultiplier * scale * entranceScaleMultiplier;
    const currentScale = outerGroupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.18);
    outerGroupRef.current.scale.set(nextScale, nextScale, nextScale);
  });

  return (
    <group ref={outerGroupRef} position={[0, -0.1 + baseVerticalOffset, 0]}>
      {/* 1. Holographic Table Coaster on Physical Desk Plane */}
      <HolographicTableCoaster
        animProgress={animProgressState}
        isDeskAnchored={isDeskAnchored}
        hasQrLock={hasQrLock}
      />

      {/* 2. Authentic 3D Food Model */}
      <FoodModelDispatcher dish={dish} onTapInfo={onTapInfo} />
    </group>
  );
};

export const InteractiveFoodScene: React.FC<InteractiveFoodSceneProps> = ({
  dish,
  onTapInfo,
  isAutoRotate,
  scale,
  onScaleChange,
  onResetTriggered,
  isDeskAnchored = true,
  triggerTurningAnimToken = 0,
  qrAnchorPos = null,
  onTapSurface,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform states
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0.28, y: -0.35 });
  const [position, setPosition] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: -0.1,
    z: 0,
  });

  // Gyro tilt tracking for phone orientation stabilization
  const [gyroTilt, setGyroTilt] = useState<{ pitch: number; roll: number }>({ pitch: 0, roll: 0 });
  const baseGyroRef = useRef<{ pitch: number; roll: number } | null>(null);

  // Drag & Pinch tracking refs
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<"rotate" | "pinch" | "move">("rotate");
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(scale);
  const currentScaleRef = useRef<number>(scale);
  const touchStartCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const hasMovedSignificantlyRef = useRef<boolean>(false);

  // Sync internal scale ref
  useEffect(() => {
    currentScaleRef.current = scale;
  }, [scale]);

  // Update position if QR anchor is detected on camera
  useEffect(() => {
    if (qrAnchorPos) {
      // Map normalized 0..1 camera coordinate to 3D scene world coordinates
      // Normalized: x in 0..1 (0 left, 1 right), y in 0..1 (0 top, 1 bottom)
      const worldX = (qrAnchorPos.x - 0.5) * 2.2;
      const worldY = -(qrAnchorPos.y - 0.5) * 2.0;
      setPosition({ x: worldX, y: worldY, z: 0 });
    }
  }, [qrAnchorPos]);

  // Listen to deviceorientation for stabilizing camera over the desk
  useEffect(() => {
    if (!isDeskAnchored || typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      // Natural phone pitch when looking down at a table is ~45 degrees
      const currentPitch = e.beta; // -180 to 180 (tilt front/back)
      const currentRoll = e.gamma; // -90 to 90 (tilt left/right)

      if (!baseGyroRef.current) {
        baseGyroRef.current = { pitch: currentPitch, roll: currentRoll };
      }

      // Delta relative to initial desk sighting angle (clamped to prevent crazy jumping)
      const deltaPitch = THREE.MathUtils.clamp(currentPitch - baseGyroRef.current.pitch, -35, 35);
      const deltaRoll = THREE.MathUtils.clamp(currentRoll - baseGyroRef.current.roll, -30, 30);

      setGyroTilt({ pitch: deltaPitch, roll: deltaRoll });
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isDeskAnchored]);

  // Reset to default desk view
  const handleReset = useCallback(() => {
    soundManager.playReset();
    setRotation({ x: 0.28, y: -0.35 });
    setPosition({ x: 0, y: -0.1, z: 0 });
    baseGyroRef.current = null;
    setGyroTilt({ pitch: 0, roll: 0 });
    onScaleChange(1.0);
    onResetTriggered?.();
  }, [onScaleChange, onResetTriggered]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    touchStartTimeRef.current = now;
    hasMovedSignificantlyRef.current = false;

    // Double-tap check (< 300ms) with single finger -> Reset View
    if (e.touches.length === 1 && now - lastTapTimeRef.current < 300) {
      handleReset();
      lastTapTimeRef.current = 0;
      return;
    }

    if (e.touches.length === 1) {
      lastTapTimeRef.current = now;
      isDraggingRef.current = true;
      dragModeRef.current = "rotate";
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = true;
      dragModeRef.current = "pinch";
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartScaleRef.current = currentScaleRef.current;
      touchStartCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    if (e.touches.length === 1 && dragModeRef.current === "rotate") {
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;

      if (Math.hypot(dx, dy) > 8) {
        hasMovedSignificantlyRef.current = true;
      }

      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      setRotation((prev) => ({
        x: Math.max(-0.6, Math.min(0.8, prev.x + dy * 0.008)),
        y: prev.y + dx * 0.012,
      }));
    } else if (e.touches.length === 2) {
      hasMovedSignificantlyRef.current = true;
      // 1. Pinch to Zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);

      if (pinchStartDistRef.current && pinchStartDistRef.current > 10) {
        const factor = currentDist / pinchStartDistRef.current;
        const newScale = Math.max(
          0.4,
          Math.min(2.5, +(pinchStartScaleRef.current * factor).toFixed(3))
        );
        currentScaleRef.current = newScale;
        onScaleChange(newScale);
      }

      // 2. Two-finger Move / Pan across desk surface
      const currentCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (touchStartCenterRef.current) {
        const moveX = (currentCenterX - touchStartCenterRef.current.x) * 0.004;
        const moveY = -(currentCenterY - touchStartCenterRef.current.y) * 0.004;
        setPosition((prev) => ({
          x: Math.max(-2.2, Math.min(2.2, prev.x + moveX)),
          y: Math.max(-1.6, Math.min(1.6, prev.y + moveY)),
          z: prev.z,
        }));
        touchStartCenterRef.current = { x: currentCenterX, y: currentCenterY };
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const elapsed = Date.now() - touchStartTimeRef.current;

    // Single Tap to Place on Table (if user tapped without dragging)
    if (!hasMovedSignificantlyRef.current && elapsed < 260 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Map touch to normalized -1..1 coordinates
        const normX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        setPosition({
          x: normX * 1.5,
          y: normY * 1.2,
          z: 0,
        });
        soundManager.playClick();
        onTapSurface?.({ x: normX, y: normY });
      }
    }

    if (e.touches.length === 1) {
      dragModeRef.current = "rotate";
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pinchStartDistRef.current = null;
      touchStartCenterRef.current = null;
    } else if (e.touches.length === 0) {
      isDraggingRef.current = false;
      pinchStartDistRef.current = null;
      touchStartCenterRef.current = null;
    }
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      dragModeRef.current = e.shiftKey ? "move" : "rotate";
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (dragModeRef.current === "rotate") {
      setRotation((prev) => ({
        x: Math.max(-0.6, Math.min(0.8, prev.x + dy * 0.008)),
        y: prev.y + dx * 0.012,
      }));
    } else {
      setPosition((prev) => ({
        x: Math.max(-2.2, Math.min(2.2, prev.x + dx * 0.005)),
        y: Math.max(-1.6, Math.min(1.6, prev.y - dy * 0.005)),
        z: prev.z,
      }));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse Wheel Scale
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    const nextScale = Math.max(0.4, Math.min(2.5, +(currentScaleRef.current + delta).toFixed(2)));
    currentScaleRef.current = nextScale;
    onScaleChange(nextScale);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      onDoubleClick={handleReset}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ touchAction: "none" }}
    >
      <Canvas
        camera={{ position: [0, 1.8, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Warm Dining Ambience Lighting */}
        <ambientLight intensity={1.3} />
        {/* Key Light (warm overhead dining chandelier) */}
        <directionalLight position={[3, 6, 4]} intensity={2.4} color="#fffbeb" castShadow />
        {/* Soft Warm Fill Light */}
        <directionalLight position={[-4, 3, -2]} intensity={1.0} color="#fdba74" />
        {/* Rim Backlight for gourmet silhouette */}
        <spotLight
          position={[0, 4, -4]}
          intensity={3.0}
          color="#ffffff"
          angle={0.7}
          penumbra={0.8}
        />

        {/* 3D Food Rig with desk plane anchor, gyro stabilization, and turning animation */}
        <FoodRig
          dish={dish}
          onTapInfo={onTapInfo}
          isAutoRotate={isAutoRotate}
          scale={scale}
          userRotation={rotation}
          userPosition={position}
          triggerTurningAnimToken={triggerTurningAnimToken}
          isDeskAnchored={isDeskAnchored}
          hasQrLock={Boolean(qrAnchorPos)}
          gyroTilt={gyroTilt}
        />
      </Canvas>
    </div>
  );
};
