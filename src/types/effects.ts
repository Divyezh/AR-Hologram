export type EffectType = 'doctor-strange' | 'fireball' | 'vortex' | 'lightning';

export interface EffectConfig {
  id: string;
  name: string;
  category: 'arcane' | 'fire' | 'cosmic' | 'lightning';
  type: EffectType;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  ringRadius: number;
  particleCount: number;
  rotationSpeed: number;
  pulseSpeed: number;
  intensity: number;
  soundType: 'mandala' | 'fire' | 'cosmic' | 'lightning';
}
