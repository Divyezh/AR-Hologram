'use client';

import React from 'react';
import { GestureDetectionResult } from '../../types/gestures';
import { GESTURE_CONFIGS } from '../../constants/gestures';

interface GestureManagerProps {
  gestureData: GestureDetectionResult | null;
  isVisible?: boolean;
}

export const GestureManager: React.FC<GestureManagerProps> = ({
  gestureData,
  isVisible = true,
}) => {
  if (!isVisible || !gestureData || gestureData.gesture === 'NONE') {
    return null;
  }

  const config = GESTURE_CONFIGS[gestureData.gesture];

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/40 text-xs text-cyan-200 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
      <span className="text-base select-none">{config.icon}</span>
      <div className="flex flex-col">
        <span className="font-semibold text-white tracking-wide">{config.label}</span>
        <span className="text-[10px] text-cyan-300/80">{config.actionDescription}</span>
      </div>
    </div>
  );
};
