import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import Link from 'next/link';
import { Cpu, ShieldCheck, Compass, Eye, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Architecture & Computer Vision - AR Hologram Studio',
  description: 'Technical explanation of the MediaPipe, WebGL, and palm anchor coordinate mapping system.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Under The Hood</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Architecture & Vision Engineering
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            How AR Hologram Studio computes 6-DOF hand anchors, converts viewport coordinates, and renders high-framerate WebGL VFX in client-side browsers.
          </p>
        </div>

        <div className="space-y-10 text-neutral-300 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center gap-3 text-cyan-400 font-bold mb-3 text-lg">
              <Eye className="w-5 h-5" />
              <span>1. MediaPipe 21 Hand Landmarks</span>
            </div>
            <p className="mb-4 text-neutral-400">
              The camera feed is passed through Google MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`) using WebAssembly and WebGL GPU delegates. The network identifies 21 normalized 3D joint landmarks (wrist, knuckles, MCPs, PIPs, DIPs, and tips) on each frame with minimal latency.
            </p>
            <div className="bg-black/60 p-4 rounded-xl font-mono text-xs text-cyan-300/90 border border-white/5">
              Landmarks: Wrist (0), Thumb (1-4), Index (5-8), Middle (9-12), Ring (13-16), Pinky (17-20)
            </div>
          </div>

          {/* Section 2 */}
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center gap-3 text-amber-400 font-bold mb-3 text-lg">
              <Compass className="w-5 h-5" />
              <span>2. Palm Anchor & 6-DOF Orthonormal Basis</span>
            </div>
            <p className="mb-4 text-neutral-400">
              Rather than trusting a single landmark, the palm center is calculated as a barycentric average of five key joints: Wrist, Index MCP, Middle MCP, Ring MCP, and Pinky MCP.
            </p>
            <p className="mb-4 text-neutral-400">
              From the longitudinal vector (`Middle_MCP - Wrist`) and transversal vector (`Pinky_MCP - Index_MCP`), we take the vector cross product to generate the exact 3D palm surface normal vector. This basis is transformed into a Quaternion and Euler angles (Pitch, Roll, Yaw) in radians.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center gap-3 text-purple-400 font-bold mb-3 text-lg">
              <Cpu className="w-5 h-5" />
              <span>3. Viewport Mapping & CSS Cover Inversion</span>
            </div>
            <p className="mb-4 text-neutral-400">
              Webcam video elements often use `object-fit: cover` to fill mobile portrait or desktop landscape screens. Our coordinate engine accounts for horizontal or vertical crop ratios, screen aspect ratio, device pixel ratio, and horizontal mirror inversion, guaranteeing that 3D objects align to the physical palm down to the millimeter.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center gap-3 text-emerald-400 font-bold mb-3 text-lg">
              <ShieldCheck className="w-5 h-5" />
              <span>4. Dual-Exponential Smoothing & 60 FPS Performance</span>
            </div>
            <p className="mb-4 text-neutral-400">
              Raw neural coordinates inherently jitter. We apply adaptive Lerp (linear interpolation) for positions and Slerp (spherical linear interpolation) for quaternions. When sudden, rapid hand motions or occlusions occur, adaptive thresholds snap gracefully. Furthermore, tracking coordinate updates are stored in React refs, bypassing React render cycles to maintain rock-solid 60 FPS Three.js rendering.
            </p>
          </div>

          <div className="pt-6 text-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-linear-to-r from-cyan-500 to-teal-400 text-black font-bold text-base shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch AR Studio</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
