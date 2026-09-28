'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface ARCameraControllerProps {
  rotation: [number, number, number]; // [pitch, yaw, roll]
  isInteractive?: boolean;
}

export const ARCameraController: React.FC<ARCameraControllerProps> = ({
  rotation,
  isInteractive = true,
}) => {
  const { camera } = useThree();
  const targetEuler = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    camera.rotation.order = 'YXZ';
  }, [camera]);

  useFrame((_, delta) => {
    if (!isInteractive) return;

    // Target rotation from gyro / drag orientation
    targetEuler.current.set(rotation[0], rotation[1], rotation[2], 'YXZ');

    // Smoothly damp camera rotation
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, targetEuler.current.x, 10.0, delta);
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, targetEuler.current.y, 10.0, delta);
    camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, targetEuler.current.z, 10.0, delta);
  });

  return null;
};
