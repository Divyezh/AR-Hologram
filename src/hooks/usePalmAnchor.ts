'use client';

import { useRef, useMemo, useCallback } from 'react';
import { PalmAnchor } from '../types/palm';
import { MultiHandTrackingResult } from '../types/hand';
import { ViewportDimensions } from '../lib/ar/coordinateMapping';
import { AnchorSmoother } from '../lib/ar/smoothing';
import { computePalmAnchor, createDefaultPalmAnchor } from '../lib/ar/anchorUtils';
import { AR_CONFIG } from '../config/ar.config';

export function usePalmAnchor() {
  const anchorRef = useRef<PalmAnchor>(createDefaultPalmAnchor());
  const smoother = useMemo(() => new AnchorSmoother(), []);

  const updateAnchor = useCallback(
    (
      trackingResult: MultiHandTrackingResult | null,
      dimensions: ViewportDimensions,
      cameraFov: number = AR_CONFIG.camera.fov,
      cameraDistanceZ: number = AR_CONFIG.camera.defaultDistanceZ
    ): PalmAnchor => {
      const primaryHand = trackingResult?.primaryHand || null;
      const landmarks = primaryHand?.landmarks || null;
      const handedness = primaryHand?.handedness || null;

      const newAnchor = computePalmAnchor(
        landmarks,
        handedness,
        dimensions,
        smoother,
        cameraFov,
        cameraDistanceZ
      );

      anchorRef.current = newAnchor;
      return newAnchor;
    },
    [smoother]
  );

  const resetAnchor = useCallback(() => {
    smoother.reset();
    anchorRef.current = createDefaultPalmAnchor();
  }, [smoother]);

  return {
    anchorRef,
    updateAnchor,
    resetAnchor,
  };
}
