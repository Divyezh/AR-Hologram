'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HologramSpinnerProps {
  color?: string;
  size?: number;
}

export const HologramSpinner: React.FC<HologramSpinnerProps> = ({
  color = '#06b6d4',
  size = 0.4,
}) => {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 2.5;
    groupRef.current.rotation.x = Math.sin(t * 1.5) * 0.4;
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      <mesh>
        <octahedronGeometry args={[size, 0]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 0.4, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
