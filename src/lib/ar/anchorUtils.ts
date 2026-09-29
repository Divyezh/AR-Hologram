import * as THREE from "three";
import { NormalizedLandmark, Handedness } from "../../types/hand";
import { PalmAnchor } from "../../types/palm";
import { calculateRawPalmData } from "./palmMath";
import {
  mapNormalizedToScreenUV,
  mapScreenUVToThreeWorld,
  ViewportDimensions,
} from "./coordinateMapping";
import { AnchorSmoother } from "./smoothing";

export function createDefaultPalmAnchor(): PalmAnchor {
  return {
    detected: false,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    quaternion: [0, 0, 0, 1],
    scale: 1,
    confidence: 0,
    normal: [0, 0, 1],
    rawCenter: { x: 0.5, y: 0.5, z: 0 },
    handSize: 0.2,
    handedness: null,
    isPalmFacing: false,
    palmFacingScore: 0,
    eulerDegrees: { pitch: 0, roll: 0, yaw: 0 },
  };
}

export function computePalmAnchor(
  landmarks: NormalizedLandmark[] | null,
  handedness: Handedness | null,
  dimensions: ViewportDimensions,
  smoother: AnchorSmoother,
  cameraFov: number = 50,
  cameraDistanceZ: number = 5
): PalmAnchor {
  if (!landmarks || landmarks.length < 21) {
    const smoothed = smoother.update(null, null, null);
    return {
      detected: smoothed.detected,
      position: smoothed.position,
      rotation: smoothed.rotation,
      quaternion: smoothed.quaternion,
      scale: smoothed.scale,
      confidence: 0,
      normal: [0, 0, 1],
      rawCenter: { x: 0.5, y: 0.5, z: 0 },
      handSize: 0.2,
      handedness,
      isPalmFacing: false,
      palmFacingScore: 0,
      eulerDegrees: {
        pitch: (smoothed.rotation[0] * 180) / Math.PI,
        roll: (smoothed.rotation[1] * 180) / Math.PI,
        yaw: (smoothed.rotation[2] * 180) / Math.PI,
      },
    };
  }

  // When camera is mirrored (selfie mode), MediaPipe's raw handedness from unmirrored sensor image is inverted
  const effectiveHandedness: Handedness | null = handedness
    ? dimensions.isMirrored
      ? handedness === "Left"
        ? "Right"
        : "Left"
      : handedness
    : "Right";

  const rawPalm = calculateRawPalmData(landmarks, effectiveHandedness);
  if (!rawPalm) {
    const smoothed = smoother.update(null, null, null);
    return {
      ...createDefaultPalmAnchor(),
      detected: smoothed.detected,
    };
  }

  // Map center from normalized coords (with mirroring & object-fit handling) to screen UV
  const { uvX, uvY } = mapNormalizedToScreenUV(rawPalm.center.x, rawPalm.center.y, dimensions);

  const aspectRatio = dimensions.containerWidth / (dimensions.containerHeight || 1);
  const worldPos = mapScreenUVToThreeWorld(
    uvX,
    uvY,
    cameraDistanceZ,
    cameraFov,
    aspectRatio,
    rawPalm.center.z
  );

  // When mirrored, adjust normal & rotation for mirroring
  const rawQuat = rawPalm.quaternion.clone();
  if (dimensions.isMirrored) {
    // Invert X rotation & Yaw for mirrored camera
    const euler = new THREE.Euler().setFromQuaternion(rawQuat, "XYZ");
    euler.y = -euler.y;
    euler.z = -euler.z;
    rawQuat.setFromEuler(euler);
  }

  // Scale: base hand size normalized
  const baseScale = Math.max(0.6, Math.min(3.0, rawPalm.handSpan * 4.6));

  const smoothed = smoother.update(worldPos, rawQuat, baseScale);

  const pitchDeg = Math.round((smoothed.rotation[0] * 180) / Math.PI);
  const rollDeg = Math.round((smoothed.rotation[1] * 180) / Math.PI);
  const yawDeg = Math.round((smoothed.rotation[2] * 180) / Math.PI);

  return {
    detected: smoothed.detected,
    position: smoothed.position,
    rotation: smoothed.rotation,
    quaternion: smoothed.quaternion,
    scale: smoothed.scale,
    confidence: 0.95,
    normal: [rawPalm.normal.x, rawPalm.normal.y, rawPalm.normal.z],
    rawCenter: rawPalm.center,
    handSize: rawPalm.handSpan,
    handedness,
    isPalmFacing: rawPalm.isPalmFacing,
    palmFacingScore: rawPalm.palmFacingScore,
    eulerDegrees: { pitch: pitchDeg, roll: rollDeg, yaw: yawDeg },
  };
}
