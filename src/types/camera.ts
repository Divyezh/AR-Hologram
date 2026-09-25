export type CameraFacingMode = 'user' | 'environment';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'unsupported';

export type CameraErrorType =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'UnsupportedError'
  | 'UnknownError';

export interface CameraResolution {
  width: number;
  height: number;
}

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export interface CameraState {
  status: CameraStatus;
  stream: MediaStream | null;
  videoElement: HTMLVideoElement | null;
  facingMode: CameraFacingMode;
  error: string | null;
  errorType: CameraErrorType | null;
  resolution: CameraResolution;
  isMirrored: boolean;
  devices: CameraDeviceInfo[];
  activeDeviceId: string | null;
}
