'use client';

import React from 'react';
import { PalmAnchor } from '../../types/palm';
import { HandTrackingResult } from '../../types/hand';
import { Activity, Gauge, Navigation } from 'lucide-react';

interface TrackingDebugProps {
  palmAnchor: PalmAnchor;
  handResult: HandTrackingResult | null;
  fps: number;
  latencyMs: number;
  isVisible: boolean;
}

export const TrackingDebug: React.FC<TrackingDebugProps> = ({
  palmAnchor,
  handResult,
  fps,
  latencyMs,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-20 left-4 z-20 pointer-events-none font-mono text-[11px] bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 text-cyan-300 w-64 shadow-[0_0_20px_rgba(0,0,0,0.8)] space-y-2.5">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-white">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          NEURAL TELEMETRY
        </span>
        <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-[10px] text-cyan-300 font-semibold border border-cyan-500/40">
          DEBUG ON
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-neutral-300">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
            <Gauge className="w-3 h-3" /> FPS
          </span>
          <span className={`font-semibold ${fps >= 45 ? 'text-emerald-400' : 'text-amber-400'}`}>{fps} fps</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500">Latency</span>
          <span className="font-semibold text-cyan-400">{latencyMs} ms</span>
        </div>
      </div>

      <div className="border-t border-cyan-500/10 pt-2 space-y-1">
        <div className="flex justify-between">
          <span className="text-neutral-500">Tracking:</span>
          <span className={palmAnchor.detected ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}>
            {palmAnchor.detected ? 'LOCKED' : 'SEARCHING'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Hand:</span>
          <span className="text-white">{handResult?.handedness || 'None'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Confidence:</span>
          <span className="text-white">{palmAnchor.detected ? `${Math.round(palmAnchor.confidence * 100)}%` : '--'}</span>
        </div>
      </div>

      <div className="border-t border-cyan-500/10 pt-2 space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-neutral-500 mb-1">
          <Navigation className="w-3 h-3" /> 3D WORLD COORDINATES
        </div>
        <div className="flex justify-between text-[10px]">
          <span>X: {palmAnchor.position[0].toFixed(2)}</span>
          <span>Y: {palmAnchor.position[1].toFixed(2)}</span>
          <span>Z: {palmAnchor.position[2].toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>P: {palmAnchor.eulerDegrees.pitch}°</span>
          <span>R: {palmAnchor.eulerDegrees.roll}°</span>
          <span>Y: {palmAnchor.eulerDegrees.yaw}°</span>
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>Scale: {palmAnchor.scale.toFixed(2)}x</span>
          <span>Span: {palmAnchor.handSize.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
