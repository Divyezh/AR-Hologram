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
  onInteract?: () => void;
}

export const PikachuModel: React.FC<PikachuModelProps> = ({
  scale = 1.5,
  position = [0, -1.1, -2.5],
  rotation = [0, 0, 0],
  isSpawned = true,
  onInteract,
}) => {
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const shadowContactRef = useRef<THREE.Mesh | null>(null);
  const shadowDiffuseRef = useRef<THREE.Mesh | null>(null);

  const [isAttacking, setIsAttacking] = useState(false);
  const [sparksActive, setSparksActive] = useState(false);

  // Position interpolation for buttery smooth movement on the road
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const currentRotYRef = useRef<number>(rotation[1]);
  const isHoppingRef = useRef<boolean>(false);
  const hopProgressRef = useRef<number>(1);

  // Spawn animation state
  const spawnScaleRef = useRef<number>(0);
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
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
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
      grad.addColorStop(0, 'rgba(10, 15, 25, 0.45)');
      grad.addColorStop(0.5, 'rgba(10, 15, 25, 0.2)');
      grad.addColorStop(1, 'rgba(10, 15, 25, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Electric spark particles for Thunderbolt attack & spawn burst
  const sparkCount = 40;
  const sparkPositions = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.4;
      pos[i * 3 + 1] = Math.random() * 1.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    return pos;
  }, [sparkCount]);

  // Handle tap / click attack
  const triggerAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setSparksActive(true);

    soundManager.playPikachuCry();

    if (actions && actions['Impactrueno']) {
      const action = actions['Impactrueno'];
      action.reset().fadeIn(0.12).setLoop(THREE.LoopOnce, 1).play();
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
    if (isSpawned && !hasTriggeredSpawnSound.current) {
      hasTriggeredSpawnSound.current = true;
      setSparksActive(true);
      soundManager.playPikachuCry();
      setTimeout(() => setSparksActive(false), 1200);
    }
  }, [isSpawned]);

  // Frame loop: smooth position interpolation, hop physics, and idle breathing
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const targetVec = new THREE.Vector3(...position);

    // 1. Smooth spawn scale bounce
    if (isSpawned) {
      spawnScaleRef.current = THREE.MathUtils.damp(spawnScaleRef.current, scale, 6.0, delta);
    } else {
      spawnScaleRef.current = THREE.MathUtils.damp(spawnScaleRef.current, 0, 8.0, delta);
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
        meshGroupRef.current.rotation.z = Math.sin(t * 1.5) * 0.02;
      } else if (isAttacking) {
        meshGroupRef.current.position.y = (Math.random() - 0.5) * 0.035;
        meshGroupRef.current.position.x = (Math.random() - 0.5) * 0.035;
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
      {/* 1. Double-Layer Ground Contact Shadow on the Road Surface */}
      <group position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Layer A: Sharp Ambient Occlusion directly under feet */}
        <mesh ref={shadowContactRef} position={[0, 0, 0.002]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial
            map={contactShadowTexture || undefined}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>

        {/* Layer B: Diffuse Soft Sun Shadow on Road Pavement */}
        <mesh ref={shadowDiffuseRef} position={[0.1, -0.15, 0.001]}>
          <planeGeometry args={[1.6, 1.6]} />
          <meshBasicMaterial
            map={diffuseShadowTexture || undefined}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. Interactive 3D Pikachu Character Model */}
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
          <primitive object={clonedScene} />
        </Center>
      </group>

      {/* 3. Electric Spark Particles for Thunder Shock / Landing */}
      {sparksActive && (
        <points position={[0, 0.4, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.065}
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
          position={[0, 0.6, 0.2]}
          intensity={8}
          distance={3.5}
          color="#facc15"
        />
      )}
    </group>
  );
};
