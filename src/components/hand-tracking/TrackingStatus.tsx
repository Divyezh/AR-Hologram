'use client';

import React from 'react';
import { CameraStatus } from '../../types/camera';
import { Sparkles, Scan, Hand, CheckCircle2 } from 'lucide-react';

interface TrackingStatusProps {
  cameraStatus: CameraStatus;
  isModelReady: boolean;
  isHandDetected: boolean;
  activeHandSide?: 'Left' | 'Right' | null;
}

export const TrackingStatus: React.FC<TrackingStatusProps> = ({
  cameraStatus,
  isModelReady,
  isHandDetected,
  activeHandSide,
}) => {
  if (cameraStatus !== 'active') {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-xs text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-neutral-600" />
        <span>Camera Standby</span>
      </div>
    );
  }

  if (!isModelReady) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 backdrop-blur-md border border-blue-500/40 text-xs text-blue-300 animate-pulse">
        <Scan className="w-3.5 h-3.5 animate-spin" />
        <span>Loading MediaPipe AI...</span>
      </div>
    );
  }

  if (isHandDetected) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 text-xs text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-in fade-in duration-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium">
          Hologram Active ({activeHandSide ? `${activeHandSide} Hand` : 'Hand Locked'})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 backdrop-blur-md border border-amber-500/40 text-xs text-amber-300 animate-pulse">
      <Hand className="w-3.5 h-3.5" />
      <span>Show Hand / Palm to Camera</span>
    </div>
  );
};
