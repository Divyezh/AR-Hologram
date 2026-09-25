'use client';

import React from 'react';
import Link from 'next/link';
import { CameraControls } from '../camera/CameraControls';
import { TrackingStatus } from '../hand-tracking/TrackingStatus';
import { CameraStatus } from '../../types/camera';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface StudioToolbarProps {
  cameraStatus: CameraStatus;
  isModelReady: boolean;
  isHandDetected: boolean;
  activeHandSide?: 'Left' | 'Right' | null;
  isMirrored: boolean;
  debugMode: boolean;
  hasMultipleCameras?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onFlipCamera?: () => void;
  onToggleMirror: () => void;
  onToggleDebug: () => void;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  cameraStatus,
  isModelReady,
  isHandDetected,
  activeHandSide,
  isMirrored,
  debugMode,
  hasMultipleCameras,
  onStartCamera,
  onStopCamera,
  onFlipCamera,
  onToggleMirror,
  onToggleDebug,
}) => {
  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
      {/* Left: Branding & Exit to Home */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 backdrop-blur-md transition-all duration-200"
          title="Exit to Overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="w-6 h-6 rounded-full bg-linear-to-tr from-cyan-500 to-amber-400 flex items-center justify-center text-black">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide leading-none">AR STUDIO</h1>
            <span className="text-[10px] text-cyan-400 tracking-wider font-mono">NEURAL HOLOGRAM</span>
          </div>
        </div>

        {/* Tracking status badge */}
        <TrackingStatus
          cameraStatus={cameraStatus}
          isModelReady={isModelReady}
          isHandDetected={isHandDetected}
          activeHandSide={activeHandSide}
        />
      </div>

      {/* Right: Camera Action & Feature Controls */}
      <CameraControls
        status={cameraStatus}
        isMirrored={isMirrored}
        debugMode={debugMode}
        hasMultipleCameras={hasMultipleCameras}
        onStartCamera={onStartCamera}
        onStopCamera={onStopCamera}
        onFlipCamera={onFlipCamera}
        onToggleMirror={onToggleMirror}
        onToggleDebug={onToggleDebug}
      />
    </header>
  );
};
