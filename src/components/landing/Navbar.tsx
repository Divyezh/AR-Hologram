'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Menu, X } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-amber-400 flex items-center justify-center text-black font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link href="/effects" className="hover:text-cyan-400 transition-colors">
            VFX Rings
          </Link>
          <Link href="/characters" className="hover:text-cyan-400 transition-colors">
            3D Avatars
          </Link>
          <Link href="/about" className="hover:text-cyan-400 transition-colors">
            Architecture
          </Link>
        </nav>

        {/* Launch Studio CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-semibold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-200"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Launch Studio</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/95 border-b border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-neutral-300">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/effects" onClick={() => setMobileMenuOpen(false)}>
            VFX Rings
          </Link>
          <Link href="/characters" onClick={() => setMobileMenuOpen(false)}>
            3D Avatars
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
            Architecture
          </Link>
          <Link
            href="/studio"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-cyan-400 text-black font-semibold mt-2"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Studio</span>
          </Link>
        </div>
      )}
    </header>
  );
};
