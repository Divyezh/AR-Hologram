'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  radius?: number;
  intensity?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 140,
  color = '#f59e0b',
  radius = 1.0,
  intensity = 1.0,
}) => {
  const pointsRef = useRef<THREE.Points | null>(null);

  // Generate initial particle positions, velocities, and scales
  const [positions, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = (0.2 + Math.random() * 0.8) * radius;
      const height = (Math.random() - 0.2) * 1.2;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.5 + Math.random() * 1.5;
    }

    return [pos, ph, sp];
  }, [count, radius]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Orbit around Y
      const currentX = array[idx];
      const currentZ = array[idx + 2];
      const r = Math.sqrt(currentX * currentX + currentZ * currentZ);
      const angle = Math.atan2(currentZ, currentX) + speeds[i] * delta * 1.2;

      array[idx] = Math.cos(angle) * r;
      array[idx + 2] = Math.sin(angle) * r;

      // Float upward gently and loop back
      array[idx + 1] += delta * (0.3 * speeds[i]);
      if (array[idx + 1] > 1.4) {
        array[idx + 1] = -0.1;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035 * intensity}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
