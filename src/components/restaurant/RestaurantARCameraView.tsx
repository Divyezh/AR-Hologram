"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  Info,
  SwitchCamera,
  Camera,
  ZoomIn,
  ZoomOut,
  QrCode,
  Anchor,
  Compass,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { InteractiveFoodScene } from "./InteractiveFoodScene";
import { DishItem, RESTAURANT_MENU, RESTAURANT_INFO } from "../../data/restaurantMenu";
import { useCamera } from "../../hooks/useCamera";
import { soundManager } from "../../lib/audio/soundManager";
import { scanQRCodeFromVideo } from "../../lib/qr/qrService";

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
  } = useCamera();

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [resetPulse, setResetPulse] = useState<boolean>(false);

  // Desk Surface Anchor & Gyro Stabilization state
  const [isDeskAnchored, setIsDeskAnchored] = useState<boolean>(true);
  const [triggerTurningAnimToken, setTriggerTurningAnimToken] = useState<number>(1);
  const [qrAnchorPos, setQrAnchorPos] = useState<{ x: number; y: number } | null>(null);
  const [qrToastMessage, setQrToastMessage] = useState<string | null>(null);
  const [isQrScannerActive, setIsQrScannerActive] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically start camera on mount for live dining AR experience
  useEffect(() => {
    startCamera("environment").catch(() => {
      // If environment camera fails, fallback to user camera
      startCamera("user").catch(() => {});
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

  // Trigger initial turning animation on mount
  useEffect(() => {
    soundManager.playOrderBell();
    soundManager.playSizzle();
    setTriggerTurningAnimToken((t) => t + 1);
  }, []);

  // Background Live QR Code Detection in AR Camera View
  // If the user points camera at any QR code on desk or phone screen:
  // Anchors dish to that position and plays the 360° turning entrance animation!
  useEffect(() => {
    if (!isQrScannerActive || !stream) return;

    let active = true;

    const checkQrFrame = async (timestamp: number) => {
      if (!active) return;

      // Scan every 140ms so video & 3D canvas stay 60 FPS smooth
      if (timestamp - lastScanTimeRef.current >= 140) {
        lastScanTimeRef.current = timestamp;

        const video = videoRef.current;
        if (video && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          try {
            const result = await scanQRCodeFromVideo(video, qrCanvasRef.current, RESTAURANT_MENU);
            if (result && result.data && active) {
              // We found a QR code on the desk or phone screen!
              soundManager.playOrderBell();
              soundManager.playSizzle();

              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate([80, 40, 80]);
                } catch {}
              }

              // Update QR anchor position
              if (result.center) {
                setQrAnchorPos(result.center);
              }

              // Trigger 360° Turning Entrance Animation!
              setTriggerTurningAnimToken((prev) => prev + 1);

              // If a specific dish was encoded in the QR code, switch to it!
              if (result.matchedDish && result.matchedDish.id !== currentDish.id) {
                onSelectDish(result.matchedDish);
                setQrToastMessage(`🎯 QR Scanned: ${result.matchedDish.name} summoned on desk!`);
              } else {
                setQrToastMessage("🎯 QR Detected on Desk! Dish locked & summoned");
              }

              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = setTimeout(() => {
                setQrToastMessage(null);
              }, 3500);

              // Pause scanner briefly so it doesn't repeatedly trigger every 140ms
              lastScanTimeRef.current = timestamp + 2500;
            }
          } catch {}
        }
      }

      if (active) {
        animFrameIdRef.current = requestAnimationFrame(checkQrFrame);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(checkQrFrame);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isQrScannerActive, stream, currentDish.id, onSelectDish]);

  const handleReset = () => {
    soundManager.playReset();
    setScale(1.0);
    setQrAnchorPos(null);
    setResetPulse(true);
    setTriggerTurningAnimToken((t) => t + 1);
    setTimeout(() => setResetPulse(false), 500);
  };

  const handleManualSummon = () => {
    soundManager.playOrderBell();
    soundManager.playSizzle();
    setTriggerTurningAnimToken((t) => t + 1);
  };

  const isCameraLive = cameraStatus === "active";

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
              isMirrored ? "scale-x-[-1]" : ""
            }`}
          />
        ) : (
          /* Ambient Restaurant Table Backdrop if camera is inactive/blocked */
          <div className="w-full h-full bg-[#120d0a] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#2a170e]/80 via-[#140b07] to-black" />
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: "radial-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {cameraStatus === "requesting"
                  ? "Requesting camera access..."
                  : "Desk Surface AR Mode Active"}
              </span>
            </div>
          </div>
        )}

        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_35%,rgba(0,0,0,0.55)_100%] pointer-events-none" />
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
          isDeskAnchored={isDeskAnchored}
          onToggleDeskAnchor={() => setIsDeskAnchored(!isDeskAnchored)}
          triggerTurningAnimToken={triggerTurningAnimToken}
          qrAnchorPos={qrAnchorPos}
          onTapSurface={() => {
            // Replay gentle turning effect when placing dish on new spot
            soundManager.playSizzle();
          }}
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

          {/* Desk Surface Anchor Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsDeskAnchored(!isDeskAnchored);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border text-xs font-semibold shadow-lg transition-all cursor-pointer ${
              isDeskAnchored
                ? "bg-amber-500/25 border-amber-400/50 text-amber-300"
                : "bg-black/50 border-white/15 text-white/60"
            }`}
            title="Desk Surface Stabilization: keeps plate resting flat on table"
          >
            <Anchor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desk Surface:</span>
            <span>{isDeskAnchored ? "Grounded 📌" : "Free 🪶"}</span>
          </button>
        </div>

        {/* Center: AR Desk Guidance Pill */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/15 text-[11px] text-white/90 font-medium pointer-events-auto shadow-xl">
          <span className="flex items-center gap-1 text-amber-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Point at desk surface</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="text-cyan-300">👆 Tap table to place</span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-300">📷 Point at QR to summon</span>
        </div>

        {/* Right: Camera Switch, Summon Spin, and Cart Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Flip Front/Back Camera */}
          <button
            onClick={toggleFacingMode}
            title="Switch Camera (Front / Back)"
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>

          {/* 360° Turning Entrance Animation Summon Button */}
          <button
            onClick={handleManualSummon}
            title="Trigger 360° Turning Animation on Desk"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/35 backdrop-blur-xl border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <Sparkles
              className="w-3.5 h-3.5 text-amber-300 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <span className="hidden sm:inline">Spin Entrance</span>
          </button>

          {/* Quick Reset Button */}
          <button
            onClick={handleReset}
            title="Double-Tap anywhere or click to reset view"
            className={`p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-all cursor-pointer ${
              resetPulse ? "scale-125 border-amber-400 text-amber-400" : ""
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Cart Tray */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{cartCount > 0 ? `${cartCount} • ₹${cartTotal}` : "Tray"}</span>
          </button>
        </div>
      </header>

      {/* 4. Live Scanned QR Notification Banner / Toast */}
      {qrToastMessage && (
        <div className="absolute top-18 inset-x-4 z-30 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/90 backdrop-blur-2xl border border-emerald-400/50 text-emerald-200 text-xs font-bold shadow-[0_10px_30px_rgba(16,185,129,0.35)] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>{qrToastMessage}</span>
          </div>
        </div>
      )}

      {/* 5. Floating On-Screen Zoom Controls (+ / - / % indicator) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
          }}
          title="Zoom In (+)"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={handleReset}
          title="Tap to Reset Zoom to 100%"
          className="px-1 py-1 text-[10px] font-mono font-bold text-amber-300 hover:text-white transition-colors cursor-pointer"
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setScale((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)));
          }}
          title="Zoom Out (-)"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* 6. Bottom Main Dish Card & Switcher */}
      <footer className="absolute bottom-4 inset-x-4 z-20 flex flex-col items-center gap-2.5 pointer-events-none">
        {/* Mobile Instructions Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-[10px] text-white/90 font-medium pointer-events-auto shadow-lg">
          <span className="text-amber-400">📐 Point camera at desk</span>
          <span>•</span>
          <span>👆 Tap table to place</span>
          <span>•</span>
          <span>📷 Point at QR</span>
        </div>

        {/* Featured Live Dish Action Card */}
        <div className="w-full max-w-xl p-4 sm:p-5 rounded-[28px] bg-neutral-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Dish Details */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
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
                <span className="text-[11px] text-white/50">
                  {Math.round(scale * 100)}% portion
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                {currentDish.name}
              </h2>

              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                {currentDish.currency}
                {currentDish.price}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onTapInfo(currentDish)}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/18 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Tap for Nutrition Info"
            >
              <Info className="w-4 h-4" />
            </button>

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
                soundManager.playOrderBell();
                onSelectDish(dish);
                setTriggerTurningAnimToken((t) => t + 1);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentDish.id === dish.id
                  ? "bg-white text-black shadow-md shadow-white/20"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{dish.emoji}</span>
              <span>{dish.name}</span>
              <span
                className={`text-[11px] ${
                  currentDish.id === dish.id ? "text-neutral-800" : "text-amber-400"
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
