'use client';

import React from 'react';
import { CHARACTERS } from '../../data/characters';
import { DEFAULT_ANIMATIONS } from '../../constants/animations';
import { Play } from 'lucide-react';

interface AnimationSelectorProps {
  selectedCharacterId: string;
  selectedAnimationId: string;
  onSelectAnimation: (anim: string) => void;
}

export const AnimationSelector: React.FC<AnimationSelectorProps> = ({
  selectedCharacterId,
  selectedAnimationId,
  onSelectAnimation,
}) => {
  const char = CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0];
  const animations = char.availableAnimations;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none pointer-events-auto">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1 shrink-0">
        <Play className="w-3 h-3 text-cyan-400" /> Actions:
      </span>
      {animations.map((animName) => {
        const isSelected = selectedAnimationId === animName;
        const iconConfig = DEFAULT_ANIMATIONS.find((a) => a.id === animName);
        const icon = iconConfig ? iconConfig.icon : '⚡';

        return (
          <button
            key={animName}
            onClick={() => onSelectAnimation(animName)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-linear-to-r from-cyan-500 to-blue-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10 hover:border-white/20'
            }`}
          >
            <span>{icon}</span>
            <span>{animName}</span>
          </button>
        );
      })}
    </div>
  );
};
