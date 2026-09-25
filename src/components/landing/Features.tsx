'use client';

import React from 'react';
import { Compass, Sparkles, Layers, Box, Cpu, Smartphone } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Compass className="w-6 h-6 text-cyan-400" />,
      title: 'Full 6-DOF Palm Anchor',
      description:
        'Calculates real-time 3D position, normal surface vector, and quaternion rotation across wrist and knuckle joints.',
    },
    {
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      title: 'Doctor Strange Style Rings',
      description:
        'Multi-layer concentric gyroscopic rings, inscribed ancient runes, and pulsing energy shaders rendered on GPU.',
    },
    {
      icon: <Box className="w-6 h-6 text-purple-400" />,
      title: 'Animated 3D Characters',
      description:
        'GLB character models and procedural holograms with real-time skeletal animations (Dance, Jump, Wave, Walk).',
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: 'Adaptive Smoothing Math',
      description:
        'Dual exponential lerp and quaternion slerp suppress tracking jitters while preserving high-speed hand responsiveness.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-400" />,
      title: 'Kinetic Gesture Engine',
      description:
        'Interprets open palm, fist, peace, pinch, and point gestures to trigger powers, animations, and holographic scale.',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-400" />,
      title: 'Mobile-Optimized Experience',
      description:
        'Responsive viewport calculations adjust coordinate mapping across mobile portrait and desktop landscape.',
    },
  ];

  return (
    <section className="py-20 bg-neutral-950/40 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400 mb-3">
            ENGINEERING EXCELLENCE
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered For Pure Real-Time Immersion
          </h3>
          <p className="text-neutral-400 mt-4 text-sm sm:text-base">
            No mouse simulation. No predetermined paths. A true computer-vision pipeline running directly in client-side WebGL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-cyan-500/40 hover:bg-neutral-900/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300">
                {f.icon}
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{f.title}</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
