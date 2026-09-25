import { CameraDeviceInfo } from '../../types/camera';

export async function getAvailableCameras(): Promise<CameraDeviceInfo[]> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'videoinput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${index + 1}`,
      }));
  } catch (error) {
    console.warn('Failed to enumerate media devices:', error);
    return [];
  }
}

export function parseCameraError(error: unknown): { message: string; type: string } {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          type: 'NotAllowedError',
          message: 'Camera permission was denied. Please allow camera access in your browser address bar to use AR.',
        };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return {
          type: 'NotFoundError',
          message: 'No video camera detected on this device. Please connect a webcam.',
        };
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          type: 'NotReadableError',
          message: 'Camera is currently in use by another application or locked by the system.',
        };
      case 'OverconstrainedError':
        return {
          type: 'OverconstrainedError',
          message: 'Requested camera resolution is not supported by your hardware.',
        };
      default:
        return {
          type: error.name,
          message: error.message || 'Unable to start camera stream.',
        };
    }
  }
  return {
    type: 'UnknownError',
    message: String(error) || 'An unexpected camera error occurred.',
  };
}
