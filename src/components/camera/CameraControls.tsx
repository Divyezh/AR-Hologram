'use client';

import React from 'react';
import { Camera, CameraOff, RefreshCw, FlipHorizontal, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { CameraStatus } from '../../types/camera';

interface CameraControlsProps {
  status: CameraStatus;
  isMirrored: boolean;
  debugMode: boolean;
  hasMultipleCameras?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onFlipCamera?: () => void;
  onToggleMirror: () => void;
  onToggleDebug: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  status,
  isMirrored,
  debugMode,
  hasMultipleCameras = false,
  onStartCamera,
  onStopCamera,
  onFlipCamera,
  onToggleMirror,
  onToggleDebug,
}) => {
  const isStreaming = status === 'active';
  const isRequesting = status === 'requesting';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      {/* Primary Camera Action */}
      {!isStreaming ? (
        <button
          onClick={onStartCamera}
          disabled={isRequesting}
          className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] transition-all duration-300 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {isRequesting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Starting Camera...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Start Camera</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onStopCamera}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-medium text-sm transition-all duration-200 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer"
        >
          <CameraOff className="w-4 h-4 text-red-400" />
          <span>Stop Camera</span>
        </button>
      )}

      {/* Auxiliary Camera Toggles */}
      {isStreaming && (
        <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
          {hasMultipleCameras && onFlipCamera && (
            <button
              onClick={onFlipCamera}
              title="Switch Camera Device"
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onToggleMirror}
            title={isMirrored ? 'Mirrored Mode (Click to Unmirror)' : 'Normal Mode (Click to Mirror)'}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isMirrored ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:bg-white/10 text-white/60'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDebug}
            title={debugMode ? 'Hide Neural Debug HUD' : 'Show Neural Debug HUD'}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              debugMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'hover:bg-white/10 text-white/60'
            }`}
          >
            {debugMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
