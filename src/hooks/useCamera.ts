'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraState, CameraFacingMode, CameraDeviceInfo } from '../types/camera';
import { CAMERA_CONFIG } from '../config/camera.config';
import { getAvailableCameras, parseCameraError } from '../lib/utils/browser';
import { isMediaDevicesSupported } from '../lib/utils/device';

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    status: 'idle',
    stream: null,
    videoElement: null,
    facingMode: CAMERA_CONFIG.defaultFacingMode,
    error: null,
    errorType: null,
    resolution: { width: CAMERA_CONFIG.idealWidth, height: CAMERA_CONFIG.idealHeight },
    isMirrored: CAMERA_CONFIG.mirroredDefault,
    devices: [],
    activeDeviceId: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop current stream cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState((prev) => ({
      ...prev,
      status: 'idle',
      stream: null,
      error: null,
      errorType: null,
    }));
  }, []);

  // Start camera with requested facingMode or deviceId
  const startCamera = useCallback(
    async (preferredFacingMode?: CameraFacingMode, specificDeviceId?: string) => {
      if (!isMediaDevicesSupported()) {
        setState((prev) => ({
          ...prev,
          status: 'unsupported',
          error: 'Webcam is not supported in this browser environment.',
          errorType: 'UnsupportedError',
        }));
        return;
      }

      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const facing = preferredFacingMode || state.facingMode;
      const isMirrored = facing === 'user';

      setState((prev) => ({
        ...prev,
        status: 'requesting',
        facingMode: facing,
        isMirrored,
        error: null,
        errorType: null,
      }));

      try {
        const videoConstraints: MediaTrackConstraints = specificDeviceId
          ? { deviceId: { exact: specificDeviceId } }
          : {
              facingMode: facing,
              width: { ideal: CAMERA_CONFIG.idealWidth },
              height: { ideal: CAMERA_CONFIG.idealHeight },
              frameRate: { ideal: CAMERA_CONFIG.idealFrameRate },
            };

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        // Get actual track settings
        const videoTrack = mediaStream.getVideoTracks()[0];
        const settings = videoTrack ? videoTrack.getSettings() : {};
        const width = settings.width || CAMERA_CONFIG.idealWidth;
        const height = settings.height || CAMERA_CONFIG.idealHeight;

        // Refresh devices list once permission is granted
        const availableDevices = await getAvailableCameras();

        setState((prev) => ({
          ...prev,
          status: 'active',
          stream: mediaStream,
          facingMode: facing,
          isMirrored,
          resolution: { width, height },
          devices: availableDevices,
          activeDeviceId: settings.deviceId || specificDeviceId || null,
          error: null,
          errorType: null,
        }));
      } catch (err) {
        const parsed = parseCameraError(err);
        setState((prev) => ({
          ...prev,
          status: 'error',
          stream: null,
          error: parsed.message,
          errorType: parsed.type as any,
        }));
      }
    },
    [state.facingMode]
  );

  // Toggle front/rear camera
  const toggleFacingMode = useCallback(() => {
    const nextFacing: CameraFacingMode = state.facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextFacing);
  }, [state.facingMode, startCamera]);

  // Set mirrored explicitly
  const toggleMirrored = useCallback(() => {
    setState((prev) => ({ ...prev, isMirrored: !prev.isMirrored }));
  }, []);

  // Attach video element ref
  const setVideoElement = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch((e) => console.warn('Autoplay error:', e));
    }
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    toggleFacingMode,
    toggleMirrored,
    setVideoElement,
  };
}
