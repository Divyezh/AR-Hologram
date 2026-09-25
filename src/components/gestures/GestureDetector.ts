import { NormalizedLandmark } from '../../types/hand';
import { GestureType, GestureDetectionResult } from '../../types/gestures';
import { HAND_LANDMARK } from '../../constants/landmarks';

function dist(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Robust geometric gesture classifier analyzing relative finger articulation
 */
export function detectHandGesture(landmarks: NormalizedLandmark[]): GestureDetectionResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: 'NONE',
      confidence: 0,
      extendedFingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    };
  }

  const wrist = landmarks[HAND_LANDMARK.WRIST];
  const thumbTip = landmarks[HAND_LANDMARK.THUMB_TIP];
  const thumbIp = landmarks[HAND_LANDMARK.THUMB_IP];
  const indexTip = landmarks[HAND_LANDMARK.INDEX_FINGER_TIP];
  const indexPip = landmarks[HAND_LANDMARK.INDEX_FINGER_PIP];
  const indexMcp = landmarks[HAND_LANDMARK.INDEX_FINGER_MCP];
  const middleTip = landmarks[HAND_LANDMARK.MIDDLE_FINGER_TIP];
  const middlePip = landmarks[HAND_LANDMARK.MIDDLE_FINGER_PIP];
  const ringTip = landmarks[HAND_LANDMARK.RING_FINGER_TIP];
  const ringPip = landmarks[HAND_LANDMARK.RING_FINGER_PIP];
  const pinkyTip = landmarks[HAND_LANDMARK.PINKY_TIP];
  const pinkyPip = landmarks[HAND_LANDMARK.PINKY_PIP];

  // Extension: distance from wrist to tip vs distance from wrist to PIP
  const isIndexExtended = dist(wrist, indexTip) > dist(wrist, indexPip) * 1.15;
  const isMiddleExtended = dist(wrist, middleTip) > dist(wrist, middlePip) * 1.15;
  const isRingExtended = dist(wrist, ringTip) > dist(wrist, ringPip) * 1.15;
  const isPinkyExtended = dist(wrist, pinkyTip) > dist(wrist, pinkyPip) * 1.15;
  const isThumbExtended = dist(wrist, thumbTip) > dist(wrist, thumbIp) * 1.1 && dist(thumbTip, indexMcp) > 0.08;

  const pinchDist = dist(thumbTip, indexTip);
  const isPinch = pinchDist < 0.055;

  let gesture: GestureType = 'NONE';
  let confidence = 0.85;

  if (isPinch) {
    gesture = 'PINCH';
    confidence = 0.95;
  } else if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    gesture = 'OPEN_PALM';
    confidence = 0.98;
  } else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbExtended) {
    gesture = 'FIST';
    confidence = 0.92;
  } else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    gesture = 'POINT';
    confidence = 0.95;
  } else if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    gesture = 'PEACE';
    confidence = 0.94;
  } else if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    gesture = 'THUMBS_UP';
    confidence = 0.9;
  } else if (isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    gesture = 'ROCK';
    confidence = 0.92;
  }

  return {
    gesture,
    confidence,
    pinchDistance: pinchDist,
    extendedFingers: {
      thumb: isThumbExtended,
      index: isIndexExtended,
      middle: isMiddleExtended,
      ring: isRingExtended,
      pinky: isPinkyExtended,
    },
  };
}
