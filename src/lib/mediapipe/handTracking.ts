import { HandLandmarker } from '@mediapipe/tasks-vision';
import { HandTrackingResult, MultiHandTrackingResult, Handedness } from '../../types/hand';

export function processVideoFrame(
  landmarker: HandLandmarker,
  videoElement: HTMLVideoElement,
  timestamp: number
): MultiHandTrackingResult {
  if (videoElement.readyState < 2) {
    return { hands: [], primaryHand: null, timestamp };
  }

  const results = landmarker.detectForVideo(videoElement, timestamp);

  if (!results.landmarks || results.landmarks.length === 0) {
    return { hands: [], primaryHand: null, timestamp };
  }

  const trackedHands: HandTrackingResult[] = results.landmarks.map((landmarkList, index) => {
    let handedness: Handedness | null = null;
    let confidence = 0.9;

    if (results.handedness && results.handedness[index] && results.handedness[index][0]) {
      const category = results.handedness[index][0];
      handedness = category.categoryName as Handedness;
      confidence = category.score;
    }

    return {
      detected: true,
      handedness,
      landmarks: landmarkList,
      worldLandmarks: results.worldLandmarks ? results.worldLandmarks[index] : undefined,
      confidence,
      timestamp,
    };
  });

  return {
    hands: trackedHands,
    primaryHand: trackedHands[0] || null,
    timestamp,
  };
}
