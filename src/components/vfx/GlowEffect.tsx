'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface GlowEffectProps {
  color?: string;
  intensity?: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  color = '#38bdf8',
  intensity = 1.0,
}) => {
  const lightRef = useRef<THREE.PointLight | null>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    lightRef.current.intensity = (1.5 + Math.sin(t * 3.5) * 0.3) * intensity;
  });

  return (
    <group>
      {/* Dynamic upward point light illuminating the character */}
      <pointLight
        ref={lightRef}
        color={color}
        distance={4}
        decay={2}
        position={[0, 0.3, 0]}
      />
    </group>
  );
};
