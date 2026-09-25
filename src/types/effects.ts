export interface EffectConfig {
  id: string;
  name: string;
  category: 'arcane' | 'cyber' | 'cosmic' | 'elemental';
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  ringRadius: number;
  particleCount: number;
  rotationSpeed: number;
  pulseSpeed: number;
  intensity: number;
  runeStyle: 'glyphs' | 'circuit' | 'celestial' | 'elemental';
}
