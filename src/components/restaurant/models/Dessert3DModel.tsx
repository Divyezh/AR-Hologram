"use client";

import React from "react";
import * as THREE from "three";

interface Dessert3DModelProps {
  onTap?: () => void;
}

export const Dessert3DModel: React.FC<Dessert3DModelProps> = ({ onTap }) => {
  return (
    <group onClick={onTap}>
      {/* Porcelain Dessert Plate */}
      <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.7, 1.45, 0.07, 36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Raspberry Coulis Swirl Drizzle */}
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.25, 32]} />
        <meshBasicMaterial color="#be123c" transparent opacity={0.65} />
      </mesh>

      {/* Warm Dark Chocolate Souffle Cake */}
      <group position={[-0.35, -0.15, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.85, 0.55, 28]} />
          <meshStandardMaterial color="#2d150b" roughness={0.7} />
        </mesh>

        {/* Powdered Sugar Dusting */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 0.01, 24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>

        {/* Melted Molten Chocolate Core Breach */}
        <mesh position={[0.3, -0.18, 0.3]} castShadow>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color="#1a0b05" roughness={0.15} metalness={0.2} />
        </mesh>
      </group>

      {/* Vanilla Gelato Quenelle Scoop */}
      <group position={[0.55, -0.22, -0.1]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.35} />
        </mesh>
        {/* Mint Sprig */}
        <mesh position={[0, 0.38, 0]} rotation={[0.2, 0, 0.4]}>
          <boxGeometry args={[0.15, 0.02, 0.22]} />
          <meshStandardMaterial color="#15803d" roughness={0.3} />
        </mesh>
      </group>

      {/* Fresh Raspberries */}
      {[-0.2, 0.2].map((offset, i) => (
        <mesh key={`berry-${i}`} position={[0.4 + offset, -0.38, 0.45]} castShadow>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#dc2626" roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};
