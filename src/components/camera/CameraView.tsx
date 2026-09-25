'use client';

import React, { forwardRef } from 'react';

interface CameraViewProps {
  isMirrored?: boolean;
  isActive: boolean;
  onLoadedMetadata?: () => void;
}

export const CameraView = forwardRef<HTMLVideoElement, CameraViewProps>(
  ({ isMirrored = true, isActive, onLoadedMetadata }, ref) => {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-none">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={onLoadedMetadata}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isActive ? 'opacity-100' : 'opacity-0'
          } ${isMirrored ? 'scale-x-[-1]' : ''}`}
          style={{ willChange: 'transform' }}
        />
        {/* Subtle vignette layer to enhance holographic contrast */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      </div>
    );
  }
);

CameraView.displayName = 'CameraView';
