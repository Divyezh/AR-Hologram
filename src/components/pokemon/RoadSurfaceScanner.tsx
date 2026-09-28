'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface RoadSurfaceScannerProps {
  position?: [number, number, number];
  isDetected?: boolean;
  confidence?: number;
}

export const RoadSurfaceScanner: React.FC<RoadSurfaceScannerProps> = ({
  position = [0, -1.24, -3.2],
  isDetected = false,
  confidence = 0.5,
}) => {
  const outerRingRef = useRef<THREE.Mesh | null>(null);
  const innerRingRef = useRef<THREE.Mesh | null>(null);
  const pulseRingRef = useRef<THREE.Mesh | null>(null);
  const gridMeshRef = useRef<THREE.Mesh | null>(null);

  // Reticle circle texture with radial tick marks and circular rings
  const reticleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 256);
    const cx = 128;
    const cy = 128;

    // Outer circle
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed circle
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4 Cardinal tick marks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 3;
    const tickLen = 20;
    // Top
    ctx.beginPath();
    ctx.moveTo(cx, cy - 110);
    ctx.lineTo(cx, cy - 110 + tickLen);
    ctx.stroke();
    // Bottom
    ctx.beginPath();
    ctx.moveTo(cx, cy + 110);
    ctx.lineTo(cx, cy + 110 - tickLen);
    ctx.stroke();
    // Left
    ctx.beginPath();
    ctx.moveTo(cx - 110, cy);
    ctx.lineTo(cx - 110 + tickLen, cy);
    ctx.stroke();
    // Right
    ctx.beginPath();
    ctx.moveTo(cx + 110, cy);
    ctx.lineTo(cx + 110 - tickLen, cy);
    ctx.stroke();

    // Center electric dot
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.8;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 1.2;
    }

    if (pulseRingRef.current) {
      const pulse = (t * 2.0) % 1;
      pulseRingRef.current.scale.set(1 + pulse * 0.8, 1 + pulse * 0.8, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (1 - pulse) * 0.7;
      }
    }
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 1. Main Scanning Reticle Plane on Road Surface */}
      <mesh ref={outerRingRef}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial
          map={reticleTexture || undefined}
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Expanding Pulse Wave */}
      <mesh ref={pulseRingRef}>
        <ringGeometry args={[0.5, 0.56, 32]} />
        <meshBasicMaterial
          color={isDetected ? '#4ade80' : '#38bdf8'}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Inner Rotating Target Cross */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[0.2, 0.24, 24]} />
        <meshBasicMaterial
          color="#facc15"
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
