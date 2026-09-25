import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { EFFECTS } from '../../data/effects';
import Link from 'next/link';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';

export const metadata = {
  title: 'VFX Magic Rings - AR Hologram Studio',
  description: 'Explore the holographic shaders, runes, gyroscopic rings, and particle fields.',
};

export default function EffectsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-4">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Procedural GPU Shaders</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Holographic Magic Rings
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Each magic ring is generated dynamically in Three.js using custom GLSL shaders, procedural rune mathematics, contra-rotating gyroscopic rings, and particle dust fields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {EFFECTS.map((effect) => (
            <div
              key={effect.id}
              className="p-8 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase font-mono tracking-wider text-neutral-500 font-bold">
                    {effect.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: effect.primaryColor }}
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: effect.secondaryColor }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{effect.name}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">{effect.description}</p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-black/50 p-4 rounded-2xl border border-white/5 font-mono mb-6">
                  <div>
                    <span className="text-neutral-500 block">Radius</span>
                    <span className="text-white font-semibold">{effect.ringRadius}m</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Particles</span>
                    <span className="text-white font-semibold">{effect.particleCount} units</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Effect Type</span>
                    <span className="text-amber-400 uppercase font-semibold">{effect.type}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Pulse Speed</span>
                    <span className="text-cyan-400 font-semibold">{effect.pulseSpeed} Hz</span>
                  </div>
                </div>
              </div>

              <Link
                href="/studio"
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs border border-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test in Live AR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
