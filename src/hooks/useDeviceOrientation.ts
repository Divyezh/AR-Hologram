'use client';

import { useState, useEffect } from 'react';

export interface DeviceOrientationState {
  isPortrait: boolean;
  innerWidth: number;
  innerHeight: number;
  devicePixelRatio: number;
}

export function useDeviceOrientation(): DeviceOrientationState {
  const [state, setState] = useState<DeviceOrientationState>(() => {
    if (typeof window === 'undefined') {
      return { isPortrait: false, innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1 };
    }
    return {
      isPortrait: window.innerHeight > window.innerWidth,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setState({
        isPortrait: window.innerHeight > window.innerWidth,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}
