'use client';

import React from 'react';
import { Camera, Scan, Navigation, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Camera className="w-6 h-6 text-emerald-400" />,
      title: 'Initialize Camera Feed',
      description: 'Your browser activates the front webcam with hardware aspect-ratio and zero server transmission.',
    },
    {
      num: '02',
      icon: <Scan className="w-6 h-6 text-cyan-400" />,
      title: 'MediaPipe Joint Tracking',
      description: 'The neural landmarker detects 21 anatomical landmarks on your hand at up to 60 frames per second.',
    },
    {
      num: '03',
      icon: <Navigation className="w-6 h-6 text-amber-400" />,
      title: 'Calculate 6-DOF Palm Anchor',
      description: 'The mathematical engine derives palm normal vectors, pitch, roll, yaw, scale, and screen coordinate mapping.',
    },
    {
      num: '04',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      title: 'Render WebGL Hologram',
      description: 'Three.js renders the rotating magic ring and animated character directly attached to your palm in 3D.',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400 mb-3">
            TECHNICAL PIPELINE
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How The Real-Time Pipeline Works
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-3xl bg-neutral-900/30 border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-2xl font-bold text-neutral-600">{s.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center">
                    {s.icon}
                  </div>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{s.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.description}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-0.5 bg-cyan-500/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
