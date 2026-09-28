'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Center } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { soundManager } from '../../lib/audio/soundManager';

interface PikachuModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isSpawned?: boolean;
  visible?: boolean;
  onInteract?: () => void;
}

export const PikachuModel: React.FC<PikachuModelProps> = ({
  scale = 0.55, // Size of a 5-year-old child (~1.10m tall)
  position = [0, -1.15, -2.6],
  rotation = [0, 0, 0],
  isSpawned = true,
  visible = true,
  onInteract,
}) => {
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const shadowContactRef = useRef<THREE.Mesh | null>(null);
  const shadowDiffuseRef = useRef<THREE.Mesh | null>(null);

  const [isAttacking, setIsAttacking] = useState(false);
  const [sparksActive, setSparksActive] = useState(false);

  // Position interpolation for buttery smooth movement on the road / land
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const currentRotYRef = useRef<number>(rotation[1]);
  const isHoppingRef = useRef<boolean>(false);
  const hopProgressRef = useRef<number>(1);

  // Spawn scale animation (initialized to full scale for immediate visibility)
  const spawnScaleRef = useRef<number>(scale);
  const hasTriggeredSpawnSound = useRef<boolean>(false);

  const { scene, animations } = useGLTF('/models/pokemon/pikachu.glb');
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, clonedScene);

  // 1. Dark ambient occlusion contact shadow (tightly under feet on road)
  const contactShadowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 56);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 2. Diffuse sun shadow (softer, wider falloff on asphalt)
  const diffuseShadowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
      grad.addColorStop(0, 'rgba(10, 15, 25, 0.55)');
      grad.addColorStop(0.5, 'rgba(10, 15, 25, 0.25)');
      grad.addColorStop(1, 'rgba(10, 15, 25, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Electric spark particles for Thunderbolt attack & spawn burst
  const sparkCount = 45;
  const sparkPositions = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = Math.random() * 1.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, [sparkCount]);

  // Handle tap / attack trigger
  const triggerAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setSparksActive(true);

    soundManager.playPikachuCry();

    if (actions && actions['Impactrueno']) {
      const action = actions['Impactrueno'];
      action.reset().fadeIn(0.1).setLoop(THREE.LoopOnce, 1).play();
      action.clampWhenFinished = true;
    }

    if (onInteract) {
      onInteract();
    }

    setTimeout(() => {
      setSparksActive(false);
      setIsAttacking(false);
      if (actions && actions['Impactrueno']) {
        actions['Impactrueno'].fadeOut(0.25);
      }
    }, 1800);
  };

  // Play spawn sound on first appearance
  useEffect(() => {
    if (isSpawned && visible && !hasTriggeredSpawnSound.current) {
      hasTriggeredSpawnSound.current = true;
      setSparksActive(true);
      soundManager.playPikachuCry();
      setTimeout(() => setSparksActive(false), 1200);
    }
  }, [isSpawned, visible]);

  // Frame loop: smooth position interpolation, hop physics, and idle breathing
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const targetVec = new THREE.Vector3(...position);

    // 1. Smooth spawn scale bounce & camera disappearance
    // If not visible (camera moved away from surface) or not spawned: damp to 0
    const targetScale = isSpawned && visible ? scale : 0;
    spawnScaleRef.current = THREE.MathUtils.damp(spawnScaleRef.current, targetScale, 7.0, delta);

    if (rootGroupRef.current) {
      if (spawnScaleRef.current < 0.002) {
        rootGroupRef.current.visible = false;
        return;
      }
      rootGroupRef.current.visible = true;
    }

    // 2. Smooth movement to target road position (lerp/damp)
    const dist = currentPosRef.current.distanceTo(targetVec);
    if (dist > 0.04) {
      isHoppingRef.current = true;
      hopProgressRef.current = Math.min(1, hopProgressRef.current + delta * 3.5);

      // Rotate to face travel direction
      const dx = targetVec.x - currentPosRef.current.x;
      const dz = targetVec.z - currentPosRef.current.z;
      const targetAngle = Math.atan2(dx, dz);
      currentRotYRef.current = THREE.MathUtils.damp(currentRotYRef.current, targetAngle, 8.0, delta);

      // Damp position smoothly
      currentPosRef.current.x = THREE.MathUtils.damp(currentPosRef.current.x, targetVec.x, 5.0, delta);
      currentPosRef.current.z = THREE.MathUtils.damp(currentPosRef.current.z, targetVec.z, 5.0, delta);
    } else {
      isHoppingRef.current = false;
      hopProgressRef.current = 0;
      // Face camera / user rotation
      currentRotYRef.current = THREE.MathUtils.damp(currentRotYRef.current, rotation[1], 4.0, delta);
    }

    // Apply hopping vertical arc or idle breathing
    let hopOffset = 0;
    if (isHoppingRef.current) {
      hopOffset = Math.sin(hopProgressRef.current * Math.PI) * 0.22;
    }

    if (rootGroupRef.current) {
      rootGroupRef.current.position.set(
        currentPosRef.current.x,
        position[1] + hopOffset,
        currentPosRef.current.z
      );
      rootGroupRef.current.rotation.y = currentRotYRef.current;
      rootGroupRef.current.scale.setScalar(spawnScaleRef.current);
    }

    // Idle motion & attack vibration
    if (meshGroupRef.current) {
      if (!isAttacking && !isHoppingRef.current) {
        meshGroupRef.current.position.y = Math.sin(t * 3.0) * 0.02;
        meshGroupRef.current.rotation.z = Math.sin(t * 1.5) * 0.015;
      } else if (isAttacking) {
        meshGroupRef.current.position.y = (Math.random() - 0.5) * 0.04;
        meshGroupRef.current.position.x = (Math.random() - 0.5) * 0.04;
      }
    }

    // Dynamic ground shadow scaling & breathing
    if (shadowContactRef.current) {
      const contactScale = isHoppingRef.current
        ? Math.max(0.6, 1.0 - hopOffset * 1.5)
        : 1.0 + Math.sin(t * 3.0) * 0.05;
      shadowContactRef.current.scale.set(contactScale, contactScale, 1);
    }

    if (shadowDiffuseRef.current) {
      const diffScale = isHoppingRef.current
        ? Math.max(0.7, 1.2 - hopOffset * 1.0)
        : 1.25 + Math.sin(t * 3.0) * 0.06;
      shadowDiffuseRef.current.scale.set(diffScale, diffScale, 1);
    }
  });

  return (
    <group ref={rootGroupRef}>
      {/* 1. Double-Layer Ground Contact Shadow directly under feet on the Surface */}
      <group position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Layer A: Sharp Ambient Occlusion directly under feet */}
        <mesh ref={shadowContactRef} position={[0, 0, 0.002]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial
            map={contactShadowTexture || undefined}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>

        {/* Layer B: Diffuse Soft Sun Shadow on Road Pavement */}
        <mesh ref={shadowDiffuseRef} position={[0.08, -0.12, 0.001]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial
            map={diffuseShadowTexture || undefined}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. Interactive 3D Pikachu Character Model (Rotated -90° on X to stand upright on feet) */}
      <group
        ref={meshGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          triggerAttack();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          triggerAttack();
        }}
      >
        <Center bottom>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <primitive object={clonedScene} />
          </group>
        </Center>
      </group>

      {/* 3. Electric Spark Particles for Thunder Shock / Landing */}
      {sparksActive && (
        <points position={[0, 0.6, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.07}
            color="#fef08a"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* 4. Local Dynamic Lighting for Electric Shock Burst */}
      {isAttacking && (
        <pointLight
          position={[0, 0.8, 0.3]}
          intensity={10}
          distance={4}
          color="#facc15"
        />
      )}
    </group>
  );
};
