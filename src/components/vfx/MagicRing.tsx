'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MagicRingShader } from '../../lib/three/shaders';
import { ParticleField } from './ParticleField';
import { GlowEffect } from './GlowEffect';
import { HologramEffect } from './HologramEffect';
import { EffectConfig } from '../../types/effects';

interface MagicRingProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

export const MagicRing: React.FC<MagicRingProps> = ({
  effect,
  particlesEnabled = true,
}) => {
  const ringDiscRef = useRef<THREE.Mesh | null>(null);
  const gyro1Ref = useRef<THREE.Group | null>(null);
  const gyro2Ref = useRef<THREE.Group | null>(null);
  const innerPolygonRef = useRef<THREE.Mesh | null>(null);

  // Shader material uniforms
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uColorPrimary: { value: new THREE.Color(effect.primaryColor) },
      uColorSecondary: { value: new THREE.Color(effect.secondaryColor) },
      uIntensity: { value: effect.intensity },
      uPulseSpeed: { value: effect.pulseSpeed },
      uRotationSpeed: { value: effect.rotationSpeed },
    };
  }, [effect]);

  // Update uniforms when effect colors or parameters change
  React.useEffect(() => {
    uniforms.uColorPrimary.value.set(effect.primaryColor);
    uniforms.uColorSecondary.value.set(effect.secondaryColor);
    uniforms.uIntensity.value = effect.intensity;
    uniforms.uPulseSpeed.value = effect.pulseSpeed;
    uniforms.uRotationSpeed.value = effect.rotationSpeed;
  }, [effect, uniforms]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;

    // Counter-rotating gyroscopic wireframe rings
    if (gyro1Ref.current) {
      gyro1Ref.current.rotation.z = time * (effect.rotationSpeed * 0.5);
    }
    if (gyro2Ref.current) {
      gyro2Ref.current.rotation.z = -time * (effect.rotationSpeed * 0.7);
    }
    if (innerPolygonRef.current) {
      innerPolygonRef.current.rotation.z = time * (effect.rotationSpeed * 0.3);
      const scale = 0.95 + 0.05 * Math.sin(time * effect.pulseSpeed * 2.0);
      innerPolygonRef.current.scale.set(scale, scale, 1);
    }
  });

  const radius = effect.ringRadius;

  return (
    <group>
      {/* 1. Main procedural shader disc (runes, concentric energy, pulses) */}
      <mesh ref={ringDiscRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[radius * 2.2, radius * 2.2, 64, 64]} />
        <shaderMaterial
          vertexShader={MagicRingShader.vertexShader}
          fragmentShader={MagicRingShader.fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Primary 3D glowing torus edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[radius * 0.92, 0.018, 16, 64]} />
        <meshStandardMaterial
          color={effect.primaryColor}
          emissive={effect.primaryColor}
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Secondary inner glowing torus */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <torusGeometry args={[radius * 0.58, 0.012, 16, 48]} />
        <meshStandardMaterial
          color={effect.secondaryColor}
          emissive={effect.secondaryColor}
          emissiveIntensity={2.0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 4. Gyroscopic tilted floating orbits */}
      <group ref={gyro1Ref} rotation={[-Math.PI / 2 + 0.15, 0.1, 0]}>
        <mesh>
          <torusGeometry args={[radius * 1.05, 0.008, 12, 48]} />
          <meshBasicMaterial
            color={effect.glowColor}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <group ref={gyro2Ref} rotation={[-Math.PI / 2 - 0.15, -0.1, 0]}>
        <mesh>
          <torusGeometry args={[radius * 1.12, 0.006, 12, 48]} />
          <meshBasicMaterial
            color={effect.secondaryColor}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 5. Inner sacred geometry regular polygon (12-sided) */}
      <mesh
        ref={innerPolygonRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[radius * 0.38, radius * 0.4, 12]} />
        <meshBasicMaterial
          color={effect.glowColor}
          wireframe
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 6. Dynamic upward glow and light */}
      <GlowEffect color={effect.glowColor} intensity={effect.intensity} />

      {/* 7. Hologram cylinder beam projection */}
      <HologramEffect color={effect.primaryColor} radius={radius} height={1.4} />

      {/* 8. Floating mana / energy particles */}
      {particlesEnabled && (
        <ParticleField
          count={effect.particleCount}
          color={effect.glowColor}
          radius={radius}
          intensity={effect.intensity}
        />
      )}
    </group>
  );
};
