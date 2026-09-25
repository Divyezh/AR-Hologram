'use client';

import React, { useState } from 'react';
import { EFFECTS } from '../../data/effects';
import { CHARACTERS } from '../../data/characters';
import { Shield, Flame, Wand2, Bot, Play, Sliders, X, Wind } from 'lucide-react';
import { soundManager } from '../../lib/audio/soundManager';

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

type TrayMode = 'none' | 'vfx' | 'character' | 'animation' | 'settings';

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
  const [activeTray, setActiveTray] = useState<TrayMode>('none');

  const toggleTray = (mode: TrayMode) => {
    soundManager.playClick();
    setActiveTray(activeTray === mode ? 'none' : mode);
  };

  const currentChar = CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0];
  const currentEffect = EFFECTS.find((e) => e.id === selectedEffectId) || EFFECTS[0];

  return (
    <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-4">
      {/* 1. Floating Squircle Selection Tray (Opens on top of dock) */}
      {activeTray !== 'none' && (
        <div className="mb-3 w-full max-w-md p-4 rounded-4xl bg-black/60 backdrop-blur-3xl border border-white/16 shadow-[0_16px_40px_rgba(0,0,0,0.6)] pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/8">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
              {activeTray === 'vfx' && 'Choose AR Effect'}
              {activeTray === 'character' && 'Choose 3D Avatar'}
              {activeTray === 'animation' && 'Avatar Actions'}
              {activeTray === 'settings' && 'VFX Tuning'}
            </span>
            <button
              onClick={() => setActiveTray('none')}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* VFX Tray */}
          {activeTray === 'vfx' && (
            <div className="grid grid-cols-2 gap-2">
              {EFFECTS.map((effect) => {
                const isSelected = selectedEffectId === effect.id;
                return (
                  <button
                    key={effect.id}
                    onClick={() => {
                      onSelectEffect(effect.id);
                      setActiveTray('none');
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/8'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-black text-white' : 'bg-white/10 text-amber-300'
                      }`}
                    >
                      {effect.type === 'naruto' && <Wind className="w-4 h-4 text-cyan-400" />}
                      {effect.type === 'doctor-strange' && <Shield className="w-4 h-4" />}
                      {effect.type === 'fireball' && <Flame className="w-4 h-4 text-orange-400" />}
                      {effect.type === 'vortex' && <Wand2 className="w-4 h-4 text-purple-300" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">{effect.name}</span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-neutral-600' : 'text-white/40'}`}>
                        {effect.type === 'naruto' ? 'Chakra Vortex' : effect.type === 'doctor-strange' ? 'Tao Mandala' : effect.type === 'fireball' ? 'Flame Core' : 'Vortex'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Character Tray */}
          {activeTray === 'character' && (
            <div className="grid grid-cols-2 gap-2">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      onSelectCharacter(char.id);
                      setActiveTray('none');
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/8'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-black text-white' : 'bg-white/10'
                      }`}
                      style={{ color: isSelected ? '#ffffff' : char.accentColor }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">{char.name}</span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-neutral-600' : 'text-white/40'}`}>
                        {char.type.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Animation Tray */}
          {activeTray === 'animation' && (
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {currentChar.availableAnimations.map((anim) => {
                const isSelected = selectedAnimationId === anim;
                return (
                  <button
                    key={anim}
                    onClick={() => {
                      onSelectAnimation(anim);
                      setActiveTray('none');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black shadow-sm'
                        : 'bg-white/8 hover:bg-white/15 text-white/80'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{anim}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Settings Tray */}
          {activeTray === 'settings' && (
            <div className="space-y-3 text-xs text-white/80 pt-1">
              <div className="flex items-center justify-between">
                <span>VFX Glow Intensity</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={effectsIntensity}
                  onChange={(e) => onSetIntensity(parseFloat(e.target.value))}
                  className="w-32 accent-white cursor-pointer"
                />
                <span className="font-mono text-white/90 w-8 text-right">{effectsIntensity.toFixed(1)}x</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/8">
                <span>Ember & Spark Particles</span>
                <button
                  onClick={onToggleParticles}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    particlesEnabled ? 'bg-white text-black' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {particlesEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Floating Pill Dock (Directly Inspired by Reference 2 Lūma Dock) */}
      <nav className="flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-3xl border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.5)] pointer-events-auto">
        {/* Effect Selector Button */}
        <button
          onClick={() => toggleTray('vfx')}
          title="AR Shield / Fireball / Jutsu Effect"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeTray === 'vfx'
              ? 'bg-white text-black shadow-sm'
              : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
        >
          {currentEffect.type === 'naruto' ? (
            <Wind className="w-4 h-4 text-cyan-400" />
          ) : currentEffect.type === 'doctor-strange' ? (
            <Shield className="w-4 h-4 text-amber-400" />
          ) : currentEffect.type === 'fireball' ? (
            <Flame className="w-4 h-4 text-orange-400" />
          ) : (
            <Wand2 className="w-4 h-4 text-purple-300" />
          )}
          <span className="text-xs font-medium truncate max-w-25 sm:max-w-32.5">
            {currentEffect.name}
          </span>
        </button>

        {/* Character Selector Button */}
        <button
          onClick={() => toggleTray('character')}
          title="3D Avatar"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeTray === 'character'
              ? 'bg-white text-black shadow-sm'
              : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-300" />
          <span className="text-xs font-medium truncate max-w-22.5 sm:max-w-30">
            {currentChar.name}
          </span>
        </button>

        {/* Action Button */}
        <button
          onClick={() => toggleTray('animation')}
          title="Avatar Action"
          className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeTray === 'animation'
              ? 'bg-white text-black shadow-sm'
              : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => toggleTray('settings')}
          title="Settings & Tuning"
          className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeTray === 'settings'
              ? 'bg-white text-black shadow-sm'
              : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
