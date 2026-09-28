'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface Burger3DModelProps {
  onTap?: () => void;
  isHovered?: boolean;
}

export const Burger3DModel: React.FC<Burger3DModelProps> = ({ onTap }) => {
  const groupRef = useRef<THREE.Group>(null);
  const steamGroupRef = useRef<THREE.Group>(null);

  // Generate 40 natural sesame seeds scattered on top bun dome
  const sesameSeeds = useMemo(() => {
    const seeds: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const seedCount = 42;
    for (let i = 0; i < seedCount; i++) {
      // Polar coordinates on upper hemisphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * 0.95; // Limit to upper dome
      const r = 1.05; // Slightly above bun surface
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.65 + 0.95; // Bun dome height
      const z = r * Math.sin(phi) * Math.sin(theta);

      seeds.push({
        pos: [x, y, z],
        rot: [phi, theta, Math.random() * 0.4 - 0.2],
      });
    }
    return seeds;
  }, []);

  // Soft rising steam particles
  const steamParticles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      speed: 0.3 + Math.random() * 0.4,
      offset: (i / 12) * Math.PI * 2,
      x: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      scale: 0.15 + Math.random() * 0.15,
    }));
  }, []);

  // Animate steam puffs slowly drifting up
  useFrame(({ clock }) => {
    if (steamGroupRef.current) {
      const t = clock.getElapsedTime();
      steamGroupRef.current.children.forEach((child, idx) => {
        const p = steamParticles[idx];
        if (p) {
          const progress = (t * p.speed + p.offset) % 1.5;
          child.position.y = 1.6 + progress * 1.2;
          child.position.x = p.x + Math.sin(t * 1.5 + idx) * 0.12;
          child.position.z = p.z + Math.cos(t * 1.2 + idx) * 0.12;
          const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          if (material) {
            // Fade in then fade out
            material.opacity = Math.sin((progress / 1.5) * Math.PI) * 0.28;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} onClick={onTap}>
      {/* 1. Ceramic Matte Serving Plate */}
      <group position={[0, -0.65, 0]}>
        {/* Main plate base */}
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[1.9, 1.6, 0.08, 48]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.15} />
        </mesh>
        {/* Raised plate rim */}
        <mesh position={[0, 0.04, 0]}>
          <torusGeometry args={[1.85, 0.06, 16, 48]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Decorative gold rim inlay */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.72, 1.76, 48]} />
          <meshStandardMaterial color="#d4af37" roughness={0.25} metalness={0.8} />
        </mesh>
      </group>

      {/* 2. Soft Contact Shadow Disc under burger */}
      <mesh position={[0, -0.59, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* 3. Bottom Brioche Bun */}
      <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 0.95, 0.28, 36]} />
        <meshStandardMaterial
          color="#c27d38"
          roughness={0.65}
          metalness={0.05}
          bumpScale={0.05}
        />
      </mesh>
      {/* Toasted bun bottom ring */}
      <mesh position={[0, -0.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.95, 32]} />
        <meshStandardMaterial color="#8c4b1d" roughness={0.8} />
      </mesh>

      {/* 4. House Aioli Sauce layer */}
      <mesh position={[0, -0.26, 0]} castShadow>
        <cylinderGeometry args={[1.02, 1.04, 0.05, 32]} />
        <meshStandardMaterial color="#fef08a" roughness={0.2} />
      </mesh>

      {/* 5. Ruffled Farm Curly Lettuce */}
      <group position={[0, -0.19, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.22, 1.15, 0.08, 24]} />
          <meshStandardMaterial
            color="#22c55e"
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
        {/* Ruffled leaf edge curls */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 1.18;
          return (
            <mesh
              key={`leaf-${i}`}
              position={[Math.cos(angle) * r, Math.sin(i * 1.5) * 0.04, Math.sin(angle) * r]}
              rotation={[Math.sin(angle) * 0.3, -angle, Math.cos(angle) * 0.3]}
              castShadow
            >
              <boxGeometry args={[0.26, 0.04, 0.3]} />
              <meshStandardMaterial color="#4ade80" roughness={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* 6. Thick Flame-Grilled Prime Patty */}
      <mesh position={[0, 0.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.32, 36]} />
        <meshStandardMaterial
          color="#3c2214"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {/* Grilled Char Ridges */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={`char-${i}`} position={[x, 0.165, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.08, 0.015, 1.8]} />
          <meshBasicMaterial color="#1a0c06" />
        </mesh>
      ))}

      {/* 7. Melted Wisconsin Cheddar Cheese Slice */}
      {/* Center melted cheese blanket */}
      <mesh position={[0, 0.19, 0]} castShadow>
        <boxGeometry args={[1.5, 0.05, 1.5]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* 4 Drooping Melted Corners */}
      {[
        { pos: [0.75, 0.12, 0.75], rot: [0.45, 0, -0.45] },
        { pos: [-0.75, 0.12, 0.75], rot: [0.45, 0, 0.45] },
        { pos: [0.75, 0.12, -0.75], rot: [-0.45, 0, -0.45] },
        { pos: [-0.75, 0.12, -0.75], rot: [-0.45, 0, 0.45] },
      ].map((c, i) => (
        <mesh
          key={`melt-${i}`}
          position={c.pos as [number, number, number]}
          rotation={c.rot as [number, number, number]}
          castShadow
        >
          <coneGeometry args={[0.22, 0.28, 4]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
      ))}

      {/* 8. Ripe Heirloom Tomato Slices */}
      <group position={[0, 0.34, 0]}>
        {/* Slice 1 */}
        <mesh position={[-0.32, 0, -0.15]} castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.14, 28]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>
        {/* Slice 2 */}
        <mesh position={[0.34, 0.02, 0.18]} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.14, 28]} />
          <meshStandardMaterial
            color="#ef4444"
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>
      </group>

      {/* 9. Caramelized Sweet Onion Rings */}
      <group position={[0, 0.48, 0]}>
        <mesh position={[-0.2, 0, 0.2]} rotation={[0.1, 0.4, 0.05]} castShadow>
          <torusGeometry args={[0.55, 0.07, 12, 28]} />
          <meshStandardMaterial color="#d97706" transparent opacity={0.88} roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.02, -0.15]} rotation={[-0.1, -0.3, 0.08]} castShadow>
          <torusGeometry args={[0.52, 0.065, 12, 28]} />
          <meshStandardMaterial color="#b45309" transparent opacity={0.85} roughness={0.4} />
        </mesh>
      </group>

      {/* 10. Golden Toasted Brioche Top Bun */}
      <group position={[0, 0.65, 0]}>
        {/* Bun Dome */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.15, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
          <meshStandardMaterial
            color="#c68642"
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>
        {/* Bun Flat Rim Base */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[1.14, 1.12, 0.12, 36]} />
          <meshStandardMaterial
            color="#b87333"
            roughness={0.55}
          />
        </mesh>
      </group>

      {/* 11. Roasted White Sesame Seeds on Top Bun Dome */}
      <group position={[0, 0, 0]}>
        {sesameSeeds.map((seed, index) => (
          <mesh
            key={`seed-${index}`}
            position={seed.pos}
            rotation={seed.rot}
            castShadow
          >
            {/* Tiny sesame seed capsule shape */}
            <capsuleGeometry args={[0.022, 0.055, 6, 8]} />
            <meshStandardMaterial
              color="#fef3c7"
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* 12. Soft Rising Steam Puffs */}
      <group ref={steamGroupRef}>
        {steamParticles.map((_, i) => (
          <mesh key={`steam-${i}`} position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
