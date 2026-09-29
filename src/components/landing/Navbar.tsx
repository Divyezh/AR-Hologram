"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Camera, Menu, X } from "lucide-react";
import { APP_CONFIG } from "../../config/app.config";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0402]/80 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">{APP_CONFIG.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/70">
          <Link href="/" className="hover:text-amber-300 transition-colors">
            Home
          </Link>
          <Link
            href="/restaurant"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all"
          >
            <span>🍽️</span>
            <span>AR Dining</span>
          </Link>
          <Link href="/effects" className="hover:text-amber-300 transition-colors">
            VFX Rings
          </Link>
          <Link href="/characters" className="hover:text-amber-300 transition-colors">
            3D Avatars
          </Link>
          <Link href="/about" className="hover:text-amber-300 transition-colors">
            Architecture
          </Link>
        </nav>

        {/* Launch Studio CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-200 active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-neutral-900" />
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
        <div className="md:hidden bg-[#0c0402]/95 border-b border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-neutral-300">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-300">
            Home
          </Link>
          <Link
            href="/restaurant"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-amber-300 font-semibold"
          >
            <span>🍽️</span>
            <span>AR Dining Experience</span>
          </Link>
          <Link
            href="/effects"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-amber-300"
          >
            VFX Rings
          </Link>
          <Link
            href="/characters"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-amber-300"
          >
            3D Avatars
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-amber-300"
          >
            Architecture
          </Link>
          <Link
            href="/studio"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-amber-500 text-black font-extrabold mt-2 shadow-lg shadow-amber-500/25"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Studio</span>
          </Link>
        </div>
      )}
    </header>
  );
};
