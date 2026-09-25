'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = 'Initializing AR Hologram Engine...',
  subtitle = 'Loading MediaPipe Hand Landmarker & WebGL Shaders',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2 text-cyan-100">{title}</h2>
      <p className="text-xs text-neutral-400 max-w-sm text-center">{subtitle}</p>
    </div>
  );
};
