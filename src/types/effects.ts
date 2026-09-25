export type EffectType = 'doctor-strange' | 'fireball' | 'vortex' | 'lightning' | 'naruto';

export interface EffectConfig {
  id: string;
  name: string;
  category: 'arcane' | 'fire' | 'cosmic' | 'lightning' | 'chakra';
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
  soundType: 'mandala' | 'fire' | 'cosmic' | 'lightning' | 'naruto';
}
