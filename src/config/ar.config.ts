export const AR_CONFIG = {
  // Smoothing factors: higher = more responsive, lower = smoother (0.0 to 1.0)
  smoothing: {
    positionLerp: 0.35,
    rotationLerp: 0.28,
    scaleLerp: 0.3,
    quaternionSlerp: 0.3,
    // Snap threshold for sudden fast movements or hand reappearance
    snapDistanceThreshold: 1.2,
    // Max frames to persist anchor after tracking loss before fading out
    disappearanceLagFrames: 6,
  },
  // Three.js virtual camera
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    defaultDistanceZ: 5,
  },
  // Default VFX settings
  vfx: {
    defaultRingRadius: 0.85,
    pulseAmplitude: 0.08,
    pulseSpeed: 2.5,
    particlesCount: 120,
  },
};
