'use client';

import React from 'react';
import { CameraDeviceInfo, CameraResolution } from '../../types/camera';
import { X, Cpu, Video, Layers } from 'lucide-react';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resolution: CameraResolution;
  devices: CameraDeviceInfo[];
  activeDeviceId: string | null;
  fps: number;
  latencyMs: number;
  isMirrored: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  resolution,
  devices,
  activeDeviceId,
  fps,
  latencyMs,
  isMirrored,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 max-w-full bg-black/90 backdrop-blur-xl border-l border-white/10 p-5 overflow-y-auto text-xs text-neutral-300 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <span className="font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          SYSTEM DIAGNOSTICS
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1.5 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" /> Camera Pipeline
          </h4>
          <div className="bg-neutral-900/80 rounded-xl p-3 space-y-1 font-mono text-[11px] border border-white/5">
            <div className="flex justify-between">
              <span className="text-neutral-500">Resolution:</span>
              <span className="text-white">{resolution.width} x {resolution.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Mirrored:</span>
              <span className="text-white">{isMirrored ? 'Yes (Front mode)' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Devices Detected:</span>
              <span className="text-white">{devices.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Active Device:</span>
              <span className="text-white truncate max-w-30">{activeDeviceId || 'Default'}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Performance & Shaders
          </h4>
          <div className="bg-neutral-900/80 rounded-xl p-3 space-y-1 font-mono text-[11px] border border-white/5">
            <div className="flex justify-between">
              <span className="text-neutral-500">Render FPS:</span>
              <span className={fps >= 50 ? 'text-emerald-400' : 'text-amber-400'}>{fps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Vision Latency:</span>
              <span className="text-cyan-400">{latencyMs} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Engine:</span>
              <span className="text-white">Three.js + MediaPipe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Delegate:</span>
              <span className="text-white">WebGL / GPU</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 text-[11px] text-neutral-400 leading-relaxed">
          <p className="font-semibold text-neutral-200 mb-1">Hand Landmark Tracking:</p>
          <p>
            MediaPipe detects 21 3D joint landmarks. The palm normal vector is computed via cross-product of the vertical and transverse palm axes and smoothed using slerp/lerp.
          </p>
        </div>
      </div>
    </div>
  );
};
