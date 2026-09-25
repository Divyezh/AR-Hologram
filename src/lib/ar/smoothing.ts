import * as THREE from 'three';
import { AR_CONFIG } from '../../config/ar.config';

export class AnchorSmoother {
  private currentPos = new THREE.Vector3();
  private targetPos = new THREE.Vector3();
  private currentQuat = new THREE.Quaternion();
  private targetQuat = new THREE.Quaternion();
  private currentEuler = new THREE.Euler(0, 0, 0, 'XYZ');
  private currentScale = 1.0;
  private targetScale = 1.0;
  private isInitialized = false;
  private lostFrameCount = 0;
  private isDetected = false;

  private posLerp = AR_CONFIG.smoothing.positionLerp;
  private quatSlerp = AR_CONFIG.smoothing.quaternionSlerp;
  private scaleLerp = AR_CONFIG.smoothing.scaleLerp;
  private snapThreshold = AR_CONFIG.smoothing.snapDistanceThreshold;
  private maxLostFrames = AR_CONFIG.smoothing.disappearanceLagFrames;

  public update(
    rawPos: THREE.Vector3 | null,
    rawQuat: THREE.Quaternion | null,
    rawScale: number | null
  ): {
    position: [number, number, number];
    quaternion: [number, number, number, number];
    rotation: [number, number, number];
    scale: number;
    detected: boolean;
  } {
    if (rawPos && rawQuat && rawScale !== null) {
      this.targetPos.copy(rawPos);
      this.targetQuat.copy(rawQuat);
      this.targetScale = rawScale;
      this.lostFrameCount = 0;
      this.isDetected = true;

      if (!this.isInitialized) {
        this.currentPos.copy(this.targetPos);
        this.currentQuat.copy(this.targetQuat);
        this.currentScale = this.targetScale;
        this.isInitialized = true;
      } else {
        const dist = this.currentPos.distanceTo(this.targetPos);
        if (dist > this.snapThreshold) {
          // Fast movement or snap
          this.currentPos.copy(this.targetPos);
          this.currentQuat.copy(this.targetQuat);
        } else {
          // Dynamic responsive lerp: slightly faster when moving faster
          const adaptivePosLerp = Math.min(0.65, this.posLerp + dist * 0.15);
          this.currentPos.lerp(this.targetPos, adaptivePosLerp);
          this.currentQuat.slerp(this.targetQuat, this.quatSlerp);
        }
        this.currentScale += (this.targetScale - this.currentScale) * this.scaleLerp;
      }
    } else {
      // Hand lost in current frame
      this.lostFrameCount++;
      if (this.lostFrameCount > this.maxLostFrames) {
        this.isDetected = false;
        this.isInitialized = false;
      }
    }

    this.currentEuler.setFromQuaternion(this.currentQuat, 'XYZ');

    return {
      position: [this.currentPos.x, this.currentPos.y, this.currentPos.z],
      quaternion: [this.currentQuat.x, this.currentQuat.y, this.currentQuat.z, this.currentQuat.w],
      rotation: [this.currentEuler.x, this.currentEuler.y, this.currentEuler.z],
      scale: this.currentScale,
      detected: this.isDetected,
    };
  }

  public reset(): void {
    this.isInitialized = false;
    this.lostFrameCount = 0;
    this.isDetected = false;
  }
}
