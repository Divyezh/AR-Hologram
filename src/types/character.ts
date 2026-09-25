export type CharacterType = 'glb' | 'procedural';

export interface CharacterConfig {
  id: string;
  name: string;
  category: 'robot' | 'creature' | 'elemental';
  description: string;
  modelPath: string;
  scale: number;
  positionOffset: [number, number, number];
  rotationOffset: [number, number, number];
  defaultAnimation: string;
  availableAnimations: string[];
  type: CharacterType;
  accentColor: string;
  hologramHue: number;
}
