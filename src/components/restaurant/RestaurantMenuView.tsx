"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShoppingBag,
  Camera,
  Info,
  Clock,
  Flame,
  Star,
  Plus,
  QrCode,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import {
  RESTAURANT_MENU,
  MENU_CATEGORIES,
  RESTAURANT_INFO,
  DishItem,
} from "../../data/restaurantMenu";
import { soundManager } from "../../lib/audio/soundManager";

interface RestaurantMenuViewProps {
  onSelectDishForAR: (dish: DishItem) => void;
  onOpenInfo: (dish: DishItem) => void;
  onAddToCart: (dish: DishItem) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onBackToQR: () => void;
}

export const RestaurantMenuView: React.FC<RestaurantMenuViewProps> = ({
  onSelectDishForAR,
  onOpenInfo,
  onAddToCart,
  cartCount,
  cartTotal,
  onOpenCart,
  onBackToQR,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredDishes =
    activeCategory === "all"
      ? RESTAURANT_MENU
      : RESTAURANT_MENU.filter((d) => d.category === activeCategory);

  const classicBurger = RESTAURANT_MENU.find((d) => d.id === "classic-burger")!;

  return (
    <div className="relative w-full min-h-screen bg-[#0c0a09] text-white p-4 sm:p-8 flex flex-col justify-between">
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] max-w-150 max-h-150 rounded-full bg-amber-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[45vw] h-[45vw] max-w-125 max-h-125 rounded-full bg-orange-700/10 blur-[130px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQR}
            className="p-2.5 rounded-full bg-white/6 hover:bg-white/12 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Scan QR Code"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white">
                {RESTAURANT_INFO.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {RESTAURANT_INFO.tableNumber}
              </span>
            </div>
            <p className="text-xs text-white/50">{RESTAURANT_INFO.tagline}</p>
          </div>
        </div>

        {/* Right Cart Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToQR}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/6 hover:bg-white/12 border border-white/10 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Table QR</span>
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {cartCount > 0
                ? `${cartCount} items • ${RESTAURANT_INFO.currencySymbol}${cartTotal}`
                : "Order Tray"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-6 space-y-8 flex-1">
        {/* Hero Spotlight: Classic Burger ₹249 */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-linear-to-r from-amber-950/60 via-neutral-900/80 to-neutral-950/90 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dinner&apos;s Choice • Signature Dish</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {classicBurger.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              {classicBurger.chefNotes}
            </p>

            <div className="flex items-center gap-4 text-xs text-white/60 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {classicBurger.prepTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {classicBurger.calories} kcal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {classicBurger.rating}
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
            <div className="text-3xl sm:text-4xl font-black text-amber-400">
              {RESTAURANT_INFO.currencySymbol}
              {classicBurger.price}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenInfo(classicBurger);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="View Macros & Ingredients"
              >
                <Info className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundManager.playSizzle();
                  onSelectDishForAR(classicBurger);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
              >
                <Camera className="w-4 h-4 text-black" />
                <span>View in Live Camera 📱</span>
                <ChevronRight className="w-4 h-4 text-black/70" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-white text-black shadow-md"
                  : "bg-white/6 hover:bg-white/12 text-white/70 hover:text-white border border-white/8"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="group relative p-5 rounded-3xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {dish.emoji}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-extrabold text-amber-400">
                      {dish.currency}
                      {dish.price}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/70 mt-1">
                      {dish.badge}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {dish.name}
                </h3>
                <p className="text-xs text-white/50 mb-3">{dish.subtitle}</p>

                {/* Quick Meta */}
                <div className="flex items-center gap-3 text-[11px] text-white/60 mb-5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {dish.prepTime}
                  </span>
                  <span>•</span>
                  <span>{dish.calories} kcal</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">★ {dish.rating}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/8">
                {/* View 3D AR */}
                <button
                  onClick={() => {
                    soundManager.playSizzle();
                    onSelectDishForAR(dish);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>3D AR 📱</span>
                </button>

                {/* Add to Order */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onAddToCart(dish);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    Add {dish.currency}
                    {dish.price}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-6 text-center text-xs text-white/40 border-t border-white/8">
        <span>
          Tap &ldquo;3D AR 📱&rdquo; on any dish to activate the Live Camera with Rotate,
          Pinch-Scale, and Move controls.
        </span>
      </footer>
    </div>
  );
};
