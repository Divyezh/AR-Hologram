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

  // Knuckle arch center (MCP joints)
  const knuckleX = (indexMcp.x + middleMcp.x + ringMcp.x + pinkyMcp.x) * 0.25;
  const knuckleY = (indexMcp.y + middleMcp.y + ringMcp.y + pinkyMcp.y) * 0.25;
  const knuckleZ = ((indexMcp.z || 0) + (middleMcp.z || 0) + (ringMcp.z || 0) + (pinkyMcp.z || 0)) * 0.25;

  // True palm center: anatomical hollow of the palm (midpoint between wrist and knuckle arch)
  const centerX = wrist.x * 0.52 + knuckleX * 0.48;
  const centerY = wrist.y * 0.52 + knuckleY * 0.48;
  const centerZ = (wrist.z || 0) * 0.52 + knuckleZ * 0.48;

  // Direction along palm from wrist to base of middle finger (Y axis pointing toward fingers)
  const vWrist = new THREE.Vector3(wrist.x, -wrist.y, -wrist.z);
  const vMiddle = new THREE.Vector3(middleMcp.x, -middleMcp.y, -middleMcp.z);
  const vUp = new THREE.Vector3().subVectors(vMiddle, vWrist).normalize();

  // Vector across knuckles: from index MCP to pinky MCP
  const vIndex = new THREE.Vector3(indexMcp.x, -indexMcp.y, -indexMcp.z);
  const vPinky = new THREE.Vector3(pinkyMcp.x, -pinkyMcp.y, -pinkyMcp.z);
  
  // Right vector across palm
  const vAcross = new THREE.Vector3().subVectors(vPinky, vIndex).normalize();

  // Normal vector pointing out of palm face (towards camera / up into air from palm):
  // When palm faces the viewer (+Z):
  // Left hand: Pinky is at left (-X), Index is at right (+X). vAcross points left (-X). vUp points up (+Y).
  // vUp cross vAcross = [0, 1, 0] x [-1, 0, 0] = [0, 0, 1] (+Z, towards camera, out of palm face).
  // Right hand: Pinky is at right (+X), Index is at left (-X). vAcross points right (+X). vUp points up (+Y).
  // vAcross cross vUp = [1, 0, 0] x [0, 1, 0] = [0, 0, 1] (+Z, towards camera, out of palm face).
  const vNormal = new THREE.Vector3();
  if (handedness === 'Left') {
    vNormal.crossVectors(vUp, vAcross).normalize();
  } else {
    vNormal.crossVectors(vAcross, vUp).normalize();
  }

  // Construct orthonormal coordinate frame for 3D objects:
  // - local Y axis (upright): MUST BE vNormal!
  //   In Three.js standard conventions:
  //   1) Character models stand along local +Y (feet at Y=0, head at +Y).
  //      Setting yAxis = vNormal makes characters stand vertically UP on the palm!
  //   2) Shields, magic circles, and planar VFX lie in the X-Z plane with normal +Y.
  //      Setting yAxis = vNormal makes shields lie completely FLAT on the palm face!
  const yAxis = vNormal.clone().normalize();

  // - local Z axis: character gaze / forward direction.
  //   When a user holds out their hand, fingers point away along vUp, and wrist is at -vUp.
  //   We want the character to face the user (towards the wrist).
  //   Orthogonalize -vUp against yAxis:
  const zDir = vUp.clone().negate();
  let zAxis = zDir.clone().sub(yAxis.clone().multiplyScalar(zDir.dot(yAxis))).normalize();
  if (zAxis.lengthSq() < 0.001) {
    zAxis = new THREE.Vector3(0, 0, 1);
  }

  // - local X axis: orthogonal right vector to complete right-handed basis (X x Y = Z)
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();

  // Create rotation matrix from orthonormal basis:
  // Column 0 = xAxis, Column 1 = yAxis (UP from palm), Column 2 = zAxis (character front / toward user)
  const rotMatrix = new THREE.Matrix4();
  rotMatrix.makeBasis(xAxis, yAxis, zAxis);

  const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
  const rotationEuler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');

  // Palm physical span (metric approximation in normalized coords)
  const dx = indexMcp.x - pinkyMcp.x;
  const dy = indexMcp.y - pinkyMcp.y;
  const dz = (indexMcp.z || 0) - (pinkyMcp.z || 0);
  const knuckleSpan = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Full hand length from wrist to middle finger tip
  const middleTip = landmarks[HAND_LANDMARK.MIDDLE_FINGER_TIP] || middleMcp;
  const fx = middleTip.x - wrist.x;
  const fy = middleTip.y - wrist.y;
  const fz = (middleTip.z || 0) - (wrist.z || 0);
  const fullHandLength = Math.sqrt(fx * fx + fy * fy + fz * fz);

  // Hand span proportional to the user's complete hand size
  const handSpan = Math.max(knuckleSpan * 1.6, fullHandLength * 0.85);

  return {
    center: { x: centerX, y: centerY, z: centerZ },
    normal: vNormal,
    directionUp: yAxis,
    directionRight: xAxis,
    rotationEuler,
    quaternion,
    handSpan: Math.max(0.12, Math.min(handSpan, 0.65)),
  };
}
