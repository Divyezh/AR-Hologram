'use client';

import React from 'react';
import { Camera, ShieldCheck, Sparkles } from 'lucide-react';

interface CameraPermissionProps {
  onGrantPermission: () => void;
  isRequesting: boolean;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({
  onGrantPermission,
  isRequesting,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
      <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center flex flex-col items-center">
        {/* Glow Icon */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-linear-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-neutral-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Camera className="w-10 h-10" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Enable Camera For AR</h2>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          AR Hologram Studio processes your video feed locally inside your browser using MediaPipe neural networks.
          Your camera feed is never uploaded to any remote server.
        </p>

        <div className="flex items-center gap-3 px-4 py-2 mb-6 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>100% Client-Side Privacy Guaranteed</span>
        </div>

        <button
          onClick={onGrantPermission}
          disabled={isRequesting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-linear-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-semibold text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isRequesting ? 'Requesting Permission...' : 'Allow Camera Access'}</span>
        </button>
      </div>
    </div>
  );
};
