"use client";

import React from "react";
import { X, Flame, ShieldAlert, Sparkles, ChefHat, Check, ShoppingBag } from "lucide-react";
import { DishItem } from "../../data/restaurantMenu";

interface DishDossierModalProps {
  dish: DishItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: DishItem) => void;
}

export const DishDossierModal: React.FC<DishDossierModalProps> = ({
  dish,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-neutral-900/95 border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            {dish.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {dish.badge}
              </span>
              <span className="text-xs text-white/50">{dish.servingWeight}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{dish.name}</h2>
            <p className="text-xs sm:text-sm text-white/60">{dish.subtitle}</p>
          </div>
        </div>

        {/* Price & Calories Hero */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="text-xs text-white/50 font-medium">Price</div>
            <div className="text-2xl font-black text-amber-400">
              {dish.currency}
              {dish.price}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Energy</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {dish.calories} <span className="text-xs font-normal text-white/50">kcal</span>
            </div>
          </div>
        </div>

        {/* Nutritional Macros Breakdown */}
        <div>
          <h3 className="text-xs font-semibold text-white/70 tracking-wider uppercase mb-2">
            Nutritional Profile
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-center">
              <div className="text-[11px] text-white/50">Protein</div>
              <div className="text-sm font-bold text-emerald-400">{dish.macros.protein}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-center">
              <div className="text-[11px] text-white/50">Carbs</div>
              <div className="text-sm font-bold text-amber-400">{dish.macros.carbs}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-center">
              <div className="text-[11px] text-white/50">Fats</div>
              <div className="text-sm font-bold text-rose-400">{dish.macros.fat}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-center">
              <div className="text-[11px] text-white/50">Fiber</div>
              <div className="text-sm font-bold text-cyan-400">{dish.macros.fiber}</div>
            </div>
          </div>
        </div>

        {/* Allergen Advisories */}
        <div>
          <h3 className="text-xs font-semibold text-white/70 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Allergen Advisories</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {dish.allergens.length > 0 ? (
              dish.allergens.map((alg) => (
                <span
                  key={alg}
                  className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 border border-red-500/25 text-xs font-medium"
                >
                  Contains {alg}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-xs font-medium">
                No major allergens flagged
              </span>
            )}
          </div>
        </div>

        {/* Fresh Farm Ingredients */}
        <div>
          <h3 className="text-xs font-semibold text-white/70 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Fresh Farm Ingredients</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-white/80">
            {dish.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chef's Tasting Notes */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed text-amber-200/90">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
            <ChefHat className="w-4 h-4" />
            <span>Chef Marco&apos;s Culinary Note</span>
          </div>
          <p className="italic">&ldquo;{dish.chefNotes}&rdquo;</p>
        </div>

        {/* Modal Action CTA */}
        <button
          onClick={() => {
            onAddToCart(dish);
            onClose();
          }}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>
            Add to Order • {dish.currency}
            {dish.price}
          </span>
        </button>
      </div>
    </div>
  );
};
