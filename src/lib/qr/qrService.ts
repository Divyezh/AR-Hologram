import QRCode from "qrcode";
import jsQR from "jsqr";
import { DishItem } from "../../data/restaurantMenu";

export interface ScannedQRResult {
  data: string;
  // Normalized 0..1 coordinates in video frame
  center?: { x: number; y: number };
  corners?: { x: number; y: number }[];
  matchedDish?: DishItem;
}

interface BarcodeDetectionResult {
  rawValue?: string;
  cornerPoints?: Array<{ x: number; y: number }>;
}

interface WebBarcodeDetector {
  new (options?: { formats: string[] }): {
    detect: (
      source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap
    ) => Promise<BarcodeDetectionResult[]>;
  };
}

/**
 * Generate a real, 100% valid standard QR code as a PNG data URL.
 * Any physical camera, phone screen, Google Lens, or jsQR can scan this.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 512,
      margin: options?.margin !== undefined ? options?.margin : 3, // Crucial quiet zone
      errorCorrectionLevel: "M",
      color: {
        dark: options?.darkColor || "#000000",
        light: options?.lightColor || "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    throw err;
  }
}

/**
 * Scan video frame for QR codes using native BarcodeDetector or jsQR.
 * Handles phone screens, glare, dark mode displays, and varying distances.
 */
export async function scanQRCodeFromVideo(
  video: HTMLVideoElement,
  scratchCanvas?: HTMLCanvasElement | null,
  menu?: DishItem[]
): Promise<ScannedQRResult | null> {
  if (!video || video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
    return null;
  }

  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;

  // 1. Hardware BarcodeDetector if available (Chromium / Android Chrome)
  const BarcodeDetectorClass =
    typeof window !== "undefined"
      ? (window as unknown as { BarcodeDetector?: WebBarcodeDetector }).BarcodeDetector
      : undefined;

  if (BarcodeDetectorClass) {
    try {
      const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });
      // Detect directly on video element for GPU-accelerated frame analysis
      const barcodes = await detector.detect(video);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        const raw = barcodes[0].rawValue.trim();
        const cornerPoints = barcodes[0].cornerPoints;
        let center: { x: number; y: number } | undefined;

        if (cornerPoints && cornerPoints.length === 4) {
          const avgX = cornerPoints.reduce((acc: number, p) => acc + p.x, 0) / 4;
          const avgY = cornerPoints.reduce((acc: number, p) => acc + p.y, 0) / 4;
          center = { x: avgX / vWidth, y: avgY / vHeight };
        }

        const matchedDish = menu ? matchDishFromScannedText(raw, menu) : undefined;
        return {
          data: raw,
          center,
          matchedDish,
        };
      }
    } catch {
      // Fallback to jsQR canvas processing
    }
  }

  // 2. jsQR Canvas fallback
  const canvas = scratchCanvas || document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  // First check: Center square ROI (Viewfinder area where user aims)
  // When scanning another phone, screen bezels & glare surround the center.
  // Sampling center at high resolution yields maximum contrast!
  const boxSize = Math.round(Math.min(vWidth, vHeight) * 0.7);
  const startX = Math.round((vWidth - boxSize) / 2);
  const startY = Math.round((vHeight - boxSize) / 2);

  canvas.width = boxSize;
  canvas.height = boxSize;
  ctx.drawImage(video, startX, startY, boxSize, boxSize, 0, 0, boxSize, boxSize);

  try {
    const imgData = ctx.getImageData(0, 0, boxSize, boxSize);
    const code = jsQR(imgData.data, boxSize, boxSize, {
      inversionAttempts: "attemptBoth", // CRITICAL for inverted / dark mode / phone screens!
    });

    if (code && code.data) {
      const raw = code.data.trim();
      const loc = code.location;
      const centerBoxX =
        (loc.topLeftCorner.x +
          loc.topRightCorner.x +
          loc.bottomLeftCorner.x +
          loc.bottomRightCorner.x) /
        4;
      const centerBoxY =
        (loc.topLeftCorner.y +
          loc.topRightCorner.y +
          loc.bottomLeftCorner.y +
          loc.bottomRightCorner.y) /
        4;

      const realX = (startX + centerBoxX) / vWidth;
      const realY = (startY + centerBoxY) / vHeight;

      const matchedDish = menu ? matchDishFromScannedText(raw, menu) : undefined;
      return {
        data: raw,
        center: { x: realX, y: realY },
        matchedDish,
      };
    }
  } catch {
    // Ignore frame read error
  }

  // Second check: Full frame downsampled to ~640px for wide or off-center QR codes
  const targetW = Math.min(vWidth, 640);
  const targetH = Math.round((targetW / vWidth) * vHeight);
  canvas.width = targetW;
  canvas.height = targetH;
  ctx.drawImage(video, 0, 0, targetW, targetH);

  try {
    const fullImgData = ctx.getImageData(0, 0, targetW, targetH);
    const fullCode = jsQR(fullImgData.data, targetW, targetH, {
      inversionAttempts: "attemptBoth",
    });

    if (fullCode && fullCode.data) {
      const raw = fullCode.data.trim();
      const loc = fullCode.location;
      const avgX =
        (loc.topLeftCorner.x +
          loc.topRightCorner.x +
          loc.bottomLeftCorner.x +
          loc.bottomRightCorner.x) /
        4;
      const avgY =
        (loc.topLeftCorner.y +
          loc.topRightCorner.y +
          loc.bottomLeftCorner.y +
          loc.bottomRightCorner.y) /
        4;

      const matchedDish = menu ? matchDishFromScannedText(raw, menu) : undefined;
      return {
        data: raw,
        center: { x: avgX / targetW, y: avgY / targetH },
        matchedDish,
      };
    }
  } catch {
    // Ignore frame read error
  }

  return null;
}

/**
 * Intelligent dish matcher for scanned QR text.
 * Matches:
 * - Exact dish ID (e.g., 'classic-burger')
 * - URL query parameter (e.g., 'https://.../restaurant?dish=classic-burger')
 * - Text containing dish keyword (e.g., 'burger', 'pizza', 'sushi', 'truffle', 'mojito')
 */
export function matchDishFromScannedText(text: string, menu: DishItem[]): DishItem | undefined {
  if (!text) return undefined;
  const clean = text.toLowerCase().trim();

  // 1. Direct ID match
  const exact = menu.find((d) => d.id.toLowerCase() === clean);
  if (exact) return exact;

  // 2. URL parameter match
  try {
    if (clean.includes("dish=")) {
      const urlPart = clean.split("dish=")[1]?.split("&")[0];
      if (urlPart) {
        const urlMatch = menu.find((d) => d.id.toLowerCase() === urlPart.toLowerCase());
        if (urlMatch) return urlMatch;
      }
    }
  } catch {}

  // 3. Substring ID match
  const subMatch = menu.find((d) => clean.includes(d.id.toLowerCase()));
  if (subMatch) return subMatch;

  // 4. Keyword match based on dish names
  const keywordMatch = menu.find((d) => {
    const words = d.name.toLowerCase().split(" ");
    return words.some((w) => w.length > 3 && clean.includes(w));
  });
  if (keywordMatch) return keywordMatch;

  return undefined;
}
