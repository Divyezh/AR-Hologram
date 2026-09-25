'use client';

import React from 'react';
import { EffectConfig } from '../../types/effects';
import { DoctorStrangeShield } from './DoctorStrangeShield';
import { BurningFireball } from './BurningFireball';
import { MagicRing } from './MagicRing';

interface VFXRendererProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

export const VFXRenderer: React.FC<VFXRendererProps> = ({ effect, particlesEnabled = true }) => {
  switch (effect.type) {
    case 'doctor-strange':
      return <DoctorStrangeShield effect={effect} particlesEnabled={particlesEnabled} />;
    case 'fireball':
      return <BurningFireball effect={effect} particlesEnabled={particlesEnabled} />;
    case 'vortex':
    default:
      return <MagicRing effect={effect} particlesEnabled={particlesEnabled} />;
  }
};
