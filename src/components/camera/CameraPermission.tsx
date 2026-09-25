'use client';

import React from 'react';
import { Camera, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface CameraPermissionProps {
  onGrantPermission: () => void;
  isRequesting: boolean;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({
  onGrantPermission,
  isRequesting,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/75 backdrop-blur-xl">
      {/* Background ambient warm diffuse glow */}
      <div className="absolute w-112.5 h-112.5 bg-linear-to-tr from-orange-600/20 via-amber-600/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Floating squircle card from reference inspiration */}
      <div className="relative max-w-sm w-full p-8 sm:p-9 rounded-[40px] bg-white/8 backdrop-blur-3xl border border-white/18 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center flex flex-col items-center">
        {/* Top inner rim highlight */}
        <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

        {/* Minimal frosted circle icon */}
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6 shadow-inner">
          <Camera className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white mb-2">
          Enable Camera
        </h2>
        <p className="text-xs text-white/60 font-light leading-relaxed mb-6">
          AR Hologram Studio processes your video feed locally in your browser using MediaPipe neural networks.
          No video or audio is ever recorded or uploaded.
        </p>

        {/* Privacy Pill */}
        <div className="flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/6 border border-white/10 text-[11px] text-white/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Client-Side Privacy</span>
        </div>

        {/* Solid White Pill Action Button */}
        <button
          onClick={onGrantPermission}
          disabled={isRequesting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-sm shadow-[0_8px_25px_rgba(255,255,255,0.25)] transition-all duration-300 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {isRequesting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-neutral-700" />
              <span>Starting Camera...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-neutral-950" />
              <span>Allow Camera Access</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
