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
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Maximize2,
  Video,
  Monitor,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { PikachuModel } from './PikachuModel';
import { RoadSurfaceScanner } from './RoadSurfaceScanner';
import { ARCameraController } from './ARCameraController';
import { Pokeball3D } from './Pokeball3D';
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

  // Surface detection, orientation tracking & visibility state
  // Default to 'desk' for front camera / webcam, or 'road' for rear camera
  const {
    scanStatus,
    hasGyro,
    isTiltTowardsRoad,
    roadAnchor,
    cameraRotation,
    surfaceConfidence,
    isPikachuVisible,
    offscreenDirection,
    surfaceType,
    setSurfaceType,
    requestGyroPermission,
    placeOnRoad,
    setManualRotation,
    rescanRoad,
    confirmSpawn,
  } = useARSurfaceTracking(1000, facingMode === 'user' ? 'desk' : 'road');

  const [pikachuRotY, setPikachuRotY] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [arToggle, setArToggle] = useState(true);
  const [interactionNotice, setInteractionNotice] = useState('Pikachu is on your desk! Click anywhere on the desk to move him.');
  const [photoFlash, setPhotoFlash] = useState(false);

  // Size option: 5-year-old child (~1.10m tall = scale 0.55) by default!
  const [sizeMode, setSizeMode] = useState<'child' | 'giant' | 'compact'>('child');
  const pikachuScale = sizeMode === 'child' ? 0.55 : sizeMode === 'giant' ? 0.85 : 0.32;

  // Pokeball throw animation & interaction state (Image 2 Pokemon GO mechanics)
  const [isPokeballThrown, setIsPokeballThrown] = useState(false);
  const [throwProgress, setThrowProgress] = useState(0);
  const [ballDragOffset, setBallDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingBall, setIsDraggingBall] = useState(false);
  const throwAnimRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Auto-start camera on ALL devices (webcam on desktop, rear road camera on mobile)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      startCamera(isMobile ? 'environment' : 'user');
    }
  }, [startCamera]);

  // Sync surface type with camera facing mode
  useEffect(() => {
    setSurfaceType(facingMode === 'user' ? 'desk' : 'road');
  }, [facingMode, setSurfaceType]);

  // Request gyro permission on iOS user interaction if needed
  const handleEnableSensors = async () => {
    const granted = await requestGyroPermission();
    if (granted) {
      setInteractionNotice('Gyroscope enabled! Move phone to look around.');
    }
  };

  // Update HUD guidance when surface state changes
  useEffect(() => {
    if (!isPikachuVisible && hasGyro) {
      if (offscreenDirection === 'down') {
        setInteractionNotice('Tilt camera down to look at Pikachu');
      } else if (offscreenDirection === 'left') {
        setInteractionNotice('Turn left to see Pikachu');
      } else if (offscreenDirection === 'right') {
        setInteractionNotice('Turn right to see Pikachu');
      }
    } else {
      if (surfaceType === 'desk') {
        setInteractionNotice('Pikachu is on your desk surface! Click anywhere on desk to place him.');
      } else {
        setInteractionNotice('Pikachu is on the ground! Click to move him or swipe Pokéball.');
      }
    }
  }, [surfaceType, isPikachuVisible, offscreenDirection, hasGyro]);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) soundManager.playClick();
  };

  // Toggle surface mode between Desk (Table) and Road (Floor)
  const toggleSurface = () => {
    soundManager.playClick();
    const next = surfaceType === 'desk' ? 'road' : 'desk';
    setSurfaceType(next);
    if (next === 'desk') {
      setInteractionNotice('🖥️ Desk surface mode! Pikachu is on your desk.');
    } else {
      setInteractionNotice('🛣️ Road / Floor surface mode! Pikachu is on the ground.');
    }
  };

  // Toggle Pikachu size between Child (1.1m) -> Giant (1.7m) -> Compact (0.6m)
  const toggleSize = () => {
    soundManager.playClick();
    if (sizeMode === 'child') {
      setSizeMode('giant');
      setInteractionNotice('Pikachu scaled to Giant size (1.7m)!');
    } else if (sizeMode === 'giant') {
      setSizeMode('compact');
      setInteractionNotice('Pikachu scaled to Compact size (0.6m)!');
    } else {
      setSizeMode('child');
      setInteractionNotice('Pikachu scaled to 5-year-old child size (1.1m)!');
    }
  };

  // Launch the Pokéball at Pikachu
  const launchPokeball = useCallback(() => {
    if (isPokeballThrown) return;

    setIsPokeballThrown(true);
    setThrowProgress(0);
    soundManager.playClick();
    setInteractionNotice('Pokéball thrown!');

    const startTime = performance.now();
    const duration = 650; // ms to reach Pikachu

    const animateThrow = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setThrowProgress(progress);

      if (progress < 1) {
        throwAnimRef.current = requestAnimationFrame(animateThrow);
      } else {
        // Hit target!
        soundManager.playPikachuCry();
        setInteractionNotice('⚡ Direct hit! Pikachu used Thunder Shock!');
        // Reset Pokeball after celebration
        setTimeout(() => {
          setIsPokeballThrown(false);
          setThrowProgress(0);
          setBallDragOffset({ x: 0, y: 0 });
        }, 1400);
      }
    };

    throwAnimRef.current = requestAnimationFrame(animateThrow);
  }, [isPokeballThrown]);

  // Handle Pokeball touch/mouse drag to flick & throw
  const handleBallPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingBall(true);
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleBallPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingBall || !pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    // Only allow upward or slight horizontal drag
    setBallDragOffset({
      x: Math.max(-60, Math.min(60, dx)),
      y: Math.max(-120, Math.min(20, dy)),
    });
  };

  const handleBallPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingBall || !pointerStartRef.current) return;
    const deltaY = e.clientY - pointerStartRef.current.y;
    const duration = Date.now() - pointerStartRef.current.time;

    setIsDraggingBall(false);

    // If dragged upward by at least 25px or tapped quickly (< 250ms), throw!
    if (deltaY < -25 || (duration < 250 && Math.abs(deltaY) < 15)) {
      launchPokeball();
    } else {
      // Snap ball back into place
      setBallDragOffset({ x: 0, y: 0 });
    }

    pointerStartRef.current = null;
  };

  // Screen background pointer: Clicking/tapping on the desk places Pikachu right there!
  const handleScreenPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleScreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Pan camera on drag if device has no gyroscope
    if (!hasGyro && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
      setManualRotation(dy * 0.003, dx * 0.003);
      pointerStartRef.current.x = e.clientX;
      pointerStartRef.current.y = e.clientY;
    }
  };

  const handleScreenPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);
    const duration = Date.now() - pointerStartRef.current.time;

    // Quick tap/click: places Pikachu right on that desk or ground surface point!
    if (deltaX < 14 && deltaY < 14 && duration < 350) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        placeOnRoad(e.clientX, e.clientY, rect);
        soundManager.playClick();
        setInteractionNotice(`⚡ Pikachu hopped to your ${surfaceType === 'desk' ? 'desk' : 'ground'} spot!`);
      }
    }

    pointerStartRef.current = null;
  };

  // Snapshot flash feature
  const takeSnapshot = () => {
    setPhotoFlash(true);
    soundManager.playClick();
    setTimeout(() => setPhotoFlash(false), 200);
    setInteractionNotice('📸 AR Photo captured!');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black select-none touch-none"
      onPointerDown={handleScreenPointerDown}
      onPointerMove={handleScreenPointerMove}
      onPointerUp={handleScreenPointerUp}
    >
      {/* 1. Real-World Camera Stream (Looking at the desk / room / outdoor road) */}
      <CameraView
        ref={setVideoElement}
        isActive={isCameraActive}
        isMirrored={isMirrored}
      />

      {/* Snapshot Flash Overlay */}
      {photoFlash && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />}

      {/* Camera Off / Pending Alert Banner */}
      {!isCameraActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-yellow-400/50 text-white shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Video className="w-4 h-4 text-yellow-400 shrink-0 animate-pulse" />
          <span className="text-xs text-white/90">Camera off (outdoor road simulation active)</span>
          <button
            onClick={() => startCamera(facingMode)}
            className="px-3 py-1 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-extrabold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Enable Camera
          </button>
        </div>
      )}

      {/* 2. Three.js 3D World Scene with Road/Desk Detection & 5-Year-Old Child Size Pikachu */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 0] }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
          style={{ background: 'transparent' }}
        >
          {/* Gyroscope & drag camera controller synced to device tilt */}
          <ARCameraController rotation={cameraRotation} />

          {/* Realistic Daylight Outdoor Road / Indoor Desk Lighting */}
          <ambientLight intensity={1.5} color="#ffffff" />
          <directionalLight
            position={[3, 8, 4]}
            intensity={2.6}
            color="#fef3c7"
            castShadow
          />
          <directionalLight
            position={[-3, 5, -2]}
            intensity={1.2}
            color="#93c5fd"
          />

          {/* Simulated Realistic Outdoor Road Ground Plane when camera is off */}
          {!isCameraActive && (
            <group position={[0, -1.15, -4]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[24, 24]} />
                <meshStandardMaterial color="#27272a" roughness={0.9} metalness={0.05} />
              </mesh>
              <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.22, 22]} />
                <meshBasicMaterial color="#facc15" />
              </mesh>
              <mesh position={[-3.5, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.25, 22]} />
                <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
              </mesh>
              <mesh position={[3.5, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.25, 22]} />
                <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
              </mesh>
            </group>
          )}

          {/* 3D Road / Desk Scanning Reticle on the Surface Plane */}
          {arToggle && scanStatus === 'scanning' && (
            <RoadSurfaceScanner
              position={roadAnchor}
              isDetected={true}
              confidence={surfaceConfidence}
            />
          )}

          {/* 3D Pikachu Model firmly grounded on the Desk or Road surface */}
          {/* Scale 0.55 = 1.10m tall (Size of a 5-year-old child!) */}
          {arToggle && (
            <PikachuModel
              scale={pikachuScale}
              position={roadAnchor}
              rotation={[0, pikachuRotY, 0]}
              isSpawned={true}
              visible={isPikachuVisible}
              onInteract={() => {
                soundManager.playPikachuCry();
                setInteractionNotice('⚡ Pikachu used Thunderbolt!');
              }}
            />
          )}

          {/* 3D In-Flight Pokéball during throw */}
          {isPokeballThrown && (
            <Pokeball3D
              isThrown={isPokeballThrown}
              throwProgress={throwProgress}
              startPos={[0, -0.4, -1.0]}
              targetPos={[roadAnchor[0], roadAnchor[1] + 0.45, roadAnchor[2]]}
              visible={true}
            />
          )}
        </Canvas>
      </div>

      {/* 3. Top Header: Authentic Pokémon GO Encounter Header (Matching Image 2) */}
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Exit / Run Away from Encounter */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onBackToStudio ? (
            <button
              onClick={onBackToStudio}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/20 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              <span>Hologram Studio</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/20 text-white text-xs font-semibold shadow-lg transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              <span>Exit</span>
            </Link>
          )}
        </div>

        {/* Center: Authentic Pokémon GO Encounter Name & CP Badge (Matching Image 2) */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-3 px-5 py-1.5 rounded-full bg-black/60 backdrop-blur-3xl border border-white/25 shadow-xl">
            <span className="text-base font-bold tracking-wide text-white drop-shadow-md">Pikachu</span>
            <span className="text-xs font-mono font-semibold text-yellow-300 drop-shadow-md">CP ???</span>
          </div>
        </div>

        {/* Right: AR Toggle Switch (Matching Image 2 green pill) & Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Authentic Pokémon GO AR Toggle Switch */}
          <button
            onClick={() => setArToggle(!arToggle)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-2xl border text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 ${
              arToggle
                ? 'bg-emerald-500/90 text-white border-emerald-300 shadow-emerald-500/30'
                : 'bg-black/60 text-white/50 border-white/20'
            }`}
          >
            <span>AR</span>
            <span
              className={`w-3.5 h-3.5 rounded-full border border-black/20 transition-all ${
                arToggle ? 'bg-white shadow-xs translate-x-0.5' : 'bg-white/40 -translate-x-0.5'
              }`}
            />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/20 text-white transition-all cursor-pointer shadow-md"
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4 text-yellow-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>

          {/* Flip Camera (Rear Road View vs Front Desk View) */}
          <button
            onClick={toggleFacingMode}
            title={`Switch to ${facingMode === 'user' ? 'Rear (Ground View)' : 'Front (Desk View)'} Camera`}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/20 text-white transition-all cursor-pointer shadow-md"
          >
            <SwitchCamera className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* 4. Top Status & Interaction Toast (Cleanly below header, no overlap with bottom dock) */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 flex justify-center w-full max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-3xl border border-white/20 text-xs text-white/95 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>{interactionNotice}</span>
        </div>
      </div>

      {/* 5. Authentic Pokémon GO Off-Screen Directional Indicators (Only on mobile when looking away) */}
      {!isPikachuVisible && hasGyro && (
        <>
          {offscreenDirection === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-pulse">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-yellow-400/95 text-black font-extrabold text-xs shadow-xl backdrop-blur-md">
                <ArrowLeft className="w-4 h-4 animate-bounce" />
                <span>Pikachu</span>
              </div>
            </div>
          )}

          {offscreenDirection === 'right' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-pulse">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-yellow-400/95 text-black font-extrabold text-xs shadow-xl backdrop-blur-md">
                <span>Pikachu</span>
                <ArrowRight className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          )}

          {offscreenDirection === 'down' && (
            <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/95 text-black font-extrabold text-xs shadow-xl backdrop-blur-md">
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span>Tilt camera down to ground</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* 6. Bottom Encounter Dock with Authentic Interactive Pokéball (Matching Image 2!) */}
      <footer className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-4">
        {/* Action Controls & Pokéball Throw Dock */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Surface Switcher: Desk vs Floor/Road */}
          <button
            onClick={toggleSurface}
            title="Toggle between Desk Surface and Floor/Road Surface"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-3xl text-emerald-300 border border-emerald-400/35 text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
          >
            {surfaceType === 'desk' ? <Monitor className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{surfaceType === 'desk' ? 'Desk Surface' : 'Floor Surface'}</span>
          </button>

          {/* Size Switch Button: 5-Year-Old Kid (~1.10m) */}
          <button
            onClick={toggleSize}
            title="Toggle Pikachu Size"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-3xl text-yellow-300 border border-yellow-400/35 text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{sizeMode === 'child' ? '5-Yr Kid (1.1m)' : sizeMode === 'giant' ? 'Giant (1.7m)' : 'Compact (0.6m)'}</span>
          </button>

          {/* Authentic Interactive Pokéball (Matching Image 2!) */}
          <div className="relative flex flex-col items-center">
            {/* "Swipe to throw" hint (positioned cleanly above Pokeball with zero overlap) */}
            <div className="mb-2 text-[10px] font-extrabold text-white/85 tracking-widest uppercase select-none drop-shadow-md bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10 pointer-events-none">
              Swipe to throw
            </div>

            <div
              className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `translate(${ballDragOffset.x}px, ${ballDragOffset.y}px)`,
                transition: isDraggingBall ? 'none' : 'transform 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
              }}
              onPointerDown={handleBallPointerDown}
              onPointerMove={handleBallPointerMove}
              onPointerUp={handleBallPointerUp}
            >
              {/* Ambient Glow behind Pokeball */}
              <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl scale-125 pointer-events-none" />

              {/* Pokéball Graphic (Exact Pokémon GO Encounter Ball from Image 2) */}
              <div
                className={`w-18 h-18 rounded-full shadow-2xl overflow-hidden relative border-2 border-black/80 transition-all ${
                  isPokeballThrown ? 'opacity-0 scale-50' : 'opacity-100 scale-100 hover:scale-105 active:scale-95'
                }`}
                style={{
                  boxShadow: '0 12px 28px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.4)',
                }}
              >
                {/* Top Red Half */}
                <div className="w-full h-1/2 bg-linear-to-b from-red-500 to-red-600 border-b-2 border-black" />

                {/* Bottom White Half */}
                <div className="w-full h-1/2 bg-linear-to-b from-gray-100 to-gray-300" />

                {/* Center Black Band */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2.5 bg-black z-10" />

                {/* Center Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black flex items-center justify-center z-20 shadow-md">
                  <div className="w-4 h-4 rounded-full bg-white border border-gray-400 flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-gray-200 border border-gray-300" />
                  </div>
                </div>

                {/* Realistic Gloss Highlight */}
                <div className="absolute top-1 left-2.5 w-6 h-3 rounded-full bg-white/40 blur-[1px] rotate-[-25deg] pointer-events-none z-30" />
              </div>
            </div>
          </div>

          {/* Relocate Button */}
          <button
            onClick={() => {
              rescanRoad();
              setInteractionNotice(`Click anywhere on your ${surfaceType === 'desk' ? 'desk' : 'ground'} to place Pikachu!`);
            }}
            title="Relocate Pikachu"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-3xl text-white border border-white/25 text-xs font-semibold shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Relocate</span>
          </button>

          {/* Camera Photo Snapshot Button */}
          <button
            onClick={takeSnapshot}
            title="Take Photo"
            className="p-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-3xl text-white border border-white/25 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
