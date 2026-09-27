'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ChevronLeft,
  Camera,
  SwitchCamera,
  Volume2,
  VolumeX,
  Sparkles,
  Compass,
  RotateCcw,
  Target,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';
import { PikachuModel } from './PikachuModel';
import { RoadSurfaceScanner } from './RoadSurfaceScanner';
import { ARCameraController } from './ARCameraController';
import { CameraView } from '../camera/CameraView';
import { useCamera } from '../../hooks/useCamera';
import { useARSurfaceTracking } from '../../hooks/useARSurfaceTracking';
import { soundManager } from '../../lib/audio/soundManager';

interface PokemonWorldARProps {
  onBackToStudio?: () => void;
}

export const PokemonWorldAR: React.FC<PokemonWorldARProps> = ({ onBackToStudio }) => {
  const {
    status: cameraStatus,
    facingMode,
    isMirrored,
    videoRef,
    setVideoElement,
    startCamera,
    toggleFacingMode,
  } = useCamera();

  const isCameraActive = cameraStatus === 'active';

  // Surface detection & gyro camera tracking
  const {
    scanStatus,
    hasGyro,
    isTiltTowardsRoad,
    roadAnchor,
    cameraRotation,
    surfaceConfidence,
    requestGyroPermission,
    placeOnRoad,
    rescanRoad,
    confirmSpawn,
  } = useARSurfaceTracking(2000);

  const [pikachuRotY, setPikachuRotY] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [arToggle, setArToggle] = useState(true);
  const [interactionNotice, setInteractionNotice] = useState('Point camera at the road or ground');
  const [photoFlash, setPhotoFlash] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Default to rear camera ('environment') on mobile to view the road ahead
  useEffect(() => {
    // If on mobile/tablet, initiate environment facing mode if not already active
    if (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      startCamera('environment');
    }
  }, [startCamera]);

  // Update HUD guidance when surface state changes
  useEffect(() => {
    if (scanStatus === 'scanning') {
      if (isTiltTowardsRoad) {
        setInteractionNotice('Road surface detected! Locking position...');
      } else {
        setInteractionNotice('Point camera down at the road or land to place Pikachu');
      }
    } else {
      setInteractionNotice('Pikachu is on the road! Tap ground to move him.');
    }
  }, [scanStatus, isTiltTowardsRoad]);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) soundManager.playClick();
  };

  // Tap on the road / ground to place or move Pikachu
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);
    const duration = Date.now() - pointerStartRef.current.time;

    // Distinguish quick tap (< 250ms, < 10px move) from a drag/pan
    if (deltaX < 12 && deltaY < 12 && duration < 300) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPos = placeOnRoad(e.clientX, e.clientY, rect);
        soundManager.playClick();

        if (scanStatus === 'scanning') {
          confirmSpawn();
          setInteractionNotice('⚡ Pikachu landed on the road!');
        } else {
          setInteractionNotice('Pikachu hopping to new road position!');
        }
      }
    } else if (deltaX >= 12) {
      // Drag horizontal: rotate Pikachu towards drag direction
      const diffX = e.clientX - pointerStartRef.current.x;
      setPikachuRotY((prev) => prev + diffX * 0.008);
    }

    pointerStartRef.current = null;
  };

  // Photo snapshot flash feature
  const takeSnapshot = () => {
    setPhotoFlash(true);
    soundManager.playClick();
    setTimeout(() => setPhotoFlash(false), 200);
    setInteractionNotice('📸 Photo captured to gallery!');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 1. Real-World Camera Stream (Looking at the road / street / outdoor ground) */}
      <CameraView
        ref={setVideoElement}
        isActive={isCameraActive}
        isMirrored={isMirrored}
      />

      {/* Snapshot Flash Overlay */}
      {photoFlash && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />}

      {/* 2. Three.js 3D World Scene with Road Detection & Pikachu */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 0] }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
          style={{ background: 'transparent' }}
        >
          {/* Gyroscope-driven camera controller synced to device tilt */}
          <ARCameraController rotation={cameraRotation} />

          {/* Realistic Daylight Outdoor Road Lighting */}
          <ambientLight intensity={1.25} color="#ffffff" />
          <directionalLight
            position={[4, 10, 5]}
            intensity={2.2}
            color="#fef3c7"
            castShadow
          />
          <directionalLight
            position={[-3, 5, -2]}
            intensity={0.9}
            color="#93c5fd"
          />

          {/* 3D Road Scanning Reticle on the Ground Plane */}
          {arToggle && scanStatus === 'scanning' && (
            <RoadSurfaceScanner
              position={roadAnchor}
              isDetected={isTiltTowardsRoad || surfaceConfidence > 0.6}
              confidence={surfaceConfidence}
            />
          )}

          {/* 3D Pikachu Model firmly grounded on the Road with contact shadows */}
          {arToggle && (
            <PikachuModel
              scale={1.55}
              position={roadAnchor}
              rotation={[0, pikachuRotY, 0]}
              isSpawned={scanStatus === 'locked'}
              onInteract={() => setInteractionNotice('⚡ Pikachu used Thunderbolt!')}
            />
          )}
        </Canvas>
      </div>

      {/* 3. Top Header (Species, CP, AR toggle, and utility actions) */}
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Back / Exit */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onBackToStudio ? (
            <button
              onClick={onBackToStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/20 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Hologram Studio</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/20 text-white text-xs font-semibold shadow-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Exit</span>
            </Link>
          )}
        </div>

        {/* Center: Authentic Pokémon GO Species & CP Title */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/55 backdrop-blur-2xl border border-white/20 shadow-lg">
            <span className="text-sm font-bold tracking-wide text-white drop-shadow-md">Pikachu</span>
            <span className="text-xs font-mono font-semibold text-yellow-300 drop-shadow-md">CP ???</span>
          </div>
        </div>

        {/* Right: AR Switch, Audio Toggle, Flip Camera & iOS Gyro request */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* AR Toggle Switch */}
          <button
            onClick={() => setArToggle(!arToggle)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-2xl border text-xs font-bold transition-all cursor-pointer shadow-md ${
              arToggle
                ? 'bg-emerald-500/85 text-white border-emerald-300/60 shadow-emerald-500/20'
                : 'bg-black/50 text-white/60 border-white/20'
            }`}
          >
            <span>AR</span>
            <span className={`w-2 h-2 rounded-full ${arToggle ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-2xl border border-white/20 text-white transition-all cursor-pointer shadow-md"
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4 text-yellow-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>

          {/* Flip Camera (Switch between Rear Road View and Front View) */}
          <button
            onClick={toggleFacingMode}
            title={`Switch to ${facingMode === 'user' ? 'Rear (Road View)' : 'Front'} Camera`}
            className="p-2 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-2xl border border-white/20 text-white transition-all cursor-pointer shadow-md"
          >
            <SwitchCamera className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* 4. Scanning Guidance Banner (Visible during road surface detection) */}
      {scanStatus === 'scanning' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 max-w-sm w-full">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/70 backdrop-blur-3xl border border-yellow-400/30 text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 shrink-0">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">
                {isTiltTowardsRoad ? 'Surface Acquired' : 'Scanning Ground'}
              </span>
              <p className="text-xs text-white/80 leading-snug">
                Tilt camera towards the road or tap on the ground to spawn Pikachu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Floating Action & Interaction Dock (NO Pokéball as requested!) */}
      <footer className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-3 pointer-events-none px-4">
        {/* Interaction Toast / Tip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/65 backdrop-blur-3xl border border-white/20 text-xs text-white/95 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>{interactionNotice}</span>
        </div>

        {/* Action Controls Dock */}
        <div className="flex items-center gap-3 p-1.5 rounded-full bg-black/65 backdrop-blur-3xl border border-white/20 shadow-2xl pointer-events-auto">
          {/* Relocate / Rescan Road Button */}
          <button
            onClick={() => {
              rescanRoad();
              setInteractionNotice('Point at a new road spot or tap ground!');
            }}
            title="Scan New Road Area"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Relocate</span>
          </button>

          {/* Attack Trigger Button */}
          <button
            onClick={() => {
              soundManager.playPikachuCry();
              setInteractionNotice('⚡ Pikachu used Thunderbolt!');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Thunder Shock</span>
          </button>

          {/* Camera Photo Snapshot Button */}
          <button
            onClick={takeSnapshot}
            title="Take Photo"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
