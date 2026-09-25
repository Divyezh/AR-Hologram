import { Handedness } from './hand';

export interface PalmAnchor {
  detected: boolean;
  /** Three.js world/viewport coordinates [x, y, z] */
  position: [number, number, number];
  /** Euler rotation in radians [x, y, z] */
  rotation: [number, number, number];
  /** Quaternion rotation [x, y, z, w] */
  quaternion: [number, number, number, number];
  /** Scale factor derived from palm size */
  scale: number;
  /** Confidence score between 0 and 1 */
  confidence: number;
  /** Unit surface normal vector of the palm plane [x, y, z] */
  normal: [number, number, number];
  /** Raw 2D normalized screen coordinates of center */
  rawCenter: { x: number; y: number; z: number };
  /** Metric or normalized span of palm */
  handSize: number;
  /** Left or right hand */
  handedness: Handedness | null;
  /** Pitch, Roll, Yaw in degrees */
  eulerDegrees: { pitch: number; roll: number; yaw: number };
}
