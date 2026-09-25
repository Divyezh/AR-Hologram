'use client';

import React from 'react';
import { MagicRing } from './MagicRing';
import { EffectConfig } from '../../types/effects';

interface EnergyRingProps {
  effect: EffectConfig;
  particlesEnabled?: boolean;
}

export const EnergyRing: React.FC<EnergyRingProps> = ({ effect, particlesEnabled }) => {
  return <MagicRing effect={effect} particlesEnabled={particlesEnabled} />;
};
