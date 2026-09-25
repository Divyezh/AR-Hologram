# AR-Hologram

> **Real-Time Neural WebAR & Holographic VFX in the Browser**

AR-Hologram is a production-quality augmented reality web application. Using your device camera and computer vision, it automatically detects your palm in real-time, projects a glowing holographic magic ring onto your hand, and anchors animated 3D cyber companions that follow your hand's orientation and movement.

![AR Hologram Preview](public/images/preview.png)

---

## ✨ Features

- **Real-Time 21 Hand Landmarks**: Powered by Google MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`) using WebGL/GPU acceleration.
- **6-DOF Palm Anchor**: Calculates palm surface normal vectors, orientation quaternions, and pitch/roll/yaw derived from anatomical joints (Wrist, Index, Middle, Ring, Pinky MCPs).
- **Procedural VFX Magic Rings**:
  - Doctor Strange style Eldritch runes with rotating glyphs
  - High-voltage Cybernetic Halo with segmented circuit pulses
  - Cosmic Singularity with orbiting stardust
  - Solar Flare plasma loops with burning embers
- **3D Animated Characters**:
  - **Cyber Droid X-1**: Interactive robot with skeletal animations (Dance, Wave, Jump, Sit, Walk, Run).
  - **Spirit Fox**: Mystical canine with animated locomotion (Survey, Walk, Run).
  - **Astral Wyvern**: Procedural plasma dragon with real-time flapping wings and pulsing core.
  - **Quantum Obelisk**: Rotating sacred geometry crystal with counter-rotating rings.
- **Kinetic Gesture Recognition**: Interprets Open Palm, Closed Fist, Point, Peace, Pinch, and Thumbs Up to trigger effects and animations.
- **Dual-Exponential Smoothing**: Lerp and Quaternion Slerp algorithms eliminate tracking jitter while maintaining responsive hand following.
- **100% Client-Side Privacy**: Video stream is processed entirely within the local browser sandbox. No video frames are transmitted to remote servers.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **3D Graphics & Rendering**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Computer Vision**: [@mediapipe/tasks-vision](https://developers.google.com/mediapipe)
- **Styling**: Tailwind CSS & Glassmorphism UI
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- Webcam / Front-facing camera

### Installation

```bash
# Clone the repository
git clone https://github.com/Divyezh/AR-Hologram.git
cd AR-Hologram

# Install dependencies
npm install --legacy-peer-deps
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page or [http://localhost:3000/studio](http://localhost:3000/studio) to launch the AR Studio.

### Production Build

```bash
npm run build
npm run start
```

---

## 📐 Architecture

```
Camera Stream (navigator.mediaDevices)
       │
       ▼
MediaPipe Hand Landmarker (21 3D Joint Landmarks)
       │
       ▼
Palm Math & Orthonormal Basis (Normal vector, Center, Knuckle Span)
       │
       ▼
Viewport Mapping & CSS Cover Inversion
       │
       ▼
Dual-Exponential Smoothing (Lerp + Quaternion Slerp)
       │
       ▼
Three.js AR Overlay (Ref-based 60 FPS update loop)
       ├── Holographic Magic Ring VFX (GLSL Shaders + Particle Dust)
       └── 3D Rigged Characters (GLTF/GLB with AnimationMixer)
```

---

## 📄 License

MIT License. Open-source for personal and educational use.
