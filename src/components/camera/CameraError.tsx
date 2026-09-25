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
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-red-500/30 text-center flex flex-col items-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Camera Unavailable</h3>
        <p className="text-sm text-neutral-300 mb-4">{error}</p>

        {errorType === 'NotAllowedError' && (
          <div className="p-3 mb-6 rounded-xl bg-neutral-800/80 text-xs text-neutral-400 text-left border border-white/5 space-y-1">
            <p className="font-semibold text-neutral-200">How to fix:</p>
            <p>1. Click the lock/tune icon near your browser address bar.</p>
            <p>2. Set Camera permissions to &quot;Allow&quot;.</p>
            <p>3. Reload this page or click Retry below.</p>
          </div>
        )}

        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/30"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};
