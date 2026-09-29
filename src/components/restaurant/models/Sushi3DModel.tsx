"use client";

import React from "react";
import * as THREE from "three";

interface Sushi3DModelProps {
  onTap?: () => void;
}

export const Sushi3DModel: React.FC<Sushi3DModelProps> = ({ onTap }) => {
  const sushiRolls = [-0.9, -0.45, 0, 0.45, 0.9];

  return (
    <group onClick={onTap}>
      {/* Black Slate Serving Platter */}
      <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.5, 0.08, 1.4]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Dragon Sushi Rolls */}
      {sushiRolls.map((x, idx) => (
        <group key={`roll-${idx}`} position={[x, -0.15, -0.05]}>
          {/* Nori Wrap (outer dark green cylinder) */}
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.35, 24]} />
            <meshStandardMaterial color="#064e3b" roughness={0.6} />
          </mesh>

          {/* Seasoned Sushi Rice Layer */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.355, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>

          {/* Salmon / Tuna Core */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.36, 16]} />
            <meshStandardMaterial color="#f87171" roughness={0.3} />
          </mesh>

          {/* Avocado Slice draped on top */}
          <mesh position={[0, 0.32, 0]} rotation={[0, 0, 0.1]} castShadow>
            <boxGeometry args={[0.32, 0.06, 0.3]} />
            <meshStandardMaterial color="#84cc16" roughness={0.35} />
          </mesh>

          {/* Orange Tobiko Caviar pearls */}
          <mesh position={[0, 0.37, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#f97316" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Pair of Wooden Bamboo Chopsticks */}
      <group position={[0, -0.34, 0.5]}>
        <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.045, 2.2, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.03, 0.1]} rotation={[0, 0.05, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.045, 2.2, 12]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
      </group>

      {/* Wasabi Rosette & Pickled Ginger */}
      <group position={[-0.95, -0.28, 0.4]}>
        {/* Wasabi mount */}
        <mesh castShadow>
          <coneGeometry args={[0.18, 0.22, 12]} />
          <meshStandardMaterial color="#65a30d" roughness={0.5} />
        </mesh>
        {/* Pickled pink ginger pile */}
        <mesh position={[0.3, -0.02, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#fda4af" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
