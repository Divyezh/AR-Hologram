import * as THREE from 'three';

export interface ViewportDimensions {
  containerWidth: number;
  containerHeight: number;
  videoWidth: number;
  videoHeight: number;
  isMirrored: boolean;
}

/**
 * Maps MediaPipe normalized coordinates (0 to 1) to screen UV coordinates,
 * taking into account video aspect ratio and CSS `object-fit: cover` cropping,
 * as well as horizontal mirroring.
 */
export function mapNormalizedToScreenUV(
  normX: number,
  normY: number,
  dimensions: ViewportDimensions
): { uvX: number; uvY: number } {
  const { containerWidth, containerHeight, videoWidth, videoHeight, isMirrored } = dimensions;

  if (videoWidth <= 0 || videoHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    const x = isMirrored ? 1 - normX : normX;
    return { uvX: x, uvY: normY };
  }

  const containerAspect = containerWidth / containerHeight;
  const videoAspect = videoWidth / videoHeight;

  let scaledX = normX;
  let scaledY = normY;

  if (containerAspect > videoAspect) {
    // Video is scaled to fit container width; top and bottom are cropped
    const visibleHeightRatio = videoAspect / containerAspect;
    const cropTopRatio = (1 - visibleHeightRatio) / 2;
    scaledY = (normY - cropTopRatio) / visibleHeightRatio;
  } else {
    // Video is scaled to fit container height; left and right are cropped
    const visibleWidthRatio = containerAspect / videoAspect;
    const cropLeftRatio = (1 - visibleWidthRatio) / 2;
    scaledX = (normX - cropLeftRatio) / visibleWidthRatio;
  }

  // Apply horizontal mirroring if front camera is mirrored
  const finalX = isMirrored ? 1 - scaledX : scaledX;

  return {
    uvX: Math.max(0, Math.min(1, finalX)),
    uvY: Math.max(0, Math.min(1, scaledY)),
  };
}

/**
 * Converts screen UV coordinates (0..1, 0..1) to Three.js camera world coordinates
 * matching a camera with fov, aspect ratio, at distanceZ.
 */
export function mapScreenUVToThreeWorld(
  uvX: number,
  uvY: number,
  distanceZ: number,
  fov: number,
  aspectRatio: number,
  rawZ: number = 0
): THREE.Vector3 {
  // Height of view plane at distanceZ
  const vFovRadians = (fov * Math.PI) / 180;
  const planeHeight = 2 * Math.tan(vFovRadians / 2) * distanceZ;
  const planeWidth = planeHeight * aspectRatio;

  // uvX: 0 = left (-width/2), 1 = right (+width/2)
  const worldX = (uvX - 0.5) * planeWidth;
  // uvY: 0 = top (+height/2), 1 = bottom (-height/2)
  const worldY = (0.5 - uvY) * planeHeight;
  
  // Z offset adjusted by MediaPipe relative z landmark
  // MediaPipe z is roughly around -0.1 to 0.1 normalized to hand size
  const worldZ = -rawZ * 2.5;

  return new THREE.Vector3(worldX, worldY, worldZ);
}
