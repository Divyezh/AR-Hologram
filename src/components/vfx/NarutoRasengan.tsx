'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectConfig } from '../../types/effects';

interface NarutoRasenganProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

// GLSL Chroma Key Shaders for real-time green screen removal
const chromaKeyVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const chromaKeyFragmentShader = `
  uniform sampler2D videoTexture;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(videoTexture, vUv);

    // Green-difference chroma keying
    float maxRB = max(texColor.r, texColor.b);
    float greenDiff = texColor.g - maxRB;

    // Smoothstep key mask
    float greenMask = smoothstep(0.02, 0.12, greenDiff);
    float alpha = 1.0 - greenMask;

    // Circular vignette fade so video borders never appear rectangular (16:9 aspect)
    vec2 centeredUv = (vUv - vec2(0.5)) * vec2(16.0 / 9.0, 1.0);
    float dist = length(centeredUv);
    float edgeMask = 1.0 - smoothstep(0.44, 0.52, dist);
    alpha *= edgeMask;

    // Spill suppression: clamp green fringe & shift towards vibrant chakra cyan/blue
    vec3 cleanColor = texColor.rgb;
    cleanColor.g = min(cleanColor.g, maxRB);

    float despillAmount = max(0.0, texColor.g - maxRB);
    cleanColor += vec3(0.05, 0.45, 0.95) * despillAmount;

    // Boost chakra blue vibrancy & intensity
    cleanColor.b = min(1.0, cleanColor.b * 1.15);
    cleanColor *= intensity;

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(cleanColor, alpha);
  }
`;

// Additive Aura Glow Shader
const auraFragmentShader = `
  uniform sampler2D videoTexture;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(videoTexture, vUv);
    float maxRB = max(texColor.r, texColor.b);
    float greenDiff = texColor.g - maxRB;

    // Glow where chakra power is active (not green background)
    float mask = 1.0 - smoothstep(0.02, 0.14, greenDiff);

    vec2 centeredUv = (vUv - vec2(0.5)) * vec2(16.0 / 9.0, 1.0);
    float dist = length(centeredUv);
    mask *= (1.0 - smoothstep(0.45, 0.55, dist));

    if (mask < 0.01) discard;

    vec3 auraColor = vec3(0.0, 0.75, 1.0) * mask * intensity * 0.8;
    gl_FragColor = vec4(auraColor, mask * 0.7);
  }
`;

export const NarutoRasengan: React.FC<NarutoRasenganProps> = ({
  effect,
  particlesEnabled = true,
}) => {
  const billboardGroupRef = useRef<THREE.Group | null>(null);
  const ring1Ref = useRef<THREE.Group | null>(null);
  const ring2Ref = useRef<THREE.Group | null>(null);
  const ring3Ref = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  // Initialize and manage HTML5 video element with reliable autoplay and DOM attachment
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/naruto-power.mp4';
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    // Attach off-screen to DOM so mobile & Chromium engines decode video smoothly at 60fps
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    textureRef.current = texture;
    setVideoTexture(texture);

    const handleLoadedMetadata = () => {
      // Start at 0.8s to skip the initial blank green intro frame
      video.currentTime = 0.8;
      video.play().catch(() => {});
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Seamless loop avoiding the dead 0-0.75s green gap
    const handleTimeUpdate = () => {
      if (video.currentTime >= 10.15) {
        video.currentTime = 0.8;
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);

    const handleEnded = () => {
      video.currentTime = 0.8;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);

    video.play().catch(() => {
      // If browser blocks unmuted autoplay, start muted and unmute upon user touch/click
      video.muted = true;
      video.play().catch(() => {});
    });

    // Unmute video audio track and play sound upon any user interaction
    const unlockHandler = () => {
      video.muted = false;
      video.volume = 1.0;
      if (video.paused) {
        video.play().catch(() => {});
      }
    };
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('pointerdown', unlockHandler, { passive: true });

    return () => {
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('pointerdown', unlockHandler);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
      texture.dispose();
    };
  }, []);

  // Custom Chroma-Key Shader Material
  const chromaMaterial = useMemo(() => {
    if (!videoTexture) return null;
    return new THREE.ShaderMaterial({
      vertexShader: chromaKeyVertexShader,
      fragmentShader: chromaKeyFragmentShader,
      uniforms: {
        videoTexture: { value: videoTexture },
        intensity: { value: effect.intensity * 1.15 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [videoTexture, effect.intensity]);

  // Additive Glowing Aura Material
  const auraMaterial = useMemo(() => {
    if (!videoTexture) return null;
    return new THREE.ShaderMaterial({
      vertexShader: chromaKeyVertexShader,
      fragmentShader: auraFragmentShader,
      uniforms: {
        videoTexture: { value: videoTexture },
        intensity: { value: effect.intensity * 1.25 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [videoTexture, effect.intensity]);

  // Soft circular glow particle texture (replaces jagged white squares)
  const particleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(125, 211, 252, 0.9)');
      grad.addColorStop(0.6, 'rgba(2, 132, 199, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // Spiraling Chakra Particles (optimized count for 60fps mobile performance)
  const particleCount = 60;
  const [particlePositions, particleVelocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.45 + Math.random() * 0.75;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Tangential spiral vortex velocity
      vel[i * 3] = -Math.sin(theta) * (1.8 + Math.random() * 1.4);
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      vel[i * 3 + 2] = Math.cos(theta) * (1.8 + Math.random() * 1.4);
    }
    return [pos, vel];
  }, [particleCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Ensure video texture updates every frame at 60fps
    if (videoRef.current && videoRef.current.readyState >= 2 && textureRef.current) {
      textureRef.current.needsUpdate = true;
    }

    // 1. Keep the Rasengan video quad facing the camera directly in WORLD SPACE
    // Cancels out parent palm rotation so billboard never tilts edge-on or vanishes
    if (billboardGroupRef.current && billboardGroupRef.current.parent) {
      const parentWorldQuat = new THREE.Quaternion();
      billboardGroupRef.current.parent.getWorldQuaternion(parentWorldQuat);
      billboardGroupRef.current.quaternion
        .copy(parentWorldQuat)
        .invert()
        .multiply(state.camera.quaternion);

      // High-frequency subtle chakra vibration & breathing pulse
      const pulse = 1.0 + Math.sin(t * 16.0) * 0.025 + Math.cos(t * 26.0) * 0.015;
      billboardGroupRef.current.scale.set(pulse, pulse, pulse);
    }

    // 2. High-speed 3D Chakra Orbit Rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * (effect.rotationSpeed * 3.5);
      ring1Ref.current.rotation.x = Math.sin(t * 2.0) * 0.3;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * (effect.rotationSpeed * 4.2);
      ring2Ref.current.rotation.z = Math.cos(t * 2.5) * 0.4;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = t * (effect.rotationSpeed * 2.8);
      ring3Ref.current.rotation.y = t * (effect.rotationSpeed * 1.5);
    }

    // 3. Dynamic flickering blue point light illuminating the hand
    if (pointLightRef.current) {
      const flicker = 4.2 + Math.sin(t * 28.0) * 0.8 + Math.cos(t * 40.0) * 0.5;
      pointLightRef.current.intensity = flicker * effect.intensity;
    }

    // 4. Update vortex chakra particles
    if (particlesRef.current) {
      const geom = particlesRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        arr[idx] += particleVelocities[idx] * delta;
        arr[idx + 1] += particleVelocities[idx + 1] * delta;
        arr[idx + 2] += particleVelocities[idx + 2] * delta;

        // Centripetal acceleration pulling inwards toward the core
        const currentR = Math.sqrt(arr[idx] ** 2 + arr[idx + 1] ** 2 + arr[idx + 2] ** 2);
        if (currentR > 1.35 || currentR < 0.2) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const newR = 0.48 + Math.random() * 0.65;
          arr[idx] = newR * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = newR * Math.cos(phi);
          arr[idx + 2] = newR * Math.sin(phi) * Math.sin(theta);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  // Scale equal to full hand dimension
  const baseRadius = effect.ringRadius * 1.35;

  return (
    <group position={[0, 0.05, 0]}>
      {/* 1. Dynamic Illuminating Blue Point Light onto Palm & Fingers */}
      <pointLight
        ref={pointLightRef}
        color="#00e5ff"
        intensity={5.5 * effect.intensity}
        distance={6.5}
        decay={1.6}
        position={[0, 0, 0]}
      />

      {/* 2. Core Billboard Group (Scaled equal to the user's hand) */}
      <group ref={billboardGroupRef}>
        {/* Layer A: Primary Green-Screen-Removed Swirling Video */}
        {chromaMaterial && (
          <mesh material={chromaMaterial} scale={[2.65, 2.65, 2.65]}>
            {/* Plane aspect ratio matches 16:9 video */}
            <planeGeometry args={[0.96, 0.54]} />
          </mesh>
        )}

        {/* Layer B: Slightly Scaled Additive Ethereal Chakra Aura */}
        {auraMaterial && (
          <mesh material={auraMaterial} scale={[2.95, 2.95, 2.95]} position={[0, 0, -0.01]}>
            <planeGeometry args={[0.96, 0.54]} />
          </mesh>
        )}

        {/* Layer C: White-Hot Concentrated Chakra Core Sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 3. 3D High-Speed Orbiting Kinetic Chakra Rings (Scaled to encompass entire hand) */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseRadius * 0.9, 0.018, 16, 48]} />
          <meshStandardMaterial
            color="#00d2ff"
            emissive="#00b4d8"
            emissiveIntensity={4.2}
            roughness={0.1}
          />
        </mesh>
      </group>

      <group ref={ring2Ref} rotation={[0.6, 0.4, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseRadius * 1.02, 0.014, 16, 48]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={3.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      <group ref={ring3Ref} rotation={[-0.5, -0.6, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseRadius * 1.15, 0.01, 16, 48]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={4.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 4. Spiraling Chakra Spark Particles (Soft circular glow across whole hand) */}
      {particlesEnabled && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.065 * effect.intensity}
            color="#7dd3fc"
            transparent
            opacity={0.88}
            map={particleTexture || undefined}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
