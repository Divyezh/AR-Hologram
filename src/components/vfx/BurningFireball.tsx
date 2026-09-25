'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectConfig } from '../../types/effects';

interface BurningFireballProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

export const BurningFireball: React.FC<BurningFireballProps> = ({
  effect,
  particlesEnabled = true,
}) => {
  const coreRef = useRef<THREE.Mesh | null>(null);
  const outerFlame1 = useRef<THREE.Mesh | null>(null);
  const outerFlame2 = useRef<THREE.Mesh | null>(null);
  const flameTonguesGroup = useRef<THREE.Group | null>(null);
  const embersRef = useRef<THREE.Points | null>(null);
  const fireLightRef = useRef<THREE.PointLight | null>(null);

  const emberCount = 160;

  // Rising embers from palm
  const [emberPositions, emberSpeeds, emberAngles, emberRadii] = useMemo(() => {
    const pos = new Float32Array(emberCount * 3);
    const speeds = new Float32Array(emberCount);
    const angles = new Float32Array(emberCount);
    const radii = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 0.05 + Math.random() * 0.35;
      speeds[i] = 0.6 + Math.random() * 1.4;

      pos[i * 3] = Math.cos(angles[i]) * radii[i];
      pos[i * 3 + 1] = Math.random() * 1.0;
      pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }
    return [pos, speeds, angles, radii];
  }, [emberCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Turbulent core pulsing
    if (coreRef.current) {
      const s = 1.0 + Math.sin(t * 12.0) * 0.06 + Math.cos(t * 22.0) * 0.04;
      coreRef.current.scale.set(s, s * 1.15, s);
      coreRef.current.rotation.y = t * 2.0;
    }

    // 2. Churning outer flame shells
    if (outerFlame1.current) {
      outerFlame1.current.rotation.y = -t * 3.5;
      outerFlame1.current.rotation.x = Math.sin(t * 4.0) * 0.2;
      const s1 = 1.1 + Math.sin(t * 15.0) * 0.08;
      outerFlame1.current.scale.set(s1, s1 * 1.25, s1);
    }

    if (outerFlame2.current) {
      outerFlame2.current.rotation.y = t * 4.2;
      outerFlame2.current.rotation.z = Math.cos(t * 5.0) * 0.2;
      const s2 = 1.22 + Math.cos(t * 14.0) * 0.1;
      outerFlame2.current.scale.set(s2, s2 * 1.35, s2);
    }

    // 3. Flame tongues dancing
    if (flameTonguesGroup.current) {
      flameTonguesGroup.current.rotation.y = t * 1.8;
      flameTonguesGroup.current.children.forEach((child, i) => {
        const offset = i * 1.2;
        child.scale.y = 1.0 + Math.sin(t * 10.0 + offset) * 0.3;
        child.position.y = 0.3 + Math.sin(t * 8.0 + offset) * 0.05;
      });
    }

    // 4. Firelight realistic flicker
    if (fireLightRef.current) {
      const flicker = 0.85 + Math.random() * 0.35 + Math.sin(t * 25.0) * 0.15;
      fireLightRef.current.intensity = 4.0 * effect.intensity * flicker;
    }

    // 5. Rising embers simulation
    if (embersRef.current) {
      const geom = embersRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < emberCount; i++) {
        const idx = i * 3;
        // Float upward
        arr[idx + 1] += delta * emberSpeeds[i] * 0.8;

        // Spiral outward slightly
        emberAngles[i] += delta * 2.5;
        const currentR = emberRadii[i] * (1.0 + arr[idx + 1] * 0.8);
        arr[idx] = Math.cos(emberAngles[i]) * currentR;
        arr[idx + 2] = Math.sin(emberAngles[i]) * currentR;

        // Reset to palm surface when high
        if (arr[idx + 1] > 1.2) {
          arr[idx + 1] = 0.02 + Math.random() * 0.08;
          emberRadii[i] = 0.05 + Math.random() * 0.3;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* Dynamic flickering firelight casting warm orange glow onto hand */}
      <pointLight
        ref={fireLightRef}
        color="#ff6600"
        intensity={4.0 * effect.intensity}
        distance={5.0}
        decay={1.8}
        position={[0, 0.2, 0]}
      />

      {/* 1. White-Hot Core Sphere */}
      <mesh ref={coreRef} position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color="#ffeedd"
          emissive="#ffaa00"
          emissiveIntensity={4.5}
          roughness={0.1}
        />
      </mesh>

      {/* 2. Middle Orange Turbulent Shell */}
      <mesh ref={outerFlame1} position={[0, 0.18, 0]}>
        <icosahedronGeometry args={[0.25, 2]} />
        <meshBasicMaterial
          color="#ff5500"
          wireframe
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Outer Crimson Plasma Shell */}
      <mesh ref={outerFlame2} position={[0, 0.2, 0]}>
        <dodecahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial
          color="#ff2200"
          wireframe
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Rising Flame Tongues */}
      <group ref={flameTonguesGroup}>
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 0.14;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0.25, Math.sin(angle) * r]}
              rotation={[0, 0, 0]}
            >
              <coneGeometry args={[0.07, 0.45, 6]} />
              <meshBasicMaterial
                color="#ff7700"
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          );
        })}
      </group>

      {/* 5. Palm Ground Ring of Fire */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <torusGeometry args={[0.38, 0.018, 12, 36]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff4400"
          emissiveIntensity={3.5}
        />
      </mesh>

      {/* 6. Rising Ember Sparks */}
      {particlesEnabled && (
        <points ref={embersRef} position={[0, -0.2, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[emberPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.04 * effect.intensity}
            color="#ffbb22"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
