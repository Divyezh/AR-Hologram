'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { CameraErrorType } from '../../types/camera';

interface CameraErrorProps {
  error: string;
  errorType?: CameraErrorType | null;
  onRetry: () => void;
}

export const CameraError: React.FC<CameraErrorProps> = ({
  error,
  errorType,
  onRetry,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
      <div className="relative max-w-sm w-full p-8 rounded-[40px] bg-white/8 backdrop-blur-3xl border border-red-500/30 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">Camera Unavailable</h3>
        <p className="text-xs text-white/60 font-light mb-4 leading-relaxed">{error}</p>

        {errorType === 'NotAllowedError' && (
          <div className="p-3 mb-6 rounded-2xl bg-white/4 text-[11px] text-white/60 text-left border border-white/8 space-y-1">
            <p className="font-semibold text-white/80">To enable camera:</p>
            <p>1. Tap the site settings / lock icon in the address bar.</p>
            <p>2. Toggle Camera permission to &quot;Allow&quot;.</p>
            <p>3. Tap Try Again below.</p>
          </div>
        )}

        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white hover:bg-neutral-100 text-black font-semibold text-xs transition-all duration-200 cursor-pointer shadow-md active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-800" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};
