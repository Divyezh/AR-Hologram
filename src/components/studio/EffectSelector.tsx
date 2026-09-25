'use client';

import React from 'react';
import { EFFECTS } from '../../data/effects';
import { Wand2, Flame, Shield, Zap, Orbit } from 'lucide-react';

interface EffectSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const EffectSelector: React.FC<EffectSelectorProps> = ({ selectedId, onSelect }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'doctor-strange':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'fireball':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'lightning':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'cosmic':
      default:
        return <Orbit className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pointer-events-auto">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1 shrink-0">
        <Wand2 className="w-3 h-3 text-amber-400" /> VFX Shield / Fire:
      </span>
      {EFFECTS.map((effect) => {
        const isSelected = selectedId === effect.id;
        const isSpecial = effect.id === 'doctor-strange' || effect.id === 'burning-fireball';

        return (
          <button
            key={effect.id}
            onClick={() => onSelect(effect.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-neutral-900 border-2 border-amber-400 text-white shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105'
                : 'bg-black/50 hover:bg-neutral-900 text-neutral-300 border border-white/10 hover:border-white/25'
            }`}
          >
            {getIcon(effect.type)}
            <span>{effect.name}</span>
            {isSpecial && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                NEW
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
