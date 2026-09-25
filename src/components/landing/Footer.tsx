'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Cpu } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 py-12 text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-white">{APP_CONFIG.name}</span>
          <span className="text-neutral-600">|</span>
          <span>{APP_CONFIG.tagline}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-white transition-colors">
            Computer Vision Specs
          </Link>
          <Link href="/effects" className="hover:text-white transition-colors">
            Holographic Shaders
          </Link>
          <Link href="/characters" className="hover:text-white transition-colors">
            GLB Rigging
          </Link>
          <span className="flex items-center gap-1 text-emerald-400/80">
            <Shield className="w-3.5 h-3.5" /> Client-Side Only
          </span>
        </div>
      </div>
    </footer>
  );
};
