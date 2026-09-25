'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HologramEffectProps {
  color?: string;
  radius?: number;
  height?: number;
}

export const HologramEffect: React.FC<HologramEffectProps> = ({
  color = '#06b6d4',
  radius = 0.85,
  height = 0.9,
}) => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + Math.sin(t * 3.0) * 0.02;
    }
    if (scanRingRef.current) {
      // Oscillate scanline ring up and down along the projection beam
      scanRingRef.current.position.y = (Math.sin(t * 2.0) * 0.5 + 0.5) * height;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Translucent ethereal projection column (no wireframe cage) */}
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 0.85, radius * 1.05, height, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Soft pulsing holographic scan ring */}
      <mesh ref={scanRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, height * 0.3, 0]}>
        <ringGeometry args={[radius * 0.82, radius * 0.92, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Base perimeter glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[radius, 0.008, 12, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
