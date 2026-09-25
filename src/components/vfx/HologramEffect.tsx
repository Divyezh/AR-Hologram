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
  height = 0.75,
}) => {
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const t = clock.getElapsedTime();
    mat.opacity = 0.08 + Math.sin(t * 4.0) * 0.03;
  });

  return (
    <group position={[0, height / 2, 0]}>
      {/* Light cylinder hologram projection beam */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius * 0.9, radius * 1.05, height, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe
        />
      </mesh>
    </group>
  );
};
