'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ARLoadingProps {
  message?: string;
}

export const ARLoading: React.FC<ARLoadingProps> = ({
  message = 'Initializing Neural AR Pipeline...',
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-cyan-200 tracking-wide">{message}</p>
      <span className="text-[11px] text-neutral-500 mt-1">Accelerated WebGL + MediaPipe Hand Landmarker</span>
    </div>
  );
};
