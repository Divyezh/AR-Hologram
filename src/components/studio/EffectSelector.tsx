'use client';

import React from 'react';
import { EFFECTS } from '../../data/effects';
import { Wand2 } from 'lucide-react';

interface EffectSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const EffectSelector: React.FC<EffectSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pointer-events-auto">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1 shrink-0">
        <Wand2 className="w-3 h-3 text-cyan-400" /> Magic Ring:
      </span>
      {EFFECTS.map((effect) => {
        const isSelected = selectedId === effect.id;
        return (
          <button
            key={effect.id}
            onClick={() => onSelect(effect.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-neutral-900 border-2 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-black/50 hover:bg-neutral-900 text-neutral-300 border border-white/10 hover:border-white/25'
            }`}
          >
            {/* Color swatch indicator */}
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{
                backgroundColor: effect.primaryColor,
                boxShadow: `0 0 8px ${effect.glowColor}`,
              }}
            />
            <span>{effect.name}</span>
          </button>
        );
      })}
    </div>
  );
};
