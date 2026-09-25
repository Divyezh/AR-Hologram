'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Eye, Cpu, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Chip badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-8 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Next-Gen WebAR Neural Holography</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
          Summon Living 3D Holograms <br />
          <span className="bg-linear-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Right Upon Your Palm
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed font-light">
          Open your camera and show your hand. Real-time MediaPipe computer vision tracks your palm orientation, anchoring glowing mystic rings and animated 3D cyber companions in true WebGL space.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/studio"
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-linear-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <span>Launch AR Studio</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 hover:border-white/20 font-medium text-base transition-all duration-200"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>How The Math Works</span>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full text-left">
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <Eye className="w-5 h-5 text-cyan-400 mb-2" />
            <h3 className="font-semibold text-white text-sm">21 Hand Landmarks</h3>
            <p className="text-neutral-500 text-xs mt-1">Anatomical palm tracking with sub-millimeter precision.</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="font-semibold text-white text-sm">60 FPS WebGL</h3>
            <p className="text-neutral-500 text-xs mt-1">Ref-based updates bypass React render overhead.</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
            <h3 className="font-semibold text-white text-sm">Procedural VFX</h3>
            <p className="text-neutral-500 text-xs mt-1">Custom GLSL shaders, gyroscopic rings, and mana dust.</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-white text-sm">100% Private</h3>
            <p className="text-neutral-500 text-xs mt-1">All neural inference executes locally in your browser.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
