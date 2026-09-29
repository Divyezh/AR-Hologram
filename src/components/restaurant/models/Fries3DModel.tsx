"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface Fries3DModelProps {
  onTap?: () => void;
}

export const Fries3DModel: React.FC<Fries3DModelProps> = ({ onTap }) => {
  // Generate bundle of golden fries
  const fries = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; length: number }[] =
      [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const r = 0.15 + (i % 3) * 0.18;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const rotX = (Math.random() - 0.5) * 0.35 + z * 0.4;
      const rotZ = (Math.random() - 0.5) * 0.35 - x * 0.4;
      const length = 1.1 + Math.random() * 0.5;

      list.push({
        pos: [x, 0.4 + length * 0.3, z],
        rot: [rotX, Math.random() * Math.PI, rotZ],
        length,
      });
    }
    return list;
  }, []);

  return (
    <group onClick={onTap}>
      {/* Plate / Slate Tray */}
      <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.7, 1.5, 0.08, 36]} />
        <meshStandardMaterial color="#171717" roughness={0.4} />
      </mesh>

      {/* Red Branded Fry Carton */}
      <group position={[0, -0.15, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.1, 0.9]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
        {/* Golden Emblem on front */}
        <mesh position={[0, 0, 0.46]}>
          <planeGeometry args={[0.45, 0.45]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
        </mesh>
      </group>

      {/* Golden Crispy Fries */}
      <group position={[0, -0.15, 0]}>
        {fries.map((f, idx) => (
          <mesh key={`fry-${idx}`} position={f.pos} rotation={f.rot} castShadow>
            <boxGeometry args={[0.13, f.length, 0.13]} />
            <meshStandardMaterial
              color={idx % 4 === 0 ? "#eab308" : idx % 3 === 0 ? "#facc15" : "#ca8a04"}
              roughness={0.45}
            />
          </mesh>
        ))}
      </group>

      {/* Garlic Aioli Sauce Cup */}
      <group position={[0.9, -0.4, 0.6]}>
        {/* Ceramic ramekin */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.28, 0.35, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        {/* Aioli sauce surface with paprika dust */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.02, 24]} />
          <meshStandardMaterial color="#fef08a" roughness={0.15} />
        </mesh>
        {/* Paprika specks */}
        <mesh position={[0.05, 0.175, 0.04]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#b91c1c" />
        </mesh>
      </group>
    </group>
  );
};
