'use client';

import React, { useRef, useEffect } from 'react';
import { NormalizedLandmark } from '../../types/hand';
import { HAND_CONNECTIONS, PALM_LANDMARKS } from '../../constants/landmarks';
import { ViewportDimensions, mapNormalizedToScreenUV } from '../../lib/ar/coordinateMapping';

interface HandLandmarksProps {
  landmarks: NormalizedLandmark[] | null;
  dimensions: ViewportDimensions;
  isVisible: boolean;
}

export const HandLandmarks: React.FC<HandLandmarksProps> = ({
  landmarks,
  dimensions,
  isVisible,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isVisible || !landmarks || landmarks.length < 21) {
      return;
    }

    const { containerWidth, containerHeight } = dimensions;
    if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    }

    // Convert landmarks to canvas pixel coordinates
    const pixelPoints = landmarks.map((lm) => {
      const { uvX, uvY } = mapNormalizedToScreenUV(lm.x, lm.y, dimensions);
      return {
        x: uvX * containerWidth,
        y: uvY * containerHeight,
      };
    });

    // Draw bone connections
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)'; // Cyan skeleton
    ctx.beginPath();
    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = pixelPoints[startIdx];
      const p2 = pixelPoints[endIdx];
      if (p1 && p2) {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
    }
    ctx.stroke();

    // Draw palm bounding polygon
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    PALM_LANDMARKS.forEach((idx, i) => {
      const p = pixelPoints[idx];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw landmark joints
    pixelPoints.forEach((p, idx) => {
      const isPalmJoint = (PALM_LANDMARKS as readonly number[]).includes(idx);
      ctx.fillStyle = isPalmJoint ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isPalmJoint ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [landmarks, dimensions, isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
