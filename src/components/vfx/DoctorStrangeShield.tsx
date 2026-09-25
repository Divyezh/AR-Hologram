'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectConfig } from '../../types/effects';

interface DoctorStrangeShieldProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

export const DoctorStrangeShield: React.FC<DoctorStrangeShieldProps> = ({
  effect,
  particlesEnabled = true,
}) => {
  const outerRuneRingRef = useRef<THREE.Group | null>(null);
  const octagramRef = useRef<THREE.Group | null>(null);
  const innerMandalaRef = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const sparkPointsRef = useRef<THREE.Points | null>(null);

  const radius = effect.ringRadius * 1.15;
  const sparkCount = 180;

  // Tangential fiery spark particles
  const [sparkPositions, sparkVelocities, sparkLife] = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const vel = new Float32Array(sparkCount * 3);
    const life = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.95 + Math.random() * 0.1);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      // Tangential velocity + slight outward burst
      const tangX = -Math.sin(angle) * 1.2 + (Math.random() - 0.5) * 0.4;
      const tangZ = Math.cos(angle) * 1.2 + (Math.random() - 0.5) * 0.4;
      vel[i * 3] = tangX;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      vel[i * 3 + 2] = tangZ;

      life[i] = Math.random();
    }
    return [pos, vel, life];
  }, [radius, sparkCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const speed = effect.rotationSpeed * 1.8;

    // Rotate outer rune circle clockwise
    if (outerRuneRingRef.current) {
      outerRuneRingRef.current.rotation.y = t * speed;
    }

    // Rotate octagram (two overlapping squares) counter-clockwise
    if (octagramRef.current) {
      octagramRef.current.rotation.y = -t * (speed * 0.75);
    }

    // Rotate inner mandala clockwise
    if (innerMandalaRef.current) {
      innerMandalaRef.current.rotation.y = t * (speed * 1.2);
    }

    // Pulse core
    if (coreRef.current) {
      const s = 1.0 + Math.sin(t * 8.0) * 0.08;
      coreRef.current.scale.set(s, s, s);
    }

    // Animate sparks
    if (sparkPointsRef.current) {
      const geom = sparkPointsRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < sparkCount; i++) {
        const idx = i * 3;
        arr[idx] += sparkVelocities[idx] * delta;
        arr[idx + 1] += sparkVelocities[idx + 1] * delta;
        arr[idx + 2] += sparkVelocities[idx + 2] * delta;

        sparkLife[i] -= delta * 1.8;

        if (sparkLife[i] <= 0) {
          sparkLife[i] = 1.0;
          const angle = Math.random() * Math.PI * 2;
          const r = radius * (0.95 + Math.random() * 0.08);
          arr[idx] = Math.cos(angle) * r;
          arr[idx + 1] = (Math.random() - 0.5) * 0.03;
          arr[idx + 2] = Math.sin(angle) * r;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0.02, 0]}>
      {/* Dynamic fire-gold point light illuminating palm */}
      <pointLight
        color="#ff8800"
        intensity={3.5 * effect.intensity}
        distance={4.5}
        decay={1.8}
        position={[0, 0.1, 0]}
      />

      {/* 1. Outermost Blazing Spark Border Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.022, 16, 64]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff5500"
          emissiveIntensity={4.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Outer secondary glowing ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.94, 0.012, 16, 64]} />
        <meshStandardMaterial
          color="#ffdd44"
          emissive="#ff8800"
          emissiveIntensity={3.5}
          roughness={0.1}
        />
      </mesh>

      {/* 2. Outer Rotating Rune Disc & Arcs */}
      <group ref={outerRuneRingRef} rotation={[0, 0, 0]}>
        {/* 16 radial glyph segments around perimeter */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius * 0.86, 0.005, Math.sin(angle) * radius * 0.86]}
              rotation={[-Math.PI / 2, 0, -angle]}
            >
              <planeGeometry args={[0.08, 0.03]} />
              <meshBasicMaterial color="#ffe066" side={THREE.DoubleSide} />
            </mesh>
          );
        })}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <ringGeometry args={[radius * 0.78, radius * 0.81, 48]} />
          <meshBasicMaterial color="#ff7700" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      </group>

      {/* 3. Concentric Rotating Sacred Octagram (Two Interlocking Squares at 45 deg) */}
      <group ref={octagramRef} position={[0, 0.008, 0]}>
        {/* Square 1 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.65, radius * 0.67, 4]} />
          <meshBasicMaterial color="#ffaa00" wireframe wireframeLinewidth={2} side={THREE.DoubleSide} />
        </mesh>
        {/* Square 2 (rotated by 45 degrees to form 8-pointed star) */}
        <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <ringGeometry args={[radius * 0.65, radius * 0.67, 4]} />
          <meshBasicMaterial color="#ffdd44" wireframe wireframeLinewidth={2} side={THREE.DoubleSide} />
        </mesh>

        {/* Supporting ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * 0.58, 0.009, 12, 48]} />
          <meshStandardMaterial color="#ff5500" emissive="#ff3300" emissiveIntensity={3} />
        </mesh>
      </group>

      {/* 4. Inner Mystic 12-Sided Mandala Core */}
      <group ref={innerMandalaRef} position={[0, 0.012, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.38, radius * 0.42, 12]} />
          <meshBasicMaterial
            color="#ffe066"
            wireframe
            wireframeLinewidth={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 6 radial spokes */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI;
          return (
            <mesh key={i} rotation={[-Math.PI / 2, 0, angle]}>
              <planeGeometry args={[radius * 0.76, 0.008]} />
              <meshBasicMaterial color="#ff9900" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>

      {/* 5. Center White-Hot Glowing Energy Core */}
      <mesh ref={coreRef} position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color="#fffbe6" />
      </mesh>

      {/* 6. Tangential Fiery Sparks Emission */}
      {particlesEnabled && (
        <points ref={sparkPointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045 * effect.intensity}
            color="#ffbb33"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
