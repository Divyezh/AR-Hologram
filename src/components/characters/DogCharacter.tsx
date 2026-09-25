'use client';

import React, { useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CharacterConfig } from '../../types/character';

interface DogCharacterProps {
  config: CharacterConfig;
  animationName: string;
}

export const DogCharacter: React.FC<DogCharacterProps> = ({ config, animationName }) => {
  const { scene, animations } = useGLTF(config.modelPath);

  // Use SkeletonUtils.clone to properly clone SkinnedMeshes and rebind bones
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, clonedScene);

  useEffect(() => {
    if (!actions) return;

    // Fox animations: 'Survey', 'Walk', 'Run'
    const targetAnim =
      actions[animationName] ||
      actions[config.defaultAnimation] ||
      actions['Survey'] ||
      Object.values(actions)[0];

    if (targetAnim) {
      targetAnim.reset().fadeIn(0.2).play();
    }

    return () => {
      targetAnim?.fadeOut(0.2);
    };
  }, [actions, animationName, config.defaultAnimation]);

  return (
    <primitive
      object={clonedScene}
      scale={config.scale}
      position={config.positionOffset}
      rotation={config.rotationOffset}
    />
  );
};

// Preload model
useGLTF.preload('/models/dog/dog.glb');
