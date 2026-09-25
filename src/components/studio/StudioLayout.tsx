'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useHandTracking } from '../../hooks/useHandTracking';
import { usePalmAnchor } from '../../hooks/usePalmAnchor';
import { useARState } from '../../hooks/useARState';
import { CameraView } from '../camera/CameraView';
import { CameraPermission } from '../camera/CameraPermission';
import { CameraError } from '../camera/CameraError';
import { AROverlay } from '../ar/AROverlay';
import { ARLoading } from '../ar/ARLoading';
import { StudioToolbar } from './StudioToolbar';
import { StudioControls } from './StudioControls';
import { EffectSelector } from './EffectSelector';
import { DebugPanel } from './DebugPanel';
import { EFFECTS } from '../../data/effects';
import { soundManager } from '../../lib/audio/soundManager';

export const StudioLayout: React.FC = () => {
  const {
    status: cameraStatus,
    stream,
    facingMode,
    error: cameraError,
    errorType,
    resolution,
    isMirrored,
    devices,
    activeDeviceId,
    videoRef,
    startCamera,
    stopCamera,
    toggleFacingMode,
    toggleMirrored,
    setVideoElement,
  } = useCamera();

  const isCameraActive = cameraStatus === 'active';

  const {
    isReady: isTrackingReady,
    error: trackingError,
    isHandDetected,
    latestTrackingRef,
    latestGestureRef,
    latencyRef,
    processFrame,
  } = useHandTracking(isCameraActive);

  const { anchorRef, updateAnchor, resetAnchor } = usePalmAnchor();

  const {
    state: arState,
    isAudioMuted,
    selectCharacter,
    selectEffect,
    selectAnimation,
    toggleDebugMode,
    toggleParticles,
    toggleAudio,
    setEffectsIntensity,
    updateTelemetry,
    setTrackingReady,
  } = useARState();

  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  // Sync tracking readiness to AR state
  useEffect(() => {
    setTrackingReady(isTrackingReady);
  }, [isTrackingReady, setTrackingReady]);

  // When camera stops, reset anchor & stop sounds
  useEffect(() => {
    if (!isCameraActive) {
      resetAnchor();
      soundManager.stopEffectSound();
    }
  }, [isCameraActive, resetAnchor]);

  const currentEffect = EFFECTS.find((e) => e.id === arState.selectedEffectId) || EFFECTS[0];

  // Trigger Howler sound effects when hand is detected or effect changes
  useEffect(() => {
    if (arState.isHandDetected && isCameraActive) {
      soundManager.playIgnite();
      soundManager.startEffectSound(currentEffect.soundType);
    } else {
      soundManager.stopEffectSound();
    }
  }, [arState.isHandDetected, currentEffect.soundType, isCameraActive]);

  useEffect(() => {
    return () => {
      soundManager.stopEffectSound();
    };
  }, []);

  const handleStartCamera = useCallback(() => {
    soundManager.init();
    startCamera();
  }, [startCamera]);

  const handleRetryCamera = useCallback(() => {
    soundManager.init();
    startCamera();
  }, [startCamera]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Base Camera Layer */}
      <CameraView
        ref={setVideoElement}
        isActive={isCameraActive}
        isMirrored={isMirrored}
      />

      {/* 2. Real-time AR Three.js & Vision Tracking Overlay */}
      {isCameraActive && (
        <AROverlay
          videoRef={videoRef}
          isCameraActive={isCameraActive}
          isMirrored={isMirrored}
          debugMode={arState.debugMode}
          selectedEffect={currentEffect}
          selectedCharacterId={arState.selectedCharacterId}
          selectedAnimationId={arState.selectedAnimationId}
          particlesEnabled={arState.particlesEnabled}
          anchorRef={anchorRef}
          processFrame={processFrame}
          updateAnchor={updateAnchor}
          latestTrackingRef={latestTrackingRef}
          latestGestureRef={latestGestureRef}
          latencyRef={latencyRef}
          onTriggerAnimation={selectAnimation}
          onTelemetryUpdate={updateTelemetry}
        />
      )}

      {/* 3. Studio Top Header Toolbar */}
      <StudioToolbar
        cameraStatus={cameraStatus}
        isModelReady={isTrackingReady}
        isHandDetected={arState.isHandDetected}
        activeHandSide={arState.activeHandSide}
        isMirrored={isMirrored}
        debugMode={arState.debugMode}
        isAudioMuted={isAudioMuted}
        hasMultipleCameras={devices.length > 1}
        onStartCamera={handleStartCamera}
        onStopCamera={stopCamera}
        onFlipCamera={toggleFacingMode}
        onToggleMirror={toggleMirrored}
        onToggleDebug={toggleDebugMode}
        onToggleAudio={toggleAudio}
      />

      {/* 4. Quick Effect Selector Bar on Main Video Screen */}
      <div className="absolute top-18 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="p-1 rounded-full bg-black/60 backdrop-blur-3xl border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.5)] pointer-events-auto max-w-full overflow-x-auto scrollbar-none">
          <EffectSelector
            selectedId={arState.selectedEffectId}
            onSelect={selectEffect}
          />
        </div>
      </div>

      {/* 5. Studio Bottom Selection Dock */}
      <StudioControls
        selectedCharacterId={arState.selectedCharacterId}
        selectedEffectId={arState.selectedEffectId}
        selectedAnimationId={arState.selectedAnimationId}
        particlesEnabled={arState.particlesEnabled}
        effectsIntensity={arState.effectsIntensity}
        onSelectCharacter={selectCharacter}
        onSelectEffect={selectEffect}
        onSelectAnimation={selectAnimation}
        onToggleParticles={toggleParticles}
        onSetIntensity={setEffectsIntensity}
      />

      {/* 5. Permission Modal (When camera is idle or requesting) */}
      {(cameraStatus === 'idle' || cameraStatus === 'requesting') && (
        <CameraPermission
          onGrantPermission={handleStartCamera}
          isRequesting={cameraStatus === 'requesting'}
        />
      )}

      {/* 6. Camera Error Modal */}
      {cameraStatus === 'error' && cameraError && (
        <CameraError
          error={cameraError}
          errorType={errorType}
          onRetry={handleRetryCamera}
        />
      )}

      {/* 7. Tracking Model Loading Screen */}
      {isCameraActive && !isTrackingReady && !trackingError && (
        <ARLoading message="Loading MediaPipe Hand Landmarker AI..." />
      )}

      {/* 8. Diagnostics Side Drawer */}
      <DebugPanel
        isOpen={isDebugPanelOpen}
        onClose={() => setIsDebugPanelOpen(false)}
        resolution={resolution}
        devices={devices}
        activeDeviceId={activeDeviceId}
        fps={arState.fps}
        latencyMs={arState.detectionLatency}
        isMirrored={isMirrored}
      />
    </div>
  );
};
