'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectConfig } from '../../types/effects';

interface DoctorStrangeShieldProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

// GLSL Chroma / Luminance Shaders for real-time black background removal
const strangeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Primary Black Background Removal Shader
const strangeFragmentShader = `
  uniform sampler2D videoTexture;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(videoTexture, vUv);

    // Black background keying: find maximum color intensity
    float maxChannel = max(texColor.r, max(texColor.g, texColor.b));

    // Smoothstep alpha: completely cuts off black background & noise
    // while keeping delicate magic glyph edges and sparks smooth
    float alpha = smoothstep(0.03, 0.16, maxChannel);

    // Circular vignette mask: trims off 16:9 rectangular video borders
    vec2 centeredUv = (vUv - vec2(0.5)) * vec2(16.0 / 9.0, 1.0);
    float dist = length(centeredUv);
    float edgeMask = 1.0 - smoothstep(0.44, 0.485, dist);
    alpha *= edgeMask;

    if (alpha < 0.005) {
      discard;
    }

    // Eldritch fiery crimson red & golden runes enhancement
    vec3 color = texColor.rgb;

    // Remove dark compression fringe
    color = color / max(alpha, 0.18);

    // Boost fiery crimson red vibrance & intense magic radiance
    color.r = min(1.0, color.r * 1.32);
    color.g = min(1.0, color.g * 0.90);
    color.b = min(1.0, color.b * 0.80);
    color *= intensity * 1.4;

    gl_FragColor = vec4(color, alpha);
  }
`;

// Additive Glowing Aura Shader
const strangeAuraFragmentShader = `
  uniform sampler2D videoTexture;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(videoTexture, vUv);
    float maxChannel = max(texColor.r, max(texColor.g, texColor.b));

    // Glow where Tao Mandala magic is active
    float mask = smoothstep(0.03, 0.22, maxChannel);

    vec2 centeredUv = (vUv - vec2(0.5)) * vec2(16.0 / 9.0, 1.0);
    float dist = length(centeredUv);
    mask *= (1.0 - smoothstep(0.44, 0.52, dist));

    if (mask < 0.01) discard;

    // Glowing warm crimson-red fiery eldritch aura
    vec3 auraColor = vec3(1.0, 0.28, 0.03) * mask * intensity * 1.05;
    gl_FragColor = vec4(auraColor, mask * 0.82);
  }
`;

export const DoctorStrangeShield: React.FC<DoctorStrangeShieldProps> = ({
  effect,
  particlesEnabled = true,
}) => {
  const mandalaGroupRef = useRef<THREE.Group | null>(null);
  const sparkPointsRef = useRef<THREE.Points | null>(null);
  const outerSparksRef = useRef<THREE.Group | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  // Initialize and manage HTML5 video element with seamless loop & hardware acceleration
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/dr-strange-power.mp4';
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = false; // Start with sound enabled
    video.autoplay = true;
    video.loop = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    // Attach off-screen to DOM so Chromium & mobile hardware decoders run smoothly at 60fps
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
    texture.generateMipmaps = false; // Critical: eliminates mipmap GPU recalculation lag
    textureRef.current = texture;
    setVideoTexture(texture);

    // Seamless loop timestamps:
    // Video has 0 to 0.55s black intro and 9.2s to 10.0s black outro.
    // Looping between 0.60s and 9.15s ensures 100% continuous, non-stop, fluid magic without black stutter!
    const LOOP_START = 0.6;
    const LOOP_END = 9.15;

    const handleLoadedMetadata = () => {
      video.currentTime = LOOP_START;
      video.play().catch(() => {
        // If unmuted autoplay blocked by browser policy, play muted and unlock on first click/touch
        video.muted = true;
        video.play().catch(() => {});
      });
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    const handleTimeUpdate = () => {
      if (video.currentTime >= LOOP_END) {
        video.currentTime = LOOP_START;
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);

    const handleEnded = () => {
      video.currentTime = LOOP_START;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);

    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });

    // Unmute upon user interaction
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

  // Custom Background-Removed Material
  const chromaMaterial = useMemo(() => {
    if (!videoTexture) return null;
    return new THREE.ShaderMaterial({
      vertexShader: strangeVertexShader,
      fragmentShader: strangeFragmentShader,
      uniforms: {
        videoTexture: { value: videoTexture },
        intensity: { value: effect.intensity * 1.2 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [videoTexture, effect.intensity]);

  // Additive Glowing Fire Aura Material
  const auraMaterial = useMemo(() => {
    if (!videoTexture) return null;
    return new THREE.ShaderMaterial({
      vertexShader: strangeVertexShader,
      fragmentShader: strangeAuraFragmentShader,
      uniforms: {
        videoTexture: { value: videoTexture },
        intensity: { value: effect.intensity * 1.3 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [videoTexture, effect.intensity]);

  // Tangential fiery spark particles on the perimeter
  const sparkCount = 80;
  const radius = effect.ringRadius * 1.15;

  const [sparkPositions, sparkVelocities, sparkLife] = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const vel = new Float32Array(sparkCount * 3);
    const life = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.94 + Math.random() * 0.12);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 0.01;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      // Tangential velocity around the rim
      vel[i * 3] = -Math.sin(angle) * (1.1 + Math.random() * 0.5);
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      vel[i * 3 + 2] = Math.cos(angle) * (1.1 + Math.random() * 0.5);

      life[i] = Math.random();
    }
    return [pos, vel, life];
  }, [radius, sparkCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Update video texture smoothly at 60fps
    if (videoRef.current && videoRef.current.readyState >= 2 && textureRef.current) {
      textureRef.current.needsUpdate = true;
    }

    // Dynamic fire flicker point light on palm
    if (pointLightRef.current) {
      const flicker = 4.5 + Math.sin(t * 22.0) * 0.8 + Math.cos(t * 35.0) * 0.5;
      pointLightRef.current.intensity = flicker * effect.intensity;
    }

    // High-frequency subtle mystical vibration & breathing pulse
    if (mandalaGroupRef.current) {
      const pulse = 1.0 + Math.sin(t * 12.0) * 0.015 + Math.cos(t * 20.0) * 0.008;
      mandalaGroupRef.current.scale.set(pulse, pulse, pulse);
    }

    // Rotate outer fiery spark ring
    if (outerSparksRef.current) {
      outerSparksRef.current.rotation.y = t * 0.8;
    }

    // Update spark particles
    if (sparkPointsRef.current) {
      const geom = sparkPointsRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < sparkCount; i++) {
        const idx = i * 3;
        arr[idx] += sparkVelocities[idx] * delta;
        arr[idx + 1] += sparkVelocities[idx + 1] * delta;
        arr[idx + 2] += sparkVelocities[idx + 2] * delta;

        sparkLife[i] -= delta * 1.5;

        if (sparkLife[i] <= 0) {
          sparkLife[i] = 1.0;
          const angle = Math.random() * Math.PI * 2;
          const r = radius * (0.94 + Math.random() * 0.08);
          arr[idx] = Math.cos(angle) * r;
          arr[idx + 1] = 0.01;
          arr[idx + 2] = Math.sin(angle) * r;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  // Scale matching palm dimensions
  const planeHeight = radius * 2.25;
  const planeWidth = planeHeight * (16.0 / 9.0);

  return (
    <group position={[0, 0.035, 0]}>
      {/* 1. Dynamic Illuminating Amber/Crimson Light onto Palm & Fingers */}
      <pointLight
        ref={pointLightRef}
        color="#ff3b00"
        intensity={5.4 * effect.intensity}
        distance={5.5}
        decay={1.6}
        position={[0, 0.1, 0]}
      />

      {/* 2. Main Doctor Strange Tao Mandala Video Power Group */}
      <group ref={mandalaGroupRef}>
        {/* Layer A: Primary Black-Background-Removed Tao Mandala Video */}
        {chromaMaterial && (
          <mesh
            material={chromaMaterial}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.002, 0]}
          >
            {/* Aspect ratio matches 16:9 video so mandala is perfectly circular */}
            <planeGeometry args={[planeWidth, planeHeight]} />
          </mesh>
        )}

        {/* Layer B: Slightly Scaled Additive Radiant Fire Glow */}
        {auraMaterial && (
          <mesh
            material={auraMaterial}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            scale={[1.06, 1.06, 1.06]}
          >
            <planeGeometry args={[planeWidth, planeHeight]} />
          </mesh>
        )}

        {/* Layer C: White-Hot Center Concentrated Spell Core */}
        <mesh position={[0, 0.005, 0]}>
          <circleGeometry args={[0.07, 32]} />
          <meshBasicMaterial
            color="#fff8e7"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3. Outer Blazing Pyrotechnic Sparks */}
      {particlesEnabled && (
        <group ref={outerSparksRef}>
          <points ref={sparkPointsRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial
              size={0.045 * effect.intensity}
              color="#ff4400"
              transparent
              opacity={0.92}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>
        </group>
      )}
    </group>
  );
};
