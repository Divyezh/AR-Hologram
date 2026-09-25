'use client';

import React, { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CHARACTERS } from '../../data/characters';
import { RobotCharacter } from './RobotCharacter';
import { DogCharacter } from './DogCharacter';
import { DragonCharacter } from './DragonCharacter';
import { HologramSpinner } from './CharacterLoader';

interface CharacterRendererProps {
  characterId: string;
  animationName: string;
}

// Procedural Quantum Obelisk character
function QuantumObelisk({ animationName }: { animationName: string }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speed = animationName === 'Overdrive' ? 4.0 : 1.5;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * speed;
      meshRef.current.position.y = 0.5 + Math.sin(t * 3) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * (speed * 0.8);
      ringRef.current.rotation.z = -t * (speed * 0.6);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <group ref={ringRef} position={[0, 0.5, 0]}>
        <mesh>
          <torusGeometry args={[0.55, 0.012, 16, 48]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      </group>
    </group>
  );
}

// Error Boundary for 3D Suspense
class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  characterId,
  animationName,
}) => {
  const config = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  const renderContent = () => {
    switch (config.id) {
      case 'cyber-robot':
        return <RobotCharacter config={config} animationName={animationName} />;
      case 'cyber-fox':
        return <DogCharacter config={config} animationName={animationName} />;
      case 'holo-dragon':
        return <DragonCharacter config={config} animationName={animationName} />;
      case 'holo-crystal':
        return <QuantumObelisk animationName={animationName} />;
      case 'pure-vfx':
        return null;
      default:
        return <QuantumObelisk animationName={animationName} />;
    }
  };

  return (
    <ModelErrorBoundary fallback={<DragonCharacter config={CHARACTERS[2]} animationName="Hover" />}>
      <Suspense fallback={<HologramSpinner color={config.accentColor} />}>
        {renderContent()}
      </Suspense>
    </ModelErrorBoundary>
  );
};
