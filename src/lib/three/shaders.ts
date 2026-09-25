/**
 * Custom Shaders for Holographic Magic Ring and Energy VFX
 */

export const MagicRingShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform float uIntensity;
    uniform float uPulseSpeed;
    uniform float uRotationSpeed;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    #define PI 3.14159265359

    void main() {
      // Centered polar coordinates
      vec2 center = vUv - vec2(0.5);
      float r = length(center) * 2.0; // 0 at center, 1 at ring edge
      float theta = atan(center.y, center.x);

      // Discard outside disc
      if (r > 1.0 || r < 0.2) {
        discard;
      }

      // Concentric rings pattern
      float ring1 = smoothstep(0.04, 0.0, abs(r - 0.92));
      float ring2 = smoothstep(0.03, 0.0, abs(r - 0.78));
      float ring3 = smoothstep(0.02, 0.0, abs(r - 0.58));
      float ring4 = smoothstep(0.015, 0.0, abs(r - 0.38));

      // Rotating radial rune ticks (12 and 24 segmented arcs)
      float rotTheta = theta + uTime * uRotationSpeed;
      float ticks12 = step(0.65, sin(rotTheta * 12.0));
      float runes = ticks12 * smoothstep(0.06, 0.0, abs(r - 0.85));

      float counterTheta = theta - uTime * (uRotationSpeed * 0.75);
      float ticks24 = step(0.75, sin(counterTheta * 24.0));
      float innerRunes = ticks24 * smoothstep(0.04, 0.0, abs(r - 0.68));

      // Wave ripple traveling outward
      float wave = sin(r * 18.0 - uTime * uPulseSpeed * 3.0) * 0.5 + 0.5;
      float waveBand = smoothstep(0.3, 0.9, r) * wave * 0.35;

      // Pulse glow
      float pulse = 0.85 + 0.15 * sin(uTime * uPulseSpeed);

      // Core glow composite
      float alpha = (ring1 * 1.2 + ring2 * 0.9 + ring3 * 0.7 + ring4 * 0.6 + runes * 1.1 + innerRunes * 0.9 + waveBand);
      alpha *= pulse * uIntensity;

      // Color gradient from center to edge
      vec3 color = mix(uColorPrimary, uColorSecondary, r);

      // Electric spark highlights
      float spark = pow(sin(rotTheta * 8.0 + uTime * 4.0) * 0.5 + 0.5, 6.0) * smoothstep(0.03, 0.0, abs(r - 0.92));
      color += vec3(spark * 0.8);

      gl_FragColor = vec4(color * 1.3, clamp(alpha, 0.0, 1.0));
    }
  `,
};

export const HologramFlickerShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uFresnelBias;
    uniform float uFresnelScale;
    uniform float uFresnelPower;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Scanlines
      float scanline = sin(vPosition.y * 70.0 + uTime * 5.0) * 0.12 + 0.88;

      // Scanline beam passing upward
      float beam = smoothstep(0.1, 0.0, abs(mod(vPosition.y * 0.5 - uTime * 0.6, 2.0) - 1.0)) * 0.4;

      // Subtle glitch flicker
      float flicker = 0.92 + 0.08 * sin(uTime * 32.0);

      vec3 finalColor = uColor * (scanline + beam) * flicker;
      gl_FragColor = vec4(finalColor, 0.85);
    }
  `,
};
