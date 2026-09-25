import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { CHARACTERS } from '../../data/characters';
import Link from 'next/link';
import { Bot, Sparkles, ArrowRight, Play } from 'lucide-react';

export const metadata = {
  title: '3D Characters - AR Hologram Studio',
  description: 'Interactive animated 3D GLB characters anchored to your palm in augmented reality.',
};

export default function CharactersPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4">
            <Bot className="w-3.5 h-3.5" />
            <span>GLTF / GLB Rigged Models</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Holographic Companions
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Select an animated character to stand or sit upon the holographic magic ring. Characters inherit your palm&apos;s real-time position and orientation with smooth kinematic interpolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="p-8 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-bold">
                    {char.category}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    {char.type === 'glb' ? 'GLB Model' : 'Procedural Mesh'}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{char.name}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">{char.description}</p>

                <div className="mb-6">
                  <span className="text-xs text-neutral-500 block mb-2 font-medium">Available Actions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {char.availableAnimations.map((anim) => (
                      <span
                        key={anim}
                        className="px-2.5 py-1 rounded-full bg-black/60 border border-white/5 text-[11px] text-neutral-300 flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5 text-cyan-400" />
                        {anim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/studio"
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs border border-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Summon in AR Studio</span>
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
