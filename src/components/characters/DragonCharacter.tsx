'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CharacterConfig } from '../../types/character';

interface DragonCharacterProps {
  config: CharacterConfig;
  animationName: string;
}

export const DragonCharacter: React.FC<DragonCharacterProps> = ({ config, animationName }) => {
  const rootGroup = useRef<THREE.Group | null>(null);
  const leftWing = useRef<THREE.Group | null>(null);
  const rightWing = useRef<THREE.Group | null>(null);
  const tailGroup = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flapSpeed = animationName === 'Dive' ? 12 : animationName === 'Roar' ? 8 : 4.5;
    const flapAngle = Math.sin(t * flapSpeed) * 0.45;

    // Wing flapping
    if (leftWing.current) {
      leftWing.current.rotation.z = flapAngle;
      leftWing.current.rotation.y = Math.cos(t * flapSpeed) * 0.15;
    }
    if (rightWing.current) {
      rightWing.current.rotation.z = -flapAngle;
      rightWing.current.rotation.y = -Math.cos(t * flapSpeed) * 0.15;
    }

    // Tail swish
    if (tailGroup.current) {
      tailGroup.current.rotation.y = Math.sin(t * 3.0) * 0.3;
    }

    // Hover bob
    if (rootGroup.current) {
      rootGroup.current.position.y = config.positionOffset[1] + Math.sin(t * 2.5) * 0.08;
    }

    // Core pulse
    if (coreRef.current) {
      const s = 1.0 + Math.sin(t * 6.0) * 0.15;
      coreRef.current.scale.set(s, s, s);
    }
  });

  const accent = config.accentColor;

  return (
    <group
      ref={rootGroup}
      scale={config.scale}
      position={config.positionOffset}
      rotation={config.rotationOffset}
    >
      {/* Dragon Body */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.22, 0.6, 6]} />
        <meshStandardMaterial
          color="#1e1b4b"
          emissive={accent}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Dragon Head */}
      <group position={[0, 0.38, 0.12]} rotation={[-0.2, 0, 0]}>
        <mesh>
          <dodecahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color="#312e81"
            emissive={accent}
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        {/* Glowing Eyes */}
        <mesh position={[-0.08, 0.04, 0.1]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0.08, 0.04, 0.1]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Horns */}
        <mesh position={[-0.09, 0.14, -0.06]} rotation={[-0.4, 0, -0.3]}>
          <coneGeometry args={[0.03, 0.22, 5]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.09, 0.14, -0.06]} rotation={[-0.4, 0, 0.3]}>
          <coneGeometry args={[0.03, 0.22, 5]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Pulsing Energy Core */}
      <mesh ref={coreRef} position={[0, 0.1, 0.1]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshBasicMaterial color="#ec4899" wireframe />
      </mesh>

      {/* Articulated Left Wing */}
      <group ref={leftWing} position={[-0.12, 0.15, 0]}>
        <mesh position={[-0.4, 0.12, 0]} rotation={[0, 0, 0.2]}>
          <planeGeometry args={[0.7, 0.35]} />
          <meshStandardMaterial
            color="#4338ca"
            emissive={accent}
            emissiveIntensity={1.0}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* Articulated Right Wing */}
      <group ref={rightWing} position={[0.12, 0.15, 0]}>
        <mesh position={[0.4, 0.12, 0]} rotation={[0, 0, -0.2]}>
          <planeGeometry args={[0.7, 0.35]} />
          <meshStandardMaterial
            color="#4338ca"
            emissive={accent}
            emissiveIntensity={1.0}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* Swishing Tail */}
      <group ref={tailGroup} position={[0, -0.3, -0.08]}>
        <mesh position={[0, -0.2, -0.1]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.08, 0.45, 5]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive={accent}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
};
