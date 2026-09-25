'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Sparkles, ArrowRight } from 'lucide-react';

export const CTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative rounded-3xl bg-linear-to-b from-neutral-900 via-neutral-950 to-black border border-cyan-500/30 p-10 md:p-16 text-center overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)]">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6">
              <Camera className="w-8 h-8" />
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to Experience The Magic?
            </h3>
            <p className="text-neutral-400 max-w-lg mb-8 text-sm sm:text-base leading-relaxed">
              No app store install required. Runs directly in Chrome, Safari, Edge, and modern mobile browsers with WebGL.
            </p>

            <Link
              href="/studio"
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-linear-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Enter AR Hologram Studio</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
