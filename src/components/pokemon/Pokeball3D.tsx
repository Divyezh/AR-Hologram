'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface Pokeball3DProps {
  isThrown: boolean;
  throwProgress: number; // 0 to 1
  startPos: [number, number, number];
  targetPos: [number, number, number];
  visible?: boolean;
}

export const Pokeball3D: React.FC<Pokeball3DProps> = ({
  isThrown,
  throwProgress,
  startPos,
  targetPos,
  visible = true,
}) => {
  const groupRef = useRef<THREE.Group | null>(null);

  // Procedural Pokeball Materials
  const redMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#dc2626',
        roughness: 0.18,
        metalness: 0.15,
      }),
    []
  );

  const whiteMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.18,
        metalness: 0.15,
      }),
    []
  );

  const blackBandMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.4,
        metalness: 0.2,
      }),
    []
  );

  const buttonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.1,
        metalness: 0.5,
        emissive: '#ffffff',
        emissiveIntensity: 0.3,
      }),
    []
  );

  useFrame(() => {
    if (!groupRef.current) return;
    if (!visible) {
      groupRef.current.visible = false;
      return;
    }

    if (!isThrown) {
      // Idle floating at the bottom in front of camera
      groupRef.current.visible = true;
      groupRef.current.position.set(startPos[0], startPos[1], startPos[2]);
      groupRef.current.rotation.set(0.1, 0, 0);
      groupRef.current.scale.setScalar(0.09);
      return;
    }

    groupRef.current.visible = true;
    const p = Math.min(1, Math.max(0, throwProgress));

    // Parabolic trajectory towards Pikachu
    const curX = THREE.MathUtils.lerp(startPos[0], targetPos[0], p);
    const curZ = THREE.MathUtils.lerp(startPos[2], targetPos[2], p);

    // Parabolic arc height
    const arcHeight = Math.sin(p * Math.PI) * 0.9;
    const curY = THREE.MathUtils.lerp(startPos[1], targetPos[1] + 0.3, p) + arcHeight;

    groupRef.current.position.set(curX, curY, curZ);

    // Rapid spinning during throw
    groupRef.current.rotation.x = p * Math.PI * 8;
    groupRef.current.rotation.y = p * Math.PI * 4;

    // Scale slightly as it travels away
    const ballScale = THREE.MathUtils.lerp(0.09, 0.075, p);
    groupRef.current.scale.setScalar(ballScale);
  });

  return (
    <group ref={groupRef}>
      {/* Top Red Hemisphere */}
      <mesh material={redMaterial} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2 - 0.05]} />
      </mesh>

      {/* Bottom White Hemisphere */}
      <mesh material={whiteMaterial} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, Math.PI / 2 + 0.05, Math.PI / 2 - 0.05]} />
      </mesh>

      {/* Central Black Equatorial Band */}
      <mesh material={blackBandMaterial}>
        <cylinderGeometry args={[1.002, 1.002, 0.12, 32]} />
      </mesh>

      {/* Front Outer Black Ring */}
      <mesh material={blackBandMaterial} position={[0, 0, 0.99]}>
        <circleGeometry args={[0.26, 32]} />
      </mesh>

      {/* Front Center White Button */}
      <mesh material={buttonMaterial} position={[0, 0, 1.01]}>
        <circleGeometry args={[0.16, 32]} />
      </mesh>
    </group>
  );
};
