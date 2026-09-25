'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Flame, Play, Volume2, VolumeX, Camera, ChevronRight, Eye } from 'lucide-react';
import { soundManager } from '../../lib/audio/soundManager';

export const SingleHeroPage: React.FC = () => {
  const [activePreset, setActivePreset] = useState<'strange' | 'fire' | 'robot'>('strange');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) soundManager.playClick();
  };

  const presets = {
    strange: {
      tag: 'Tao Mandala',
      title: 'Doctor Strange',
      subtitle: 'Eldritch Shield',
      desc: 'Summon the Sorcerer Supreme mystic mandala upon your palm with counter-rotating sacred octagrams and fiery sparks.',
      gradient: 'from-amber-600/30 via-orange-600/20 to-transparent',
      accent: '#f59e0b',
      icon: <Shield className="w-4 h-4 text-amber-300" />,
    },
    fire: {
      tag: 'Pyromancy Core',
      title: 'Burning Fireball',
      subtitle: 'Infernal Flame',
      desc: 'Ignite a turbulent volumetric flame orb on your hand with dancing fire tongues, rising ember sparks, and dynamic light.',
      gradient: 'from-orange-600/35 via-red-600/20 to-transparent',
      accent: '#ea580c',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
    },
    robot: {
      tag: 'Cyber Droid',
      title: 'Holo Companion',
      subtitle: 'Kinetic 3D Avatar',
      desc: 'Animate fully-rigged 3D cyber characters standing upon glowing holographic rings that follow your palm in real-time.',
      gradient: 'from-cyan-600/30 via-blue-600/20 to-transparent',
      accent: '#06b6d4',
      icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
    },
  };

  const current = presets[activePreset];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0402] text-white flex flex-col justify-between p-5 md:p-10 select-none">
      {/* 1. Atmospheric Ambient Lighting Layers (Inspired by Lūma and Ethereal Motion Portrait) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Warm Terracotta Ambient Core */}
        <div className="absolute top-[-15%] left-[25%] w-[65vw] h-[65vw] max-w-212.5 max-h-212.5 rounded-full bg-linear-to-br from-[#ea580c]/25 via-[#9a3412]/20 to-transparent blur-[130px] transition-all duration-1000" />
        {/* Soft Ethereal Secondary Mist */}
        <div className="absolute bottom-[-20%] right-[10%] w-[55vw] h-[55vw] max-w-175 max-h-175 rounded-full bg-linear-to-tl from-[#c2410c]/20 via-[#451a03]/30 to-transparent blur-[140px]" />
        {/* Film grain / subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* 2. Top Navigation Bar (Minimalist Frosted Glass Pills) */}
      <header className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Brand Capsule */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/7 backdrop-blur-2xl border border-white/12 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-linear-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-black">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white/90">AR Studio</span>
        </div>

        {/* Center Live Stats Capsule */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-[11px] text-white/70 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MediaPipe Neural Engine
          </span>
          <span className="text-white/20">|</span>
          <span>WebGL 60 FPS</span>
          <span className="text-white/20">|</span>
          <span className="text-amber-400/90">Howler SFX</span>
        </div>

        {/* Right Audio & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2.5 rounded-full bg-white/7 hover:bg-white/14 text-white/80 hover:text-white backdrop-blur-2xl border border-white/12 transition-colors cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      </header>

      {/* 3. Center Hero Card (Inspired by Lūma Squircle Card & Ethereal Portrait) */}
      <main className="relative z-20 w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center">
        {/* Floating Organic Card */}
        <div className="relative w-full p-8 sm:p-10 rounded-[40px] bg-white/6 backdrop-blur-3xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col items-center">
          {/* Subtle inner light reflection */}
          <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

          {/* Mode Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/8 border border-white/12 text-xs font-medium text-white/90 mb-6">
            {current.icon}
            <span>{current.tag}</span>
          </div>

          {/* Main Title Typography */}
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.1] text-white mb-2">
            {current.title}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white/60 mb-5">
            {current.subtitle}
          </h2>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-sm text-white/65 max-w-md font-light leading-relaxed mb-8">
            {current.desc}
          </p>

          {/* Primary Action Button (Pure White Pill from Inspiration Reference) */}
          <Link
            href="/studio"
            onClick={() => soundManager.playIgnite()}
            className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-sm sm:text-base shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:shadow-[0_10px_35px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 cursor-pointer mb-6"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-950 flex items-center justify-center text-white">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Start AR Hologram</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Preset Selector Chips (Shield, Fireball, Avatar) */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/8">
            <button
              onClick={() => {
                setActivePreset('strange');
                soundManager.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activePreset === 'strange'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/6'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Doctor Strange</span>
            </button>

            <button
              onClick={() => {
                setActivePreset('fire');
                soundManager.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activePreset === 'fire'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/6'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Burning Fire</span>
            </button>

            <button
              onClick={() => {
                setActivePreset('robot');
                soundManager.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activePreset === 'robot'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/6'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>3D Avatar</span>
            </button>
          </div>
        </div>
      </main>

      {/* 4. Bottom Floating Pill Dock (Inspired by Reference 2 Dock) */}
      <footer className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto pt-4">
        {/* Left minimal prompt info */}
        <div className="flex items-center gap-2 text-[11px] text-white/50 font-light">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
          <span>Real-time hand tracking • Show palm to camera</span>
        </div>

        {/* Center / Right Quick Action Dock */}
        <div className="flex items-center gap-3 p-1.5 rounded-full bg-white/6 backdrop-blur-2xl border border-white/12 shadow-lg">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-sm hover:bg-white/90 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-black" />
            <span>Open Studio</span>
          </Link>

          <Link
            href="/about"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Vision Architecture"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
};
