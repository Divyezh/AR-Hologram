"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Camera,
  Sparkles,
  ChevronRight,
  ScanLine,
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  SwitchCamera,
  AlertCircle,
  X,
  Maximize2,
  Zap,
} from "lucide-react";
import { RESTAURANT_MENU, RESTAURANT_INFO, DishItem } from "../../data/restaurantMenu";
import { soundManager } from "../../lib/audio/soundManager";
import {
  generateQRCodeDataUrl,
  scanQRCodeFromVideo,
  matchDishFromScannedText,
} from "../../lib/qr/qrService";

interface TableQRCodeScreenProps {
  onSelectDish: (dish: DishItem) => void;
  onEnterMenu: () => void;
}

export const TableQRCodeScreen: React.FC<TableQRCodeScreenProps> = ({
  onSelectDish,
  onEnterMenu,
}) => {
  // 'stand' = Table QR Code Stand, 'scanning' = Live camera viewfinder, 'list' = Select Dish List
  const [viewState, setViewState] = useState<"stand" | "scanning" | "list">("stand");
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scannedFeedback, setScannedFeedback] = useState<string>("Table #04 Verified!");

  // Real QR Code generation state
  const [qrPreset, setQrPreset] = useState<"table" | "burger" | "pizza" | "sushi">("table");
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>("");
  const [isFullscreenQrOpen, setIsFullscreenQrOpen] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  // Generate real valid scannable QR Code on preset change
  useEffect(() => {
    let active = true;
    const generate = async () => {
      let qrText = "TABLE-04";
      if (qrPreset === "burger") qrText = "classic-burger";
      else if (qrPreset === "pizza") qrText = "margherita-pizza";
      else if (qrPreset === "sushi") qrText = "salmon-sushi";

      try {
        const dataUrl = await generateQRCodeDataUrl(qrText, {
          width: 600,
          margin: 3, // Quiet zone required for reliable scanner reading
          darkColor: "#000000",
          lightColor: "#ffffff",
        });
        if (active) {
          setGeneratedQrDataUrl(dataUrl);
        }
      } catch (e) {
        console.error("QR generation error:", e);
      }
    };

    generate();
    return () => {
      active = false;
    };
  }, [qrPreset]);

  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, [cameraStream]);

  // Clean transition to list or dish on successful QR scan
  const handleSuccessfulScan = useCallback(
    (detectedText?: string) => {
      if (scannedSuccess) return;
      setScannedSuccess(true);
      soundManager.playOrderBell();

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {}
      }

      // Check if detected code matches any dish ID
      const matchedDish = detectedText
        ? matchDishFromScannedText(detectedText, RESTAURANT_MENU)
        : undefined;

      if (matchedDish) {
        setScannedFeedback(`Found: ${matchedDish.name}!`);
      } else if (detectedText) {
        setScannedFeedback(detectedText.length > 25 ? "QR Code Verified!" : `QR: ${detectedText}`);
      }

      // Stop scanning loop immediately
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }

      setTimeout(() => {
        stopCamera();
        if (matchedDish) {
          onSelectDish(matchedDish);
        } else {
          setViewState("list");
        }
        setScannedSuccess(false);
      }, 700);
    },
    [scannedSuccess, stopCamera, onSelectDish]
  );

  // Direct instant scan (from QR stand button or manual confirm button)
  const triggerScan = () => {
    soundManager.playClick();
    if (qrPreset === "burger") {
      const burger = RESTAURANT_MENU.find((d) => d.id === "classic-burger");
      if (burger) {
        handleSuccessfulScan("classic-burger");
        return;
      }
    }
    handleSuccessfulScan("Table 04 Verified");
  };

  // Start webcam for real QR camera scanner without premature auto-closing
  const startCameraScanner = async (targetFacingMode?: "environment" | "user") => {
    stopCamera();
    setCameraError(null);
    setViewState("scanning");
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

      // Check torch support
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.() as
          (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        if (capabilities?.torch) {
          setHasTorch(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.warn("Camera scanner error:", err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setCameraError(
        errorObj.name === "NotAllowedError" || errorObj.name === "PermissionDeniedError"
          ? "Camera access was blocked. Please grant camera permission in your browser settings, or tap below to proceed."
          : "Camera is currently unavailable on this device. You can tap below to proceed."
      );
    }
  };

  const toggleTorch = async () => {
    if (!cameraStream) return;
    const track = cameraStream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        await (
          track as MediaStreamTrack & {
            applyConstraints: (c: MediaTrackConstraints) => Promise<void>;
          }
        ).applyConstraints({
          advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn("Torch failed:", e);
      }
    }
  };

  const toggleFacingMode = () => {
    soundManager.playClick();
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCameraScanner(nextMode);
  };

  // Continuous real-time frame scanning using dual-engine (BarcodeDetector + jsQR)
  useEffect(() => {
    if (viewState !== "scanning" || !cameraStream) return;

    let active = true;

    const scanFrame = async (timestamp: number) => {
      if (!active) return;

      // Throttle scanning to every 90ms so mobile CPU does not choke
      if (timestamp - lastScanTimestampRef.current >= 90) {
        lastScanTimestampRef.current = timestamp;

        const video = videoRef.current;
        if (video && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          try {
            const result = await scanQRCodeFromVideo(video, canvasRef.current, RESTAURANT_MENU);
            if (result && result.data && active) {
              handleSuccessfulScan(result.data);
              return;
            }
          } catch {
            // Ignore frame error and continue
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
          {viewState === "list" && (
            <button
              onClick={() => setViewState("stand")}
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
      {viewState === "stand" && (
        <main className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center py-6">
          <div className="relative w-full p-6 sm:p-8 rounded-[36px] bg-white/6 backdrop-blur-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col items-center">
            {/* Subtle inner light reflection */}
            <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/12 text-xs font-medium text-white/80 mb-4">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Real Scannable QR Code</span>
            </div>

            {/* Interactive Real QR Code Display Card */}
            <div className="relative flex flex-col items-center">
              {/* The Actual QR Code Card (High Contrast White Container) */}
              <div
                onClick={triggerScan}
                className={`group relative w-60 h-60 p-3 rounded-3xl bg-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:scale-102 ${
                  scannedSuccess
                    ? "ring-4 ring-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.6)]"
                    : "ring-2 ring-amber-400/40 hover:ring-amber-400"
                }`}
                title="Click to simulate scan or point another phone camera!"
              >
                {scannedSuccess ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-600 animate-in zoom-in-75 duration-200">
                    <CheckCircle2 className="w-16 h-16 animate-bounce" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      QR Code Verified!
                    </span>
                    <span className="text-[11px] text-neutral-600">Loading 3D Dish...</span>
                  </div>
                ) : (
                  <>
                    {/* Real Generated QR Image */}
                    {generatedQrDataUrl ? (
                      <img
                        src={generatedQrDataUrl}
                        alt="Scannable Dining Table QR Code"
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                        Generating QR...
                      </div>
                    )}

                    {/* Laser Scanning sweep */}
                    <div className="absolute inset-x-3 top-3 bottom-3 pointer-events-none overflow-hidden rounded-2xl">
                      <div
                        className="w-full h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_14px_#f59e0b] animate-bounce"
                        style={{ animationDuration: "2.2s" }}
                      />
                    </div>

                    {/* Tap prompt */}
                    <div className="absolute bottom-2 inset-x-3 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-bold text-amber-300 shadow-md">
                      👆 Tap here or scan with another phone
                    </div>
                  </>
                )}
              </div>

              {/* Quick Actions Bar below QR (Enlarge for other phone, Preset switcher) */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setIsFullscreenQrOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 text-xs text-white/90 font-medium transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span>Enlarge for Other Phone</span>
                </button>
              </div>

              {/* QR Content Preset Switcher */}
              <div className="flex items-center gap-1.5 mt-3 p-1 rounded-full bg-black/50 border border-white/10 text-[11px]">
                <button
                  onClick={() => setQrPreset("table")}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    qrPreset === "table"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Table #04
                </button>
                <button
                  onClick={() => setQrPreset("burger")}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    qrPreset === "burger"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  🍔 Burger ₹249
                </button>
                <button
                  onClick={() => setQrPreset("pizza")}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    qrPreset === "pizza"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  🍕 Pizza
                </button>
                <button
                  onClick={() => setQrPreset("sushi")}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    qrPreset === "sushi"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  🍣 Sushi
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-5 mb-1">
              Table #04 AR Dining
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mb-5 max-w-xs">
              Point your phone camera to scan the code, or tap below to open the dish list directly!
            </p>

            {/* Primary Action Button: Open Camera Scanner */}
            <button
              onClick={() => startCameraScanner()}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer mb-2.5 active:scale-98"
            >
              <Camera className="w-4 h-4 text-black" />
              <span>📷 Open Phone Camera Scanner</span>
              <ChevronRight className="w-4 h-4 text-black/70" />
            </button>

            {/* Secondary Action: Select Dish from List */}
            <button
              onClick={triggerScan}
              className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Proceed ➔ Dish List</span>
            </button>
          </div>
        </main>
      )}

      {/* VIEW STATE 2: LIVE CAMERA SCANNER VIEWFINDER */}
      {viewState === "scanning" && (
        <main className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center py-4 px-2">
          <div className="relative w-full p-5 sm:p-7 rounded-[36px] bg-neutral-950/95 border border-white/20 shadow-2xl flex flex-col items-center">
            {/* Header row with Title and Close X */}
            <div className="w-full flex items-center justify-between mb-3">
              <div className="text-left">
                <h2 className="text-lg font-bold text-white leading-tight">Live QR Scanner</h2>
                <p className="text-xs text-white/60">Align QR code inside reticle box</p>
              </div>

              <div className="flex items-center gap-1.5">
                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isTorchOn
                        ? "bg-amber-400 text-black border-amber-300"
                        : "bg-white/10 text-white/80 border-white/15"
                    }`}
                    title="Toggle Flashlight / Torch"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    stopCamera();
                    setViewState("stand");
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                  title="Cancel Scan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-amber-400 rounded-tl-xl shadow-[0_0_10px_#f59e0b]" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-amber-400 rounded-tr-xl shadow-[0_0_10px_#f59e0b]" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-amber-400 rounded-bl-xl shadow-[0_0_10px_#f59e0b]" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-amber-400 rounded-br-xl shadow-[0_0_10px_#f59e0b]" />

                  {/* Active Laser Scanning Sweep */}
                  <div
                    className="w-full h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_14px_#f59e0b] animate-bounce"
                    style={{ animationDuration: "1.6s" }}
                  />
                </div>

                {/* Top Overlay Pill: Searching status */}
                <div className="absolute top-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] text-white/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Scanning active... Point at QR code</span>
                </div>

                {/* Bottom Overlay: Camera Switcher */}
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white/90 transition-all cursor-pointer shadow-lg active:scale-95"
                    title="Switch Front/Rear Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>

                {/* Success Animation Overlay */}
                {scannedSuccess && (
                  <div className="absolute inset-0 bg-emerald-950/92 backdrop-blur-md flex flex-col items-center justify-center text-emerald-400 animate-in zoom-in-95 duration-200">
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
              <span>⚡ Confirm QR Scan Directly</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setViewState("stand");
              }}
              className="mt-2 text-xs text-white/50 hover:text-white underline cursor-pointer"
            >
              Back to QR Stand
            </button>
          </div>
        </main>
      )}

      {/* VIEW STATE 3: SELECT DISH LIST */}
      {viewState === "list" && (
        <main className="relative z-10 w-full max-w-3xl mx-auto my-4 flex flex-col items-center">
          {/* Header of the list */}
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>QR Verified: Table 04</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Select Dish to View in 3D
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Click any dish below to launch the live 3D AR camera experience!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEnterMenu}
                className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Browse Menu
              </button>
              <button
                onClick={() => setViewState("stand")}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Rescan QR"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dish Cards List - Every single item clickable to view in 3D */}
          <div className="w-full space-y-3 pb-8">
            {RESTAURANT_MENU.map((dish) => (
              <div
                key={dish.id}
                onClick={() => {
                  soundManager.playSizzle();
                  onSelectDish(dish);
                }}
                className={`group relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer shadow-lg active:scale-99 ${
                  dish.id === "classic-burger"
                    ? "bg-linear-to-r from-amber-950/60 via-neutral-900/80 to-neutral-900/90 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/40"
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

      {/* FULLSCREEN QR CODE MODAL (Perfect for displaying on a second phone or tablet!) */}
      {isFullscreenQrOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-white/20 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setIsFullscreenQrOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Display on Phone / Monitor</span>
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">
              {qrPreset === "burger"
                ? "Classic Burger (₹249)"
                : qrPreset === "pizza"
                  ? "Margherita Pizza"
                  : qrPreset === "sushi"
                    ? "Salmon Sushi"
                    : "Table #04 Dining Stand"}
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Hold another phone&apos;s camera up to this screen to scan!
            </p>

            {/* High-res White QR Box with Quiet Zone */}
            <div className="w-68 h-68 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              {generatedQrDataUrl && (
                <img
                  src={generatedQrDataUrl}
                  alt="High Resolution QR Code"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsFullscreenQrOpen(false);
                  triggerScan();
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                Simulate Scan Here
              </button>
              <button
                onClick={() => setIsFullscreenQrOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Instructions */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto pt-4 text-center text-xs text-white/40 border-t border-white/8">
        <div className="flex items-center justify-center gap-2">
          <ScanLine className="w-3.5 h-3.5 text-amber-400" />
          <span>Real QR Code ➔ Point camera or click to view dish in 3D on table surface</span>
        </div>
      </footer>
    </div>
  );
};
