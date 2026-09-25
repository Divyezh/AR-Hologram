'use client';

import React, { useState } from 'react';
import { CharacterSelector } from './CharacterSelector';
import { EffectSelector } from './EffectSelector';
import { AnimationSelector } from '../animations/AnimationSelector';
import { GlassPanel } from '../ui/GlassPanel';
import { SlidersHorizontal, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface StudioControlsProps {
  selectedCharacterId: string;
  selectedEffectId: string;
  selectedAnimationId: string;
  particlesEnabled: boolean;
  effectsIntensity: number;
  onSelectCharacter: (id: string) => void;
  onSelectEffect: (id: string) => void;
  onSelectAnimation: (anim: string) => void;
  onToggleParticles: () => void;
  onSetIntensity: (val: number) => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  selectedCharacterId,
  selectedEffectId,
  selectedAnimationId,
  particlesEnabled,
  effectsIntensity,
  onSelectCharacter,
  onSelectEffect,
  onSelectAnimation,
  onToggleParticles,
  onSetIntensity,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 max-w-4xl mx-auto pointer-events-none">
      <GlassPanel className="rounded-3xl p-3.5 space-y-2.5 pointer-events-auto border-white/15">
        {/* Row 1: Character Selector */}
        <CharacterSelector
          selectedId={selectedCharacterId}
          onSelect={onSelectCharacter}
        />

        {/* Row 2: Effect Selector */}
        <EffectSelector
          selectedId={selectedEffectId}
          onSelect={onSelectEffect}
        />

        {/* Row 3: Action / Animation Selector */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
          <AnimationSelector
            selectedCharacterId={selectedCharacterId}
            selectedAnimationId={selectedAnimationId}
            onSelectAnimation={onSelectAnimation}
          />

          {/* Quick Settings Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title="VFX Tuning"
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable VFX fine-tuning controls */}
        {isExpanded && (
          <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between gap-3 px-2">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                VFX Intensity
              </span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={effectsIntensity}
                onChange={(e) => onSetIntensity(parseFloat(e.target.value))}
                className="w-32 accent-cyan-400 cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-cyan-400">{effectsIntensity.toFixed(1)}x</span>
            </div>

            <div className="flex items-center justify-between gap-3 px-2">
              <span className="text-neutral-400">Magic Dust Particles</span>
              <button
                onClick={onToggleParticles}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  particlesEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-neutral-800 text-neutral-400 border border-white/5'
                }`}
              >
                {particlesEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
};
