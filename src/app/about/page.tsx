"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/landing/Navbar";
import { Footer } from "../../components/landing/Footer";
import {
  Cpu,
  Compass,
  Eye,
  Sparkles,
  ArrowRight,
  Activity,
  CheckCircle2,
  ScanLine,
  Anchor,
} from "lucide-react";

export default function AboutPage() {
  // Selected hand joint in interactive diagram
  const [selectedJoint, setSelectedJoint] = useState<number | null>(null);
  // Active pipeline stage
  const [activeStage, setActiveStage] = useState<number>(1);

  const handJoints = [
    {
      id: 0,
      name: "Wrist",
      role: "Root Anchor Point",
      isAnchor: true,
      x: 180,
      y: 320,
      color: "#f59e0b",
    },
    {
      id: 1,
      name: "Thumb CMC",
      role: "Carpal Joint",
      isAnchor: false,
      x: 140,
      y: 280,
      color: "#fbbf24",
    },
    {
      id: 2,
      name: "Thumb MCP",
      role: "Metacarpal Joint",
      isAnchor: false,
      x: 105,
      y: 245,
      color: "#fbbf24",
    },
    {
      id: 3,
      name: "Thumb IP",
      role: "Phalangeal Joint",
      isAnchor: false,
      x: 80,
      y: 215,
      color: "#fbbf24",
    },
    {
      id: 4,
      name: "Thumb Tip",
      role: "Gesture Contact",
      isAnchor: false,
      x: 60,
      y: 190,
      color: "#f59e0b",
    },
    {
      id: 5,
      name: "Index MCP",
      role: "Palm Basis Orthonormal",
      isAnchor: true,
      x: 140,
      y: 180,
      color: "#ea580c",
    },
    {
      id: 6,
      name: "Index PIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 130,
      y: 130,
      color: "#fbbf24",
    },
    {
      id: 7,
      name: "Index DIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 125,
      y: 90,
      color: "#fbbf24",
    },
    {
      id: 8,
      name: "Index Tip",
      role: "Pinch Detector",
      isAnchor: false,
      x: 120,
      y: 55,
      color: "#f59e0b",
    },
    {
      id: 9,
      name: "Middle MCP",
      role: "Longitudinal Axis Root",
      isAnchor: true,
      x: 180,
      y: 170,
      color: "#ea580c",
    },
    {
      id: 10,
      name: "Middle PIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 180,
      y: 115,
      color: "#fbbf24",
    },
    {
      id: 11,
      name: "Middle DIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 180,
      y: 75,
      color: "#fbbf24",
    },
    {
      id: 12,
      name: "Middle Tip",
      role: "Aperture Pointer",
      isAnchor: false,
      x: 180,
      y: 40,
      color: "#f59e0b",
    },
    {
      id: 13,
      name: "Ring MCP",
      role: "Palm Basis Point",
      isAnchor: true,
      x: 220,
      y: 185,
      color: "#ea580c",
    },
    {
      id: 14,
      name: "Ring PIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 225,
      y: 130,
      color: "#fbbf24",
    },
    {
      id: 15,
      name: "Ring DIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 230,
      y: 90,
      color: "#fbbf24",
    },
    {
      id: 16,
      name: "Ring Tip",
      role: "Hand Boundary",
      isAnchor: false,
      x: 235,
      y: 60,
      color: "#f59e0b",
    },
    {
      id: 17,
      name: "Pinky MCP",
      role: "Transversal Axis Root",
      isAnchor: true,
      x: 255,
      y: 205,
      color: "#ea580c",
    },
    {
      id: 18,
      name: "Pinky PIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 270,
      y: 160,
      color: "#fbbf24",
    },
    {
      id: 19,
      name: "Pinky DIP",
      role: "Finger Joint",
      isAnchor: false,
      x: 280,
      y: 125,
      color: "#fbbf24",
    },
    {
      id: 20,
      name: "Pinky Tip",
      role: "Hand Boundary",
      isAnchor: false,
      x: 290,
      y: 95,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0c0402] text-white flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      {/* Atmospheric Ambient Lighting Layers (Harmonized with Rest of Website) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Warm Terracotta Ambient Core */}
        <div className="absolute top-[-10%] left-[20%] w-[65vw] h-[65vw] max-w-225 max-h-225 rounded-full bg-linear-to-br from-[#ea580c]/22 via-[#9a3412]/16 to-transparent blur-[140px]" />
        {/* Soft Golden Amber Mist */}
        <div className="absolute top-[35%] right-[-10%] w-[55vw] h-[55vw] max-w-200 max-h-200 rounded-full bg-linear-to-tl from-[#f59e0b]/18 via-[#78350f]/20 to-transparent blur-[140px]" />
        {/* Deep Burgundy Copper Grounding Glow */}
        <div className="absolute bottom-[-15%] left-[-5%] w-[60vw] h-[60vw] max-w-200 max-h-200 rounded-full bg-linear-to-tr from-[#c2410c]/16 via-[#451a03]/30 to-transparent blur-[150px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(rgba(245, 158, 11, 0.5) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pt-32 pb-24 w-full">
        {/* 1. HERO HEADER */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/7 backdrop-blur-2xl border border-white/12 text-xs font-semibold text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Neural Vision Architecture & WebGL Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-5 leading-[1.1]">
            Architecture & Vision{" "}
            <span className="bg-linear-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Engineering
            </span>
          </h1>

          <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            How AR Hologram Studio computes sub-millimeter 6-DOF hand anchors, stabilizes physical
            desk surface planes with device gyro, and renders real-time GPU shaders at 60 FPS in
            standard mobile browsers.
          </p>

          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[
              {
                label: "WebGL Framerate",
                val: "60 FPS",
                sub: "Triple-buffer VSync",
                color: "text-amber-400",
              },
              {
                label: "Neural Joint Landmarks",
                val: "21 Points",
                sub: "MediaPipe 3D graph",
                color: "text-orange-400",
              },
              {
                label: "Spatial Degree of Freedom",
                val: "6-DOF",
                sub: "Quaternion + Euler",
                color: "text-amber-300",
              },
              {
                label: "Client-Side Privacy",
                val: "100% Local",
                sub: "Zero server video lag",
                color: "text-emerald-400",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/6 backdrop-blur-3xl border border-white/12 text-left hover:border-amber-400/40 transition-colors shadow-lg"
              >
                <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.val}</div>
                <div className="text-xs font-bold text-white mt-1">{stat.label}</div>
                <div className="text-[10px] text-white/50">{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. INTERACTIVE PIPELINE FLOWCHART */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
                Execution Pipeline
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Full Frame-by-Frame Execution Flow
              </h2>
            </div>
            <span className="text-xs text-white/40 font-mono hidden sm:inline">
              16.6ms frame budget
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                step: 1,
                title: "Webcam Ingestion",
                tech: "MediaDevices API",
                desc: "1280x720 60 FPS stream, auto facing-mode, zero-copy texture upload.",
                tag: "Input",
              },
              {
                step: 2,
                title: "Neural Inference",
                tech: "MediaPipe Vision",
                desc: "WASM SIMD + WebGL GPU delegate extracts 21 3D joint landmark tensors.",
                tag: "ML",
              },
              {
                step: 3,
                title: "Orthonormal Basis",
                tech: "Vector Math Engine",
                desc: "Barycentric knuckle centroid & cross-product palm normal calculation.",
                tag: "Math",
              },
              {
                step: 4,
                title: "Desk & QR Anchor",
                tech: "Gyro Horizon + Vision",
                desc: "Pitch compensation stabilizes table plane; QR triggers 360° entrance.",
                tag: "Anchor",
              },
              {
                step: 5,
                title: "Shader Rendering",
                tech: "Three.js / WebGL",
                desc: "GLSL additive energy runes, lighting chandelier, and physics particle dust.",
                tag: "Render",
              },
            ].map((stage) => (
              <div
                key={stage.step}
                onClick={() => setActiveStage(stage.step)}
                className={`group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  activeStage === stage.step
                    ? "bg-linear-to-b from-amber-950/60 to-neutral-900/90 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                    : "bg-white/5 hover:bg-white/9 border-white/10 hover:border-amber-400/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        activeStage === stage.step
                          ? "bg-amber-400 text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      0{stage.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                      {stage.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {stage.title}
                  </h3>
                  <div className="text-[11px] font-mono text-amber-400/90 mb-2">{stage.tech}</div>
                  <p className="text-xs text-white/60 leading-relaxed">{stage.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                  <span>Latency</span>
                  <span className="font-mono text-amber-400">
                    {stage.step === 1
                      ? "1.2ms"
                      : stage.step === 2
                        ? "8.4ms"
                        : stage.step === 3
                          ? "0.4ms"
                          : stage.step === 4
                            ? "1.1ms"
                            : "4.8ms"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. INTERACTIVE HAND LANDMARK ANATOMY SCANNER & MATH */}
        <section className="mb-20">
          <div className="relative p-6 sm:p-10 rounded-[36px] bg-white/6 backdrop-blur-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Interactive Holographic Hand SVG Diagram */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Interactive 21-Joint Topology
                    </span>
                  </div>
                  <span className="text-[11px] text-white/50 font-mono">Hover or tap joints</span>
                </div>

                <div className="relative w-full max-w-sm aspect-3/4 rounded-3xl bg-black/60 border border-white/12 p-4 flex items-center justify-center overflow-hidden shadow-inner">
                  {/* Holographic Radar Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.4)_0%,transparent_70%)]" />

                  <svg viewBox="0 0 350 380" className="w-full h-full">
                    {/* Hand Bone Skeleton Connections */}
                    <g
                      stroke="#ffffff"
                      strokeOpacity="0.22"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      {/* Wrist to Knuckles */}
                      <line x1="180" y1="320" x2="140" y2="280" />
                      <line x1="180" y1="320" x2="140" y2="180" />
                      <line x1="180" y1="320" x2="180" y2="170" />
                      <line x1="180" y1="320" x2="220" y2="185" />
                      <line x1="180" y1="320" x2="255" y2="205" />

                      {/* Thumb */}
                      <line x1="140" y1="280" x2="105" y2="245" />
                      <line x1="105" y1="245" x2="80" y2="215" />
                      <line x1="80" y1="215" x2="60" y2="190" />

                      {/* Index Finger */}
                      <line x1="140" y1="180" x2="130" y2="130" />
                      <line x1="130" y1="130" x2="125" y2="90" />
                      <line x1="125" y1="90" x2="120" y2="55" />

                      {/* Middle Finger (Longitudinal axis) */}
                      <line
                        x1="180"
                        y1="170"
                        x2="180"
                        y2="115"
                        stroke="#f59e0b"
                        strokeOpacity="0.6"
                        strokeWidth="3"
                      />
                      <line x1="180" y1="115" x2="180" y2="75" />
                      <line x1="180" y1="75" x2="180" y2="40" />

                      {/* Ring Finger */}
                      <line x1="220" y1="185" x2="225" y2="130" />
                      <line x1="225" y1="130" x2="230" y2="90" />
                      <line x1="230" y1="90" x2="235" y2="60" />

                      {/* Pinky Finger */}
                      <line x1="255" y1="205" x2="270" y2="160" />
                      <line x1="270" y1="160" x2="280" y2="125" />
                      <line x1="280" y1="125" x2="290" y2="95" />

                      {/* Transversal palm knuckle line */}
                      <line
                        x1="140"
                        y1="180"
                        x2="255"
                        y2="205"
                        stroke="#ea580c"
                        strokeOpacity="0.75"
                        strokeWidth="3"
                        strokeDasharray="4 4"
                      />
                    </g>

                    {/* Central Barycentric Palm Anchor Disc */}
                    <circle
                      cx="185"
                      cy="225"
                      r="28"
                      fill="#f59e0b"
                      fillOpacity="0.15"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle cx="185" cy="225" r="6" fill="#f59e0b" className="animate-pulse" />
                    <text
                      x="185"
                      y="242"
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      PALM CENTROID
                    </text>

                    {/* 3D Normal Vector Projection Arrow */}
                    <line
                      x1="185"
                      y1="225"
                      x2="185"
                      y2="165"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      markerEnd="url(#arrow)"
                    />
                    <text x="200" y="195" fill="#f59e0b" fontSize="10" fontWeight="bold">
                      Normal Vector N⃗
                    </text>

                    {/* 21 Interactive Joint Nodes */}
                    {handJoints.map((j) => (
                      <g
                        key={j.id}
                        onMouseEnter={() => setSelectedJoint(j.id)}
                        onClick={() => setSelectedJoint(j.id)}
                        className="cursor-pointer transition-transform hover:scale-125"
                      >
                        <circle
                          cx={j.x}
                          cy={j.y}
                          r={selectedJoint === j.id ? 8 : j.isAnchor ? 6 : 4.5}
                          fill={selectedJoint === j.id ? "#ffffff" : j.color}
                          stroke="#000000"
                          strokeWidth="1.5"
                          className={selectedJoint === j.id ? "animate-ping" : ""}
                        />
                        <circle
                          cx={j.x}
                          cy={j.y}
                          r={selectedJoint === j.id ? 7 : j.isAnchor ? 5 : 3.5}
                          fill={selectedJoint === j.id ? "#ffffff" : j.color}
                        />
                        <text
                          x={j.x + 8}
                          y={j.y + 3}
                          fill={selectedJoint === j.id ? "#ffffff" : "#d1d5db"}
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {j.id}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Right Column: Joint Specs & 6-DOF Orthonormal Math */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Sub-Millimeter Coordinate Transform</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  6-DOF Orthonormal Palm Basis
                </h3>

                <p className="text-sm text-white/70 leading-relaxed font-light">
                  Single landmarks suffer from finger flexion noise. Our engine computes the true
                  palm center as a weighted barycentric average of 5 primary knuckle joints:
                </p>

                {/* Mathematical Formula Pill */}
                <div className="p-4 rounded-2xl bg-black/75 border border-white/12 font-mono text-xs text-amber-300 leading-relaxed">
                  <div className="text-white/40 mb-1">{"// Mathematical Formulation:"}</div>
                  <div>P_palm = ⅕ ∑ [Wrist + Index_MCP + Mid_MCP + Ring_MCP + Pinky_MCP]</div>
                  <div className="text-orange-300 mt-1">v_long = Middle_MCP - Wrist</div>
                  <div className="text-orange-300">v_trans = Pinky_MCP - Index_MCP</div>
                  <div className="text-amber-400 font-bold mt-1">
                    N⃗ = normalize( v_long × v_trans )
                  </div>
                </div>

                {/* Selected Joint Inspector Box */}
                {selectedJoint !== null ? (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-center justify-between animate-in fade-in duration-200">
                    <div>
                      <div className="font-bold text-white text-sm">
                        Landmark #{selectedJoint}: {handJoints[selectedJoint].name}
                      </div>
                      <div className="text-white/60 mt-0.5">{handJoints[selectedJoint].role}</div>
                    </div>
                    <div className="text-right font-mono text-amber-300">
                      <div>
                        Status:{" "}
                        {handJoints[selectedJoint].isAnchor ? "Anchor Joint 📌" : "Active Track ⚡"}
                      </div>
                      <div className="text-[10px] text-white/40">3D Tensor X/Y/Z</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 text-center">
                    💡 Hover over any joint in the diagram above to inspect its 3D landmark
                    assignment
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE 4 CORE TECHNICAL ADVANCEMENTS */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Deep Technical Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Core Innovation Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module 1: Desk Surface & Gyro Stabilization */}
            <div className="p-7 rounded-4xl bg-white/6 backdrop-blur-3xl border border-white/12 hover:border-amber-400/50 transition-all shadow-xl group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Anchor className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Spatial Grounding
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Desk Surface & Gyro Stabilization
                  </h3>
                </div>
              </div>
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                Without gyro compensation, moving the phone makes the 3D model fly across the
                screen. Our system captures phone pitch (β) and roll (γ) from the
                DeviceOrientationEvent, calculates the physical table horizon, and offsets the plate
                in camera view coordinates so the dish remains securely pinned to the physical desk
                surface plane.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero model flying • Natural table plane perspective</span>
              </div>
            </div>

            {/* Module 2: Dual-Engine Real QR Scanner */}
            <div className="p-7 rounded-4xl bg-white/6 backdrop-blur-3xl border border-white/12 hover:border-orange-400/50 transition-all shadow-xl group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ScanLine className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-orange-400 font-bold">
                    Vision Decoding
                  </span>
                  <h3 className="text-xl font-bold text-white">Dual-Engine Real QR Scanner</h3>
                </div>
              </div>
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                Designed to scan directly from other phone screens, monitors, or paper cards.
                Features native hardware BarcodeDetector on Chromium/Android, paired with a jsQR
                canvas engine running dual-inversion (attemptBoth) and center-reticle
                region-of-interest cropping to pierce through screen glare, reflections, and moiré
                lines.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-orange-300 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Real standard QR generation • Throttled 90ms loop</span>
              </div>
            </div>

            {/* Module 3: 360° Turning Entrance Animation */}
            <div className="p-7 rounded-4xl bg-white/6 backdrop-blur-3xl border border-white/12 hover:border-amber-400/50 transition-all shadow-xl group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Kinetic Choreography
                  </span>
                  <h3 className="text-xl font-bold text-white">360° Turning Entrance Animation</h3>
                </div>
              </div>
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                When a QR code is locked or the user taps the table surface, the food model appears
                with an elastic 720° double-revolution ease-out back animation. A glowing
                holographic table coaster expands under the plate, emitting synchronized order bell
                chimes, gourmet sizzles, and contact shadows.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Decelerating 720° spin • Elastic table settle</span>
              </div>
            </div>

            {/* Module 4: Viewport Cover Inversion & Adaptive Slerp */}
            <div className="p-7 rounded-4xl bg-white/6 backdrop-blur-3xl border border-white/12 hover:border-amber-400/50 transition-all shadow-xl group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Jitter Suppression
                  </span>
                  <h3 className="text-xl font-bold text-white">Adaptive Lerp / Slerp Smoothing</h3>
                </div>
              </div>
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                Raw landmark coordinates contain high-frequency sensor jitter. We apply
                velocity-adaptive spherical linear interpolation (Slerp) to quaternions and
                dual-exponential Lerp to positional coordinates. Rapid hand flings snap without lag,
                while stationary poses remain silky smooth.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero jitter • Ref-based decoupling from React state</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Launch AR Hologram Studio */}
          <div className="relative p-8 rounded-[36px] bg-white/6 backdrop-blur-3xl border border-white/15 flex flex-col justify-between shadow-2xl group overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hand Hologram Mode</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Doctor Strange & Naruto AR
              </h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-6 font-light">
                Cast authentic Tao Mandalas, Rasengan chakra spheres, or animate 3D companion droids
                hovering over your live palm.
              </p>
            </div>

            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-sm shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <span>Launch AR Studio</span>
              <ArrowRight className="w-4 h-4 text-neutral-600" />
            </Link>
          </div>

          {/* Card 2: Launch AR Dining Restaurant Experience */}
          <div className="relative p-8 rounded-[36px] bg-white/6 backdrop-blur-3xl border border-amber-500/30 flex flex-col justify-between shadow-2xl group overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 text-xs font-bold mb-4">
                <span>🍽️</span>
                <span>Tabletop AR Dining</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Gourmet 3D Dining (₹249)
              </h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-6 font-light">
                Scan real table QR codes, inspect photorealistic dishes anchored to your physical
                dining desk, and rotate portions in 3D.
              </p>
            </div>

            <Link
              href="/restaurant"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-[0_10px_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-95"
            >
              <span>Launch AR Restaurant</span>
              <ArrowRight className="w-4 h-4 text-black/70" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
