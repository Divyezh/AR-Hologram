'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  Info,
  SwitchCamera,
  Flame,
  Clock,
  Sparkles,
  Camera,
  CameraOff,
} from 'lucide-react';
import { InteractiveFoodScene } from './InteractiveFoodScene';
import { DishItem, RESTAURANT_MENU, RESTAURANT_INFO } from '../../data/restaurantMenu';
import { useCamera } from '../../hooks/useCamera';
import { soundManager } from '../../lib/audio/soundManager';

interface RestaurantARCameraViewProps {
  currentDish: DishItem;
  onSelectDish: (dish: DishItem) => void;
  onBackToMenu: () => void;
  onTapInfo: (dish: DishItem) => void;
  onAddToCart: (dish: DishItem) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const RestaurantARCameraView: React.FC<RestaurantARCameraViewProps> = ({
  currentDish,
  onSelectDish,
  onBackToMenu,
  onTapInfo,
  onAddToCart,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  const {
    status: cameraStatus,
    stream,
    facingMode,
    isMirrored,
    startCamera,
    stopCamera,
    toggleFacingMode,
    toggleMirrored,
  } = useCamera();

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [resetPulse, setResetPulse] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Automatically start camera on mount for live dining AR experience
  useEffect(() => {
    startCamera('environment').catch(() => {
      // If environment camera fails, fallback to user camera
      startCamera('user').catch(() => {});
    });

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Connect stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleReset = () => {
    soundManager.playReset();
    setScale(1.0);
    setResetPulse(true);
    setTimeout(() => setResetPulse(false), 500);
  };

  const isCameraLive = cameraStatus === 'active';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 1. Camera Feed Layer / High-End Fallback Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isCameraLive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
          />
        ) : (
          /* Ambient Restaurant Table Backdrop if camera is inactive/blocked */
          <div className="w-full h-full bg-[#120d0a] flex items-center justify-center relative overflow-hidden">
            {/* Table Surface Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#2a170e]/80 via-[#140b07] to-black" />
            {/* Subtle dining cloth texture grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Camera prompt pill */}
            <div className="relative z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {cameraStatus === 'requesting'
                  ? 'Requesting camera access...'
                  : 'Tabletop AR Mode Active'}
              </span>
            </div>
          </div>
        )}

        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%] pointer-events-none" />
      </div>

      {/* 2. Three.js Interactive 3D Food Scene (Canvas) */}
      <div className="absolute inset-0 z-10">
        <InteractiveFoodScene
          dish={currentDish}
          onTapInfo={() => onTapInfo(currentDish)}
          isAutoRotate={isAutoRotate}
          onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
          scale={scale}
          onScaleChange={setScale}
          onResetTriggered={handleReset}
        />
      </div>

      {/* 3. Top Navigation & Header HUD */}
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Back to Restaurant Menu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Menu</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 text-amber-300 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{RESTAURANT_INFO.tableNumber}</span>
          </div>
        </div>

        {/* Center: Gesture Control Guide Pills (Directly from User Diagram) */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/15 text-[11px] text-white/90 font-medium pointer-events-auto shadow-xl">
          <span className="flex items-center gap-1 text-amber-300">
            <span>👆</span>
            <span>Rotate</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span>🤏</span>
            <span>Scale</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span>✋</span>
            <span>Move</span>
          </span>
          <span className="text-white/20">•</span>
          <button
            onClick={() => onTapInfo(currentDish)}
            className="flex items-center gap-1 text-orange-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>👆</span>
            <span>Tap → Info</span>
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-violet-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>👆👆</span>
            <span>Reset</span>
          </button>
        </div>

        {/* Right: Camera Switch & Cart Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Flip Front/Back Camera */}
          <button
            onClick={toggleFacingMode}
            title="Switch Camera (Front / Back)"
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>

          {/* Quick Reset Button */}
          <button
            onClick={handleReset}
            title="Double-Tap anywhere or click to reset view"
            className={`p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-all cursor-pointer ${
              resetPulse ? 'scale-125 border-amber-400 text-amber-400' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Auto-rotate Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsAutoRotate(!isAutoRotate);
            }}
            title={isAutoRotate ? 'Pause 360° Spin' : 'Start 360° Spin'}
            className={`p-2.5 rounded-full backdrop-blur-xl border transition-all cursor-pointer ${
              isAutoRotate
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-black/50 hover:bg-black/70 text-white/80 border-white/15'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Cart Tray */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {cartCount > 0 ? `${cartCount} • ₹${cartTotal}` : 'Tray'}
            </span>
          </button>
        </div>
      </header>

      {/* 4. Bottom Main Dish Card & Switcher (User Diagram Architecture) */}
      <footer className="absolute bottom-4 inset-x-4 z-20 flex flex-col items-center gap-3 pointer-events-none">
        {/* Mobile Gestures Pill (visible on small screens) */}
        <div className="flex md:hidden items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-[10px] text-white/80 font-mono pointer-events-auto">
          <span>👆 Drag rotate</span>
          <span>•</span>
          <span>🤏 Pinch zoom</span>
          <span>•</span>
          <button onClick={handleReset} className="text-amber-400 font-bold underline">
            👆👆 Reset
          </button>
        </div>

        {/* Featured Live Dish Action Card */}
        <div className="w-full max-w-xl p-4 sm:p-5 rounded-[28px] bg-neutral-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Dish Details */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Food Emoji Avatar */}
            <div
              onClick={() => onTapInfo(currentDish)}
              className="w-14 h-14 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/10 flex items-center justify-center text-3xl shrink-0 cursor-pointer shadow-inner transition-transform active:scale-95"
              title="Tap for Nutrition & Macros"
            >
              {currentDish.emoji}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentDish.badge}
                </span>
                <span className="text-[11px] text-white/50">{Math.round(scale * 100)}% portion</span>
              </div>

              {/* Dish Name */}
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                {currentDish.name}
              </h2>

              {/* Price Tag (₹249 Classic Burger) */}
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                {currentDish.currency}
                {currentDish.price}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Info Trigger Button */}
            <button
              onClick={() => onTapInfo(currentDish)}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/18 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Tap for Nutrition Info"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Add to Order Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onAddToCart(currentDish);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>
                Add to Order {currentDish.currency}
                {currentDish.price}
              </span>
            </button>
          </div>
        </div>

        {/* Dish Switcher Strip */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/12 pointer-events-auto overflow-x-auto max-w-full">
          {RESTAURANT_MENU.map((dish) => (
            <button
              key={dish.id}
              onClick={() => {
                soundManager.playSizzle();
                onSelectDish(dish);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentDish.id === dish.id
                  ? 'bg-white text-black shadow-md shadow-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{dish.emoji}</span>
              <span>{dish.name}</span>
              <span
                className={`text-[11px] ${
                  currentDish.id === dish.id ? 'text-neutral-800' : 'text-amber-400'
                }`}
              >
                {dish.currency}
                {dish.price}
              </span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
