'use client';

import { useEffect, useRef } from 'react';
import { GestureDetectionResult } from '../../types/gestures';

interface AnimationControllerProps {
  gestureData: GestureDetectionResult | null;
  onTriggerAnimation?: (anim: string) => void;
}

export const AnimationController: React.FC<AnimationControllerProps> = ({
  gestureData,
  onTriggerAnimation,
}) => {
  const lastGestureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gestureData || !onTriggerAnimation) return;

    const currentGesture = gestureData.gesture;
    if (currentGesture === lastGestureRef.current) return;
    lastGestureRef.current = currentGesture;

    // React to specific gestures
    if (currentGesture === 'PEACE' || currentGesture === 'ROCK') {
      onTriggerAnimation('Dance');
    } else if (currentGesture === 'FIST') {
      onTriggerAnimation('Jump');
    } else if (currentGesture === 'THUMBS_UP') {
      onTriggerAnimation('ThumbsUp');
    } else if (currentGesture === 'POINT') {
      onTriggerAnimation('Wave');
    }
  }, [gestureData, onTriggerAnimation]);

  return null;
};
