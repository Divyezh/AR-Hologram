'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode,
  Utensils,
  Camera,
  Sparkles,
  ChevronRight,
  ScanLine,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  RefreshCw,
  SwitchCamera,
  AlertCircle,
  X,
} from 'lucide-react';
import jsQR from 'jsqr';
import { RESTAURANT_MENU, RESTAURANT_INFO, DishItem } from '../../data/restaurantMenu';
import { soundManager } from '../../lib/audio/soundManager';

interface TableQRCodeScreenProps {
  onSelectDish: (dish: DishItem) => void;
  onEnterMenu: () => void;
}

export const TableQRCodeScreen: React.FC<TableQRCodeScreenProps> = ({
  onSelectDish,
  onEnterMenu,
}) => {
  // 'stand' = Table QR Code Stand, 'scanning' = Live camera viewfinder, 'list' = Select Dish List
  const [viewState, setViewState] = useState<'stand' | 'scanning' | 'list'>('stand');
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedFeedback, setScannedFeedback] = useState<string>('Table #04 Verified!');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Clean transition to list or dish on successful QR scan
  const handleSuccessfulScan = useCallback(
    (detectedText?: string) => {
      if (scannedSuccess) return;
      setScannedSuccess(true);
      soundManager.playOrderBell();

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (e) {}
      }

      if (detectedText) {
        setScannedFeedback(
          detectedText.length > 25 ? 'QR Code Verified!' : `QR: ${detectedText}`
        );
      }

      // Stop scanning loop immediately
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }

      // Check if detected code matches any dish ID
      const matchedDish = detectedText
        ? RESTAURANT_MENU.find(
            (d) =>
              d.id.toLowerCase() === detectedText.toLowerCase() ||
              detectedText.toLowerCase().includes(d.id.toLowerCase())
          )
        : undefined;

      setTimeout(() => {
        stopCamera();
        if (matchedDish) {
          onSelectDish(matchedDish);
        } else {
          setViewState('list');
        }
        setScannedSuccess(false);
      }, 700);
    },
    [scannedSuccess, stopCamera, onSelectDish]
  );

  // Direct instant scan (from QR stand button or manual confirm button)
  const triggerScan = () => {
    soundManager.playClick();
    handleSuccessfulScan('Table 04 Verified');
  };

  // Start webcam for real QR camera scanner without premature auto-closing
  const startCameraScanner = async (targetFacingMode?: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    setViewState('scanning');
    soundManager.playClick();

    const mode = targetFacingMode || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera scanner error:', err);
      // DO NOT auto-close! Give friendly user feedback and allow manual proceed
      setCameraError(
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? 'Camera access was blocked. Please grant camera permission in your browser settings, or tap below to proceed.'
          : 'Camera is currently unavailable on this device. You can tap below to proceed.'
      );
    }
  };

  const toggleFacingMode = () => {
    soundManager.playClick();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCameraScanner(nextMode);
  };

  // Continuous real-time frame scanning using jsQR & BarcodeDetector
  useEffect(() => {
    if (viewState !== 'scanning' || !cameraStream) return;

    let active = true;

    const scanFrame = async () => {
      if (!active) return;

      const video = videoRef.current;
      if (video && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          const targetW = Math.min(video.videoWidth, 640);
          const targetH = Math.round((targetW / video.videoWidth) * video.videoHeight);
          canvas.width = targetW;
          canvas.height = targetH;
          ctx.drawImage(video, 0, 0, targetW, targetH);

          let detectedText: string | null = null;

          // 1. Native hardware BarcodeDetector if supported
          if ('BarcodeDetector' in window) {
            try {
              const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(canvas);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                detectedText = barcodes[0].rawValue;
              }
            } catch (e) {
              // fallback to jsQR
            }
          }

          // 2. Pure JS jsQR library detection
          if (!detectedText) {
            try {
              const imgData = ctx.getImageData(0, 0, targetW, targetH);
              const code = jsQR(imgData.data, targetW, targetH, {
                inversionAttempts: 'dontInvert',
              });
              if (code && code.data) {
                detectedText = code.data;
              }
            } catch (e) {
              // ignore frame read error
            }
          }

          if (detectedText) {
            handleSuccessfulScan(detectedText);
            return;
          }
        }
      }

      if (active) {
        animFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [viewState, cameraStream, handleSuccessfulScan]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto bg-[#0a0806] text-white p-4 sm:p-8 flex flex-col justify-between select-none">
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] max-w-175 max-h-175 rounded-full bg-linear-to-br from-amber-600/20 via-orange-600/15 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[15%] w-[50vw] h-[50vw] max-w-150 max-h-150 rounded-full bg-linear-to-tl from-yellow-600/15 via-red-900/20 to-transparent blur-[130px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto pb-4">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/7 backdrop-blur-2xl border border-white/12 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold tracking-tight text-white/90">
            {RESTAURANT_INFO.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewState === 'list' && (
            <button
              onClick={() => setViewState('stand')}
              className="px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/14 border border-white/12 text-white/80 text-xs font-medium transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              <span>View QR Stand</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{RESTAURANT_INFO.tableNumber}</span>
          </div>
        </div>
      </header>

      {/* VIEW STATE 1: TABLE QR CODE STAND */}
      {viewState === 'stand' && (
        <main className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center py-6">
          <div className="relative w-full p-6 sm:p-8 rounded-[36px] bg-white/6 backdrop-blur-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col items-center">
            {/* Subtle inner light reflection */}
            <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/12 text-xs font-medium text-white/80 mb-5">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Tabletop AR Dining Stand</span>
            </div>

            {/* Interactive QR Code Button - CLICKABLE! */}
            <div
              onClick={triggerScan}
              className={`group relative w-56 h-56 p-4 rounded-3xl bg-neutral-900/90 border-2 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-103 ${
                scannedSuccess
                  ? 'border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.5)]'
                  : 'border-amber-400/50 hover:border-amber-400'
              }`}
            >
              {scannedSuccess ? (
                <div className="flex flex-col items-center gap-2 text-emerald-400 animate-in zoom-in-75 duration-200">
                  <CheckCircle2 className="w-16 h-16 animate-bounce" />
                  <span className="text-xs font-bold tracking-wider uppercase">QR Code Verified!</span>
                  <span className="text-[11px] text-white/70">Loading 3D Dish List...</span>
                </div>
              ) : (
                <>
                  {/* High Quality QR SVG */}
                  <svg
                    className="w-full h-full text-white/90"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <rect x="6" y="6" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="13" y="13" width="12" height="12" rx="2" fill="#f59e0b" />
                    <rect x="68" y="6" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="75" y="13" width="12" height="12" rx="2" fill="#f59e0b" />
                    <rect x="6" y="68" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="13" y="75" width="12" height="12" rx="2" fill="#f59e0b" />
                    <circle cx="50" cy="50" r="14" fill="#000000" stroke="#f59e0b" strokeWidth="2" />
                    <text x="50" y="55" fontSize="12" textAnchor="middle" fill="#ffffff">🍔</text>
                    <rect x="38" y="10" width="8" height="6" rx="1" />
                    <rect x="50" y="10" width="12" height="6" rx="1" />
                    <rect x="38" y="20" width="16" height="8" rx="1" />
                    <rect x="10" y="38" width="8" height="14" rx="1" />
                    <rect x="22" y="44" width="10" height="8" rx="1" />
                    <rect x="70" y="38" width="8" height="10" rx="1" />
                    <rect x="82" y="44" width="8" height="14" rx="1" />
                    <rect x="38" y="70" width="14" height="8" rx="1" />
                    <rect x="58" y="68" width="10" height="12" rx="1" />
                    <rect x="74" y="70" width="16" height="6" rx="1" />
                    <rect x="74" y="80" width="8" height="10" rx="1" />
                  </svg>

                  {/* Laser Scanning sweep */}
                  <div className="absolute inset-x-4 top-4 bottom-4 pointer-events-none overflow-hidden rounded-2xl">
                    <div
                      className="w-full h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_14px_#f59e0b] animate-bounce"
                      style={{ animationDuration: '2.2s' }}
                    />
                  </div>

                  {/* Tap prompt */}
                  <div className="absolute bottom-2.5 inset-x-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[11px] font-bold text-amber-300 shadow-md">
                    👆 Click to Scan QR Code
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-6 mb-1">
              Scan Table #04 QR
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mb-6">
              Click the QR code to open the item list and inspect any dish in 3D!
            </p>

            {/* Primary Action Button: Scan QR & Show List */}
            <button
              onClick={triggerScan}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer mb-3 active:scale-98"
            >
              <QrCode className="w-4 h-4 text-black" />
              <span>Scan QR ➔ Select Dish List</span>
              <ChevronRight className="w-4 h-4 text-black/70" />
            </button>

            {/* Camera Scanner Button */}
            <button
              onClick={() => startCameraScanner()}
              className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>📷 Scan with Phone Camera</span>
            </button>
          </div>
        </main>
      )}

      {/* VIEW STATE 2: LIVE CAMERA SCANNER VIEWFINDER */}
      {viewState === 'scanning' && (
        <main className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center py-4 px-2">
          <div className="relative w-full p-5 sm:p-7 rounded-[36px] bg-neutral-950/95 border border-white/20 shadow-2xl flex flex-col items-center">
            {/* Header row with Title and Close X */}
            <div className="w-full flex items-center justify-between mb-3">
              <div className="text-left">
                <h2 className="text-lg font-bold text-white leading-tight">Live QR Scanner</h2>
                <p className="text-xs text-white/60">Align Table #04 QR inside reticle</p>
              </div>

              <button
                onClick={() => {
                  stopCamera();
                  setViewState('stand');
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                title="Cancel Scan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner if camera access failed */}
            {cameraError ? (
              <div className="w-full p-4 mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                <p className="text-center">{cameraError}</p>
                <div className="flex gap-2 mt-2 w-full">
                  <button
                    onClick={() => startCameraScanner()}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={triggerScan}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    ⚡ Instant Proceed
                  </button>
                </div>
              </div>
            ) : (
              /* Camera Viewport */
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-black border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Target Reticle with 4 Corner Accents */}
                <div className="absolute inset-8 pointer-events-none flex items-center justify-center">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* Active Laser Scanning Sweep */}
                  <div
                    className="w-full h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce"
                    style={{ animationDuration: '1.6s' }}
                  />
                </div>

                {/* Top Overlay Pill: Searching status */}
                <div className="absolute top-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] text-white/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Scanning active... Point at QR</span>
                </div>

                {/* Bottom Overlay: Camera Switcher */}
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white/90 transition-all cursor-pointer shadow-lg"
                    title="Switch Front/Rear Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>

                {/* Success Animation Overlay */}
                {scannedSuccess && (
                  <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center text-emerald-400 animate-in zoom-in-95 duration-200">
                    <CheckCircle2 className="w-16 h-16 animate-bounce" />
                    <span className="text-sm font-extrabold mt-2 tracking-wide uppercase">
                      {scannedFeedback}
                    </span>
                    <span className="text-xs text-white/70 mt-0.5">Opening 3D Experience...</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Confirm Button */}
            <button
              onClick={triggerScan}
              className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
            >
              <span>⚡ Confirm Table #04 Scan</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setViewState('stand');
              }}
              className="mt-2 text-xs text-white/50 hover:text-white underline cursor-pointer"
            >
              Back to QR Stand
            </button>
          </div>
        </main>
      )}

      {/* VIEW STATE 3: SELECT DISH LIST (The exact requested feature!) */}
      {viewState === 'list' && (
        <main className="relative z-10 w-full max-w-3xl mx-auto my-4 flex flex-col items-center">
          {/* Header of the list */}
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>QR Scanned: Table 04</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Select Dish to View in 3D</h1>
              <p className="text-xs sm:text-sm text-white/60">
                Click any dish below to launch the live 3D camera experience!
              </p>
            </div>

            <button
              onClick={() => setViewState('stand')}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Rescan QR"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Dish Cards List - Every single item clickable to look in 3D! */}
          <div className="w-full space-y-3 pb-8">
            {RESTAURANT_MENU.map((dish) => (
              <div
                key={dish.id}
                onClick={() => {
                  soundManager.playSizzle();
                  onSelectDish(dish);
                }}
                className={`group relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer shadow-lg active:scale-99 ${
                  dish.id === 'classic-burger'
                    ? 'bg-linear-to-r from-amber-950/60 via-neutral-900/80 to-neutral-900/90 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/40'
                }`}
              >
                {/* Left: Emoji, Name, Subtitle */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-white/8 group-hover:bg-white/14 border border-white/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    {dish.emoji}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {dish.badge}
                      </span>
                      <span className="text-xs text-white/50">{dish.servingWeight}</span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {dish.name}
                    </h2>
                    <p className="text-xs text-white/50 line-clamp-1">{dish.subtitle}</p>

                    <div className="flex items-center gap-3 text-[11px] text-white/60 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {dish.prepTime}
                      </span>
                      <span>•</span>
                      <span>{dish.calories} kcal</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">★ {dish.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & "View in 3D 📱" Button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">
                    {dish.currency}
                    {dish.price}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playSizzle();
                      onSelectDish(dish);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4 text-black" />
                    <span>View in 3D 📱</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black/70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Footer Instructions */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto pt-4 text-center text-xs text-white/40 border-t border-white/8">
        <div className="flex items-center justify-center gap-2">
          <ScanLine className="w-3.5 h-3.5 text-amber-400" />
          <span>Flow: QR Code ➔ Select Dish from List ➔ Live 3D Camera with 👆 Rotate & 🤏 Scale</span>
        </div>
      </footer>
    </div>
  );
};
