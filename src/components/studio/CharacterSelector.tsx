'use client';

import React from 'react';
import { CHARACTERS } from '../../data/characters';
import { Bot, Sparkles, Flame, Gem } from 'lucide-react';

interface CharacterSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedId, onSelect }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'robot':
        return <Bot className="w-3.5 h-3.5" />;
      case 'creature':
        return <Flame className="w-3.5 h-3.5" />;
      case 'elemental':
      default:
        return <Gem className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pointer-events-auto">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1 shrink-0">
        <Sparkles className="w-3 h-3 text-cyan-400" /> Character:
      </span>
      {CHARACTERS.map((char) => {
        const isSelected = selectedId === char.id;
        return (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-neutral-900 border-2 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                : 'bg-black/50 hover:bg-neutral-900 text-neutral-300 border border-white/10 hover:border-white/25'
            }`}
          >
            <span style={{ color: char.accentColor }}>{getIcon(char.category)}</span>
            <span>{char.name}</span>
            {char.type === 'glb' && (
              <span className="text-[9px] px-1 rounded bg-white/10 text-neutral-400 uppercase">3D</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
