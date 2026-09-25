'use client';

import React from 'react';
import Link from 'next/link';
import { CameraStatus } from '../../types/camera';
import { ChevronLeft, Camera, CameraOff, Volume2, VolumeX, FlipHorizontal, Eye, EyeOff, SwitchCamera } from 'lucide-react';

interface StudioToolbarProps {
  cameraStatus: CameraStatus;
  isModelReady: boolean;
  isHandDetected: boolean;
  activeHandSide?: 'Left' | 'Right' | null;
  isMirrored: boolean;
  debugMode: boolean;
  isAudioMuted: boolean;
  hasMultipleCameras?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onFlipCamera?: () => void;
  onToggleMirror: () => void;
  onToggleDebug: () => void;
  onToggleAudio: () => void;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  cameraStatus,
  isModelReady,
  isHandDetected,
  activeHandSide,
  isMirrored,
  debugMode,
  isAudioMuted,
  hasMultipleCameras,
  onStartCamera,
  onStopCamera,
  onFlipCamera,
  onToggleMirror,
  onToggleDebug,
  onToggleAudio,
}) => {
  const isStreaming = cameraStatus === 'active';

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
      {/* Left: "< Back to home" Frosted Pill (Inspired by Reference 1) */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/9 hover:bg-white/16 backdrop-blur-2xl border border-white/15 text-white/90 hover:text-white text-xs font-medium transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
          <span>Back to home</span>
        </Link>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 backdrop-blur-2xl border border-white/10 text-[11px] text-white/70">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isHandDetected
                ? 'bg-emerald-400 animate-pulse'
                : isStreaming
                ? 'bg-amber-400'
                : 'bg-neutral-500'
            }`}
          />
          <span>
            {isHandDetected
              ? `Hand Locked ${activeHandSide ? `(${activeHandSide})` : ''}`
              : isStreaming
              ? 'Show palm to camera'
              : 'Standby'}
          </span>
        </div>
      </div>

      {/* Right: Sound, Camera Toggles, and Menu (Inspired by Reference 1 & 2) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Sound toggle pill */}
        <button
          onClick={onToggleAudio}
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-2.5 rounded-full backdrop-blur-2xl border transition-all cursor-pointer ${
            !isAudioMuted
              ? 'bg-white/12 text-amber-300 border-white/20 shadow-sm'
              : 'bg-white/6 text-white/50 border-white/10 hover:text-white'
          }`}
        >
          {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Flip Camera (Front / Rear) Toggle for Mobile */}
        {isStreaming && onFlipCamera && (
          <button
            onClick={onFlipCamera}
            title="Switch Camera (Front / Back)"
            className="p-2.5 rounded-full backdrop-blur-2xl border bg-white/6 text-white/70 border-white/10 hover:text-white hover:bg-white/12 transition-all cursor-pointer"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}

        {/* Camera Mirror Toggle */}
        {isStreaming && (
          <button
            onClick={onToggleMirror}
            title={isMirrored ? 'Unmirror Camera' : 'Mirror Camera'}
            className={`p-2.5 rounded-full backdrop-blur-2xl border transition-all cursor-pointer ${
              isMirrored
                ? 'bg-white/12 text-white border-white/20'
                : 'bg-white/6 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Debug Toggle */}
        {isStreaming && (
          <button
            onClick={onToggleDebug}
            title={debugMode ? 'Hide Neural Joints' : 'Show Neural Joints'}
            className={`p-2.5 rounded-full backdrop-blur-2xl border transition-all cursor-pointer ${
              debugMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/6 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            {debugMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}

        {/* Camera Start / Stop Pill */}
        {!isStreaming ? (
          <button
            onClick={onStartCamera}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-md hover:bg-white/90 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 fill-current" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={onStopCamera}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/8 hover:bg-red-500/20 text-white/80 hover:text-red-300 backdrop-blur-2xl border border-white/12 hover:border-red-500/30 text-xs font-medium transition-all cursor-pointer"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>
        )}
      </div>
    </header>
  );
};
