import * as THREE from 'three';

export const THREE_CONFIG = {
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5] as [number, number, number],
  },
  gl: {
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance' as const,
    stencil: false,
    depth: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.25,
  },
  lighting: {
    ambientColor: '#ffffff',
    ambientIntensity: 0.8,
    directionalColor: '#67e8f9',
    directionalIntensity: 1.5,
    directionalPos: [3, 6, 4] as [number, number, number],
    pointColor: '#fbbf24',
    pointIntensity: 2.0,
    pointPos: [0, 1, 1] as [number, number, number],
  },
};
