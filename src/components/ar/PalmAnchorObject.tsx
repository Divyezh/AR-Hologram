'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PalmAnchor } from '../../types/palm';
import { MagicRing } from '../vfx/MagicRing';
import { CharacterRenderer } from '../characters/CharacterRenderer';
import { EffectConfig } from '../../types/effects';

interface PalmAnchorObjectProps {
  anchorRef: React.MutableRefObject<PalmAnchor>;
  effect: EffectConfig;
  characterId: string;
  animationName: string;
  particlesEnabled?: boolean;
}

export const PalmAnchorObject: React.FC<PalmAnchorObjectProps> = ({
  anchorRef,
  effect,
  characterId,
  animationName,
  particlesEnabled = true,
}) => {
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const visualScaleRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (!rootGroupRef.current) return;
    const anchor = anchorRef.current;

    // Smooth entry and exit scale animation
    const targetVisScale = anchor.detected ? anchor.scale : 0;
    visualScaleRef.current += (targetVisScale - visualScaleRef.current) * Math.min(1, delta * 12);

    if (visualScaleRef.current < 0.01) {
      rootGroupRef.current.visible = false;
      return;
    }

    rootGroupRef.current.visible = true;

    // Direct 60fps matrix update without React state
    rootGroupRef.current.position.set(
      anchor.position[0],
      anchor.position[1],
      anchor.position[2]
    );

    rootGroupRef.current.quaternion.set(
      anchor.quaternion[0],
      anchor.quaternion[1],
      anchor.quaternion[2],
      anchor.quaternion[3]
    );

    const s = visualScaleRef.current;
    rootGroupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={rootGroupRef} visible={false}>
      {/* 
        Hierarchy:
        PalmAnchor
            |
            +-- HologramRoot
                    |
                    +-- MagicRing (anchored at palm surface)
                    |
                    +-- Character (elevated directly above the ring)
      */}
      <group name="HologramRoot">
        {/* Magic Ring on the palm plane */}
        <MagicRing effect={effect} particlesEnabled={particlesEnabled} />

        {/* Character positioned above the ring */}
        <CharacterRenderer characterId={characterId} animationName={animationName} />
      </group>
    </group>
  );
};
