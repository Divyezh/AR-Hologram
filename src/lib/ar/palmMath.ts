import * as THREE from 'three';
import { NormalizedLandmark, Handedness } from '../../types/hand';
import { HAND_LANDMARK } from '../../constants/landmarks';

export interface RawPalmData {
  center: { x: number; y: number; z: number };
  normal: THREE.Vector3;
  directionUp: THREE.Vector3;
  directionRight: THREE.Vector3;
  rotationEuler: THREE.Euler;
  quaternion: THREE.Quaternion;
  handSpan: number;
}

/**
 * Calculates palm center, coordinate frame, normal vector, and rotation matrix
 * from stable anatomical hand landmarks.
 */
export function calculateRawPalmData(
  landmarks: NormalizedLandmark[],
  handedness: Handedness | null = 'Right'
): RawPalmData | null {
  if (!landmarks || landmarks.length < 21) {
    return null;
  }

  const wrist = landmarks[HAND_LANDMARK.WRIST];
  const indexMcp = landmarks[HAND_LANDMARK.INDEX_FINGER_MCP];
  const middleMcp = landmarks[HAND_LANDMARK.MIDDLE_FINGER_MCP];
  const ringMcp = landmarks[HAND_LANDMARK.RING_FINGER_MCP];
  const pinkyMcp = landmarks[HAND_LANDMARK.PINKY_MCP];

  // Palm center: weighted barycenter of wrist, index MCP, middle MCP, ring MCP, pinky MCP
  const centerX = (wrist.x * 0.2 + indexMcp.x * 0.2 + middleMcp.x * 0.2 + ringMcp.x * 0.2 + pinkyMcp.x * 0.2);
  const centerY = (wrist.y * 0.2 + indexMcp.y * 0.2 + middleMcp.y * 0.2 + ringMcp.y * 0.2 + pinkyMcp.y * 0.2);
  const centerZ = (wrist.z * 0.2 + indexMcp.z * 0.2 + middleMcp.z * 0.2 + ringMcp.z * 0.2 + pinkyMcp.z * 0.2);

  // Direction along palm from wrist to base of middle finger (Y axis pointing toward fingers)
  const vWrist = new THREE.Vector3(wrist.x, -wrist.y, -wrist.z);
  const vMiddle = new THREE.Vector3(middleMcp.x, -middleMcp.y, -middleMcp.z);
  const vUp = new THREE.Vector3().subVectors(vMiddle, vWrist).normalize();

  // Vector across knuckles: from index MCP to pinky MCP
  const vIndex = new THREE.Vector3(indexMcp.x, -indexMcp.y, -indexMcp.z);
  const vPinky = new THREE.Vector3(pinkyMcp.x, -pinkyMcp.y, -pinkyMcp.z);
  
  // Right vector across palm
  const vAcross = new THREE.Vector3().subVectors(vPinky, vIndex).normalize();

  // Normal vector: cross product of Up and Across
  // For right hand vs left hand, adjust sign so normal points out of palm surface
  const vNormal = new THREE.Vector3();
  if (handedness === 'Left') {
    vNormal.crossVectors(vAcross, vUp).normalize();
  } else {
    vNormal.crossVectors(vUp, vAcross).normalize();
  }

  // Ensure orthonormal basis
  const vRight = new THREE.Vector3().crossVectors(vUp, vNormal).normalize();

  // Create rotation matrix from orthonormal basis
  const rotMatrix = new THREE.Matrix4();
  rotMatrix.makeBasis(vRight, vUp, vNormal);

  const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
  const rotationEuler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');

  // Palm physical span (metric approximation in normalized coords)
  const dx = indexMcp.x - pinkyMcp.x;
  const dy = indexMcp.y - pinkyMcp.y;
  const dz = (indexMcp.z || 0) - (pinkyMcp.z || 0);
  const handSpan = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return {
    center: { x: centerX, y: centerY, z: centerZ },
    normal: vNormal,
    directionUp: vUp,
    directionRight: vRight,
    rotationEuler,
    quaternion,
    handSpan: Math.max(0.05, Math.min(handSpan, 0.45)),
  };
}
