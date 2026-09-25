'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PalmAnchor } from '../../types/palm';
import { EffectConfig } from '../../types/effects';
import { PalmAnchorObject } from './PalmAnchorObject';
import { THREE_CONFIG } from '../../lib/three/threeConfig';

interface ARSceneProps {
  anchorRef: React.MutableRefObject<PalmAnchor>;
  effect: EffectConfig;
  characterId: string;
  animationName: string;
  particlesEnabled?: boolean;
}

export const ARScene: React.FC<ARSceneProps> = ({
  anchorRef,
  effect,
  characterId,
  animationName,
  particlesEnabled = true,
}) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <Canvas
        camera={THREE_CONFIG.camera}
        gl={THREE_CONFIG.gl}
        className="w-full h-full pointer-events-none"
        style={{ pointerEvents: 'none', background: 'transparent' }}
      >
        {/* Transparent ambient & directional lights */}
        <ambientLight
          color={THREE_CONFIG.lighting.ambientColor}
          intensity={THREE_CONFIG.lighting.ambientIntensity}
        />
        <directionalLight
          position={THREE_CONFIG.lighting.directionalPos}
          intensity={THREE_CONFIG.lighting.directionalIntensity}
          color={THREE_CONFIG.lighting.directionalColor}
        />
        <directionalLight
          position={[-3, 4, -2]}
          intensity={0.6}
          color="#a855f7"
        />

        {/* 3D Hologram anchor following the user's hand */}
        <PalmAnchorObject
          anchorRef={anchorRef}
          effect={effect}
          characterId={characterId}
          animationName={animationName}
          particlesEnabled={particlesEnabled}
        />
      </Canvas>
    </div>
  );
};
