'use client';

import { useState, useCallback } from 'react';
import { ARStudioState } from '../types/ar';
import { CHARACTERS } from '../data/characters';
import { EFFECTS } from '../data/effects';
import { soundManager } from '../lib/audio/soundManager';

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

  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const selectCharacter = useCallback((id: string) => {
    soundManager.playClick();
    const char = CHARACTERS.find((c) => c.id === id);
    setState((prev) => ({
      ...prev,
      selectedCharacterId: id,
      selectedAnimationId: char ? char.defaultAnimation : 'Idle',
    }));
  }, []);

  const selectEffect = useCallback((id: string) => {
    soundManager.playClick();
    setState((prev) => ({ ...prev, selectedEffectId: id }));
  }, []);

  const selectAnimation = useCallback((anim: string) => {
    soundManager.playClick();
    setState((prev) => ({ ...prev, selectedAnimationId: anim }));
  }, []);

  const toggleDebugMode = useCallback(() => {
    soundManager.playClick();
    setState((prev) => ({ ...prev, debugMode: !prev.debugMode }));
  }, []);

  const toggleMirrorMode = useCallback(() => {
    soundManager.playClick();
    setState((prev) => ({ ...prev, isMirrored: !prev.isMirrored }));
  }, []);

  const toggleParticles = useCallback(() => {
    soundManager.playClick();
    setState((prev) => ({ ...prev, particlesEnabled: !prev.particlesEnabled }));
  }, []);

  const toggleAudio = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
  }, []);

  const setEffectsIntensity = useCallback((intensity: number) => {
    setState((prev) => ({ ...prev, effectsIntensity: intensity }));
  }, []);

  const updateTelemetry = useCallback((fps: number, latency: number, isHandDetected: boolean, handSide: 'Left' | 'Right' | null) => {
    setState((prev) => {
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
    isAudioMuted,
    selectCharacter,
    selectEffect,
    selectAnimation,
    toggleDebugMode,
    toggleMirrorMode,
    toggleParticles,
    toggleAudio,
    setEffectsIntensity,
    updateTelemetry,
    setTrackingReady,
  };
}
