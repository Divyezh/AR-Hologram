import { GestureType } from '../types/gestures';

export const GESTURE_CONFIGS: Record<GestureType, { label: string; icon: string; actionDescription: string }> = {
  NONE: {
    label: 'None',
    icon: '✋',
    actionDescription: 'No active gesture detected',
  },
  OPEN_PALM: {
    label: 'Open Palm',
    icon: '🖐️',
    actionDescription: 'Hologram active & floating',
  },
  FIST: {
    label: 'Closed Fist',
    icon: '✊',
    actionDescription: 'Energy surge & power charge',
  },
  POINT: {
    label: 'Pointing Finger',
    icon: '👉',
    actionDescription: 'Focus beam targeting',
  },
  PEACE: {
    label: 'Peace Sign',
    icon: '✌️',
    actionDescription: 'Celebrate animation trigger',
  },
  PINCH: {
    label: 'Pinch Fingers',
    icon: '🤏',
    actionDescription: 'Scale & resize hologram',
  },
  THUMBS_UP: {
    label: 'Thumbs Up',
    icon: '👍',
    actionDescription: 'Happy reaction / Yes',
  },
  ROCK: {
    label: 'Rock Sign',
    icon: '🤘',
    actionDescription: 'Supercharge VFX explosion',
  },
};
