"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface Pizza3DModelProps {
  onTap?: () => void;
}

export const Pizza3DModel: React.FC<Pizza3DModelProps> = ({ onTap }) => {
  // Pepperoni positions
  const pepperonis = useMemo(() => {
    return [
      [0, 0.08, 0],
      [0.6, 0.08, 0.3],
      [-0.5, 0.08, 0.5],
      [-0.4, 0.08, -0.5],
      [0.5, 0.08, -0.4],
      [0.9, 0.08, -0.1],
      [-0.8, 0.08, 0.1],
      [0.1, 0.08, 0.8],
      [-0.2, 0.08, -0.8],
    ] as [number, number, number][];
  }, []);

  // Basil leaves
  const basils = useMemo(() => {
    return [
      { pos: [0.35, 0.09, 0.1], rot: [0, 0.5, 0] },
      { pos: [-0.25, 0.09, 0.3], rot: [0, -0.7, 0] },
      { pos: [-0.1, 0.09, -0.4], rot: [0, 1.2, 0] },
      { pos: [0.3, 0.09, -0.6], rot: [0, -0.4, 0] },
    ];
  }, []);

  return (
    <group onClick={onTap}>
      {/* Wooden Pizza Board */}
      <group position={[0, -0.3, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[1.9, 1.85, 0.12, 40]} />
          <meshStandardMaterial color="#854d0e" roughness={0.7} />
        </mesh>
        {/* Handle */}
        <mesh position={[2.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.9, 16]} />
          <meshStandardMaterial color="#713f12" roughness={0.7} />
        </mesh>
      </group>

      {/* Pizza Dough Crust Base */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.08, 36]} />
        <meshStandardMaterial color="#eab308" roughness={0.6} />
      </mesh>

      {/* Raised Puffy Crust Rim */}
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.42, 0.16, 16, 40]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.65} />
      </mesh>

      {/* Tomato Sauce Layer */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.36, 1.36, 0.04, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} />
      </mesh>

      {/* Melted Fior di Latte Mozzarella */}
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.03, 32]} />
        <meshStandardMaterial color="#fef08a" roughness={0.35} />
      </mesh>

      {/* Pepperoni Slices */}
      {pepperonis.map((pos, idx) => (
        <mesh key={`pep-${idx}`} position={[pos[0], -0.11, pos[2]]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 20]} />
          <meshStandardMaterial color="#991b1b" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}

      {/* Fresh Green Basil Leaves */}
      {basils.map((b, idx) => (
        <mesh
          key={`basil-${idx}`}
          position={[b.pos[0], -0.09, b.pos[2]]}
          rotation={b.rot as [number, number, number]}
          castShadow
        >
          <boxGeometry args={[0.22, 0.015, 0.14]} />
          <meshStandardMaterial color="#15803d" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};
