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
  uniform float similarity;
  uniform float smoothness;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(videoTexture, vUv);

    // Green-difference chroma keying
    float maxRB = max(texColor.r, texColor.b);
    float greenDiff = texColor.g - maxRB;

    // Smoothstep key mask
    float greenMask = smoothstep(similarity, similarity + smoothness, greenDiff);
    float alpha = 1.0 - greenMask;

    // Circular vignette fade so video borders never appear rectangular
    // Video aspect ratio is 16:9 (1.777)
    vec2 centeredUv = (vUv - vec2(0.5)) * vec2(16.0 / 9.0, 1.0);
    float dist = length(centeredUv);
    float edgeMask = 1.0 - smoothstep(0.70, 0.84, dist);
    alpha *= edgeMask;

    // Spill suppression: suppress green fringe & shift towards chakra cyan/blue
    vec3 cleanColor = texColor.rgb;
    if (cleanColor.g > cleanColor.b * 0.75) {
      cleanColor.g = min(cleanColor.g, cleanColor.b * 0.75);
    }
    // Boost chakra blue vibrancy
    cleanColor.b = min(1.0, cleanColor.b * 1.2);

    // Additive chakra core glow enhancement
    float brightness = dot(cleanColor, vec3(0.299, 0.587, 0.114));
    cleanColor += vec3(0.05, 0.45, 0.95) * pow(brightness, 2.2) * 0.6;

    cleanColor *= intensity;

    if (alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(cleanColor, alpha);
  }
`;

// Additive Aura Shader
const auraFragmentShader = `
  uniform sampler2D videoTexture;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(videoTexture, vUv);
    float maxRB = max(texColor.r, texColor.b);
    float greenDiff = texColor.g - maxRB;

    // Only glow where not green screen
    float mask = 1.0 - smoothstep(0.04, 0.14, greenDiff);

    vec2 centeredUv = (vUv - vec2(0.5)) * vec2(16.0 / 9.0, 1.0);
    float dist = length(centeredUv);
    mask *= (1.0 - smoothstep(0.74, 0.88, dist));

    if (mask < 0.02) discard;

    vec3 auraColor = vec3(0.0, 0.7, 1.0) * mask * intensity * 0.7;
    gl_FragColor = vec4(auraColor, mask * 0.75);
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

  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  // Initialize and manage HTML5 video element with sound
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/naruto-power.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.playsInline = true;
    // Set muted to true for reliable autoplay without browser policy restrictions;
    // soundManager handles the authentic jutsu audio track seamlessly!
    video.muted = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;

    video.play().catch(() => {
      // Retry on user interaction
      const playHandler = () => {
        video.play().catch(() => {});
        window.removeEventListener('click', playHandler);
        window.removeEventListener('touchstart', playHandler);
      };
      window.addEventListener('click', playHandler);
      window.addEventListener('touchstart', playHandler);
    });

    setVideoTexture(texture);

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
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
        similarity: { value: 0.04 },
        smoothness: { value: 0.12 },
        intensity: { value: effect.intensity * 1.1 },
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
        intensity: { value: effect.intensity * 1.3 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [videoTexture, effect.intensity]);

  // Spiraling Chakra Particles
  const particleCount = effect.particleCount || 220;
  const [particlePositions, particleVelocities, particlePhases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.25 + Math.random() * 0.45;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Tangential spiral vortex velocity
      vel[i * 3] = -Math.sin(theta) * (1.5 + Math.random() * 1.5);
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      vel[i * 3 + 2] = Math.cos(theta) * (1.5 + Math.random() * 1.5);

      phases[i] = Math.random() * Math.PI * 2;
    }
    return [pos, vel, phases];
  }, [particleCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Keep the Rasengan video quad facing the camera directly (3D billboard)
    if (billboardGroupRef.current) {
      billboardGroupRef.current.quaternion.copy(state.camera.quaternion);

      // High-frequency chakra vibration & breathing pulse
      const pulse = 1.0 + Math.sin(t * 16.0) * 0.035 + Math.cos(t * 26.0) * 0.02;
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

    // 3. Dynamic flickering blue point light
    if (pointLightRef.current) {
      const flicker = 3.6 + Math.sin(t * 28.0) * 0.6 + Math.cos(t * 40.0) * 0.4;
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
        if (currentR > 0.65 || currentR < 0.12) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const newR = 0.28 + Math.random() * 0.32;
          arr[idx] = newR * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = newR * Math.cos(phi);
          arr[idx + 2] = newR * Math.sin(phi) * Math.sin(theta);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const baseRadius = effect.ringRadius * 0.55;

  return (
    <group position={[0, 0.08, 0]}>
      {/* 1. Dynamic Illuminating Blue Point Light onto Palm & Fingers */}
      <pointLight
        ref={pointLightRef}
        color="#00e5ff"
        intensity={4.2 * effect.intensity}
        distance={4.0}
        decay={1.8}
        position={[0, 0, 0]}
      />

      {/* 2. Core Billboard Group (Always Facing Camera) */}
      <group ref={billboardGroupRef}>
        {/* Layer A: Primary Green-Screen-Removed Swirling Video */}
        {chromaMaterial && (
          <mesh material={chromaMaterial} scale={[1.1, 1.1, 1.1]}>
            {/* Plane aspect ratio matches 16:9 */}
            <planeGeometry args={[0.96, 0.54]} />
          </mesh>
        )}

        {/* Layer B: Slightly Scaled Additive Ethereal Chakra Aura */}
        {auraMaterial && (
          <mesh material={auraMaterial} scale={[1.25, 1.25, 1.25]} position={[0, 0, -0.01]}>
            <planeGeometry args={[0.96, 0.54]} />
          </mesh>
        )}

        {/* Layer C: White-Hot Concentrated Chakra Core Sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 3. 3D High-Speed Orbiting Kinetic Chakra Rings */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseRadius * 0.88, 0.012, 16, 64]} />
          <meshStandardMaterial
            color="#00d2ff"
            emissive="#00b4d8"
            emissiveIntensity={4.0}
            roughness={0.1}
          />
        </mesh>
      </group>

      <group ref={ring2Ref} rotation={[0.6, 0.4, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseRadius * 0.96, 0.009, 16, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={3.5}
            roughness={0.1}
          />
        </mesh>
      </group>

      <group ref={ring3Ref} rotation={[-0.5, -0.6, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseRadius * 1.05, 0.007, 16, 64]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={4.5}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 4. Spiraling Chakra Spark Particles */}
      {particlesEnabled && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.035 * effect.intensity}
            color="#7dd3fc"
            transparent
            opacity={0.92}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
