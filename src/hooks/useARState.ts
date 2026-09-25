'use client';

import { useState, useCallback } from 'react';
import { ARStudioState } from '../types/ar';
import { CHARACTERS } from '../data/characters';
import { EFFECTS } from '../data/effects';

export function useARState() {
  const [state, setState] = useState<ARStudioState>({
    isCameraActive: false,
    isModelLoaded: false,
    isTrackingReady: false,
    isHandDetected: false,
    activeHandSide: null,
    selectedCharacterId: CHARACTERS[0].id,
    selectedEffectId: EFFECTS[0].id,
    selectedAnimationId: CHARACTERS[0].defaultAnimation,
    debugMode: false,
    isMirrored: true,
    effectsIntensity: 1.0,
    particlesEnabled: true,
    audioFeedback: true,
    fps: 60,
    detectionLatency: 0,
  });

  const selectCharacter = useCallback((id: string) => {
    const char = CHARACTERS.find((c) => c.id === id);
    setState((prev) => ({
      ...prev,
      selectedCharacterId: id,
      selectedAnimationId: char ? char.defaultAnimation : 'Idle',
    }));
  }, []);

  const selectEffect = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedEffectId: id }));
  }, []);

  const selectAnimation = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedAnimationId: id }));
  }, []);

  const toggleDebugMode = useCallback(() => {
    setState((prev) => ({ ...prev, debugMode: !prev.debugMode }));
  }, []);

  const toggleMirrorMode = useCallback(() => {
    setState((prev) => ({ ...prev, isMirrored: !prev.isMirrored }));
  }, []);

  const toggleParticles = useCallback(() => {
    setState((prev) => ({ ...prev, particlesEnabled: !prev.particlesEnabled }));
  }, []);

  const setEffectsIntensity = useCallback((intensity: number) => {
    setState((prev) => ({ ...prev, effectsIntensity: intensity }));
  }, []);

  const updateTelemetry = useCallback((fps: number, latency: number, isHandDetected: boolean, handSide: 'Left' | 'Right' | null) => {
    setState((prev) => {
      // Only update if changed to avoid unnecessary re-renders
      if (
        prev.fps === fps &&
        prev.detectionLatency === latency &&
        prev.isHandDetected === isHandDetected &&
        prev.activeHandSide === handSide
      ) {
        return prev;
      }
      return {
        ...prev,
        fps,
        detectionLatency: latency,
        isHandDetected,
        activeHandSide: handSide,
      };
    });
  }, []);

  const setTrackingReady = useCallback((ready: boolean) => {
    setState((prev) => ({ ...prev, isTrackingReady: ready }));
  }, []);

  return {
    state,
    selectCharacter,
    selectEffect,
    selectAnimation,
    toggleDebugMode,
    toggleMirrorMode,
    toggleParticles,
    setEffectsIntensity,
    updateTelemetry,
    setTrackingReady,
  };
}
