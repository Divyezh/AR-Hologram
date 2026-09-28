'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FoodModelDispatcher } from './models/FoodModelDispatcher';
import { DishItem } from '../../data/restaurantMenu';
import { soundManager } from '../../lib/audio/soundManager';

interface InteractiveFoodSceneProps {
  dish: DishItem;
  onTapInfo: () => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onResetTriggered?: () => void;
}

// Inner Scene Component containing 3D meshes & frame loop
const FoodRig: React.FC<{
  dish: DishItem;
  onTapInfo: () => void;
  isAutoRotate: boolean;
  scale: number;
  rotation: { x: number; y: number };
  position: { x: number; y: number; z: number };
}> = ({ dish, onTapInfo, isAutoRotate, scale, rotation, position }) => {
  const outerGroupRef = useRef<THREE.Group>(null);
  const autoSpinRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (!outerGroupRef.current) return;

    if (isAutoRotate) {
      autoSpinRef.current += delta * 0.55;
    }

    // Smooth lerp to current target rotation and position
    const currentRotY = outerGroupRef.current.rotation.y;
    const targetRotY = rotation.y + autoSpinRef.current;
    outerGroupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotY, targetRotY, 0.15);

    const currentRotX = outerGroupRef.current.rotation.x;
    outerGroupRef.current.rotation.x = THREE.MathUtils.lerp(currentRotX, rotation.x, 0.15);

    // Smooth position lerp
    outerGroupRef.current.position.x = THREE.MathUtils.lerp(outerGroupRef.current.position.x, position.x, 0.15);
    outerGroupRef.current.position.y = THREE.MathUtils.lerp(outerGroupRef.current.position.y, position.y, 0.15);
    outerGroupRef.current.position.z = THREE.MathUtils.lerp(outerGroupRef.current.position.z, position.z, 0.15);

    // Smooth scale lerp
    const targetScale = dish.defaultScale * scale;
    const currentScale = outerGroupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15);
    outerGroupRef.current.scale.set(nextScale, nextScale, nextScale);
  });

  return (
    <group ref={outerGroupRef} position={[0, -0.1, 0]}>
      <FoodModelDispatcher dish={dish} onTapInfo={onTapInfo} />
    </group>
  );
};

export const InteractiveFoodScene: React.FC<InteractiveFoodSceneProps> = ({
  dish,
  onTapInfo,
  isAutoRotate,
  onToggleAutoRotate,
  scale,
  onScaleChange,
  onResetTriggered,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform states
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0.25, y: -0.4 });
  const [position, setPosition] = useState<{ x: number; y: number; z: number }>({ x: 0, y: -0.1, z: 0 });

  // Drag tracking refs
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<'rotate' | 'move'>('rotate');
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Handle Double-Tap / Double-Click to Reset
  const handleReset = useCallback(() => {
    soundManager.playReset();
    setRotation({ x: 0.25, y: -0.4 });
    setPosition({ x: 0, y: -0.1, z: 0 });
    onScaleChange(1.0);
    onResetTriggered?.();
  }, [onScaleChange, onResetTriggered]);

  // Touch handlers for mobile (Rotate with 1 finger, Pinch scale with 2 fingers, Move with 2 fingers)
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    // Double-tap check (< 300ms)
    if (now - lastTapTimeRef.current < 300) {
      handleReset();
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragModeRef.current = 'rotate';
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = true;
      dragModeRef.current = 'move';
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    if (e.touches.length === 1 && dragModeRef.current === 'rotate') {
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      setRotation((prev) => ({
        x: Math.max(-0.6, Math.min(0.8, prev.x + dy * 0.008)),
        y: prev.y + dx * 0.012,
      }));
    } else if (e.touches.length === 2) {
      // 1. Pinch Scale
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);

      if (touchStartDistRef.current) {
        const factor = currentDist / touchStartDistRef.current;
        const newScale = Math.max(0.5, Math.min(2.5, scale * (1 + (factor - 1) * 0.3)));
        onScaleChange(newScale);
        touchStartDistRef.current = currentDist;
      }

      // 2. Two-finger Move
      const currentCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (touchStartCenterRef.current) {
        const moveX = (currentCenterX - touchStartCenterRef.current.x) * 0.005;
        const moveY = -(currentCenterY - touchStartCenterRef.current.y) * 0.005;
        setPosition((prev) => ({
          x: Math.max(-2.5, Math.min(2.5, prev.x + moveX)),
          y: Math.max(-1.5, Math.min(1.5, prev.y + moveY)),
          z: prev.z,
        }));
        touchStartCenterRef.current = { x: currentCenterX, y: currentCenterY };
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchStartDistRef.current = null;
    touchStartCenterRef.current = null;
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      isDraggingRef.current = true;
      dragModeRef.current = e.shiftKey ? 'move' : 'rotate';
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (dragModeRef.current === 'rotate') {
      setRotation((prev) => ({
        x: Math.max(-0.6, Math.min(0.8, prev.x + dy * 0.008)),
        y: prev.y + dx * 0.012,
      }));
    } else {
      setPosition((prev) => ({
        x: Math.max(-2.5, Math.min(2.5, prev.x + dx * 0.005)),
        y: Math.max(-1.5, Math.min(1.5, prev.y - dy * 0.005)),
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
    const nextScale = Math.max(0.5, Math.min(2.5, scale + delta));
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
      onWheel={handleWheel}
      onDoubleClick={handleReset}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none"
    >
      <Canvas
        camera={{ position: [0, 1.8, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Warm Dining Ambience Lighting */}
        <ambientLight intensity={1.2} />
        {/* Key Light (warm overhead chandelier) */}
        <directionalLight
          position={[3, 6, 4]}
          intensity={2.2}
          color="#fffbeb"
          castShadow
        />
        {/* Soft Fill Light */}
        <directionalLight position={[-4, 3, -2]} intensity={0.9} color="#fdba74" />
        {/* Rim Backlight for gourmet silhouette */}
        <spotLight
          position={[0, 4, -4]}
          intensity={2.8}
          color="#ffffff"
          angle={0.7}
          penumbra={0.8}
        />

        {/* 3D Model with gesture transforms */}
        <FoodRig
          dish={dish}
          onTapInfo={onTapInfo}
          isAutoRotate={isAutoRotate}
          scale={scale}
          rotation={rotation}
          position={position}
        />
      </Canvas>
    </div>
  );
};
