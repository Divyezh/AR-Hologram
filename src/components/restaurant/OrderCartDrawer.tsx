"use client";

import React, { useState } from "react";
import { X, Plus, Minus, Trash2, CheckCircle2, UtensilsCrossed, BellRing } from "lucide-react";
import { DishItem, RESTAURANT_INFO } from "../../data/restaurantMenu";
import { soundManager } from "../../lib/audio/soundManager";

export interface CartItem {
  dish: DishItem;
  quantity: number;
}

interface OrderCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onClearCart: () => void;
}

export const OrderCartDrawer: React.FC<OrderCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onClearCart,
}) => {
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const gst = Math.round(subtotal * RESTAURANT_INFO.taxRate);
  const serviceCharge = Math.round(subtotal * RESTAURANT_INFO.serviceChargeRate);
  const total = subtotal + gst + serviceCharge;

  const handlePlaceOrder = () => {
    soundManager.playOrderBell();
    setIsOrderPlaced(true);
    setTimeout(() => {
      onClearCart();
      setIsOrderPlaced(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-neutral-950/95 border-l border-white/12 p-6 flex flex-col justify-between text-white shadow-2xl">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-bold">Your Table Order</h2>
              </div>
              <p className="text-xs text-white/50">{RESTAURANT_INFO.tableNumber} • Live AR Bill</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="py-12 text-center text-white/40 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">
                  🍽️
                </div>
                <p className="text-xs">Your order tray is currently empty.</p>
                <p className="text-[11px] text-white/30">
                  Select dishes from the 3D menu or camera view.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.dish.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.dish.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{item.dish.name}</div>
                      <div className="text-[11px] text-amber-400">
                        {RESTAURANT_INFO.currencySymbol}
                        {item.dish.price} each
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.dish.id, -1)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.dish.id, 1)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Summary and Checkout */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="space-y-1.5 text-xs text-white/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {RESTAURANT_INFO.currencySymbol}
                  {subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>
                  {RESTAURANT_INFO.currencySymbol}
                  {gst}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (5%)</span>
                <span>
                  {RESTAURANT_INFO.currencySymbol}
                  {serviceCharge}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="text-amber-400 font-black">
                  {RESTAURANT_INFO.currencySymbol}
                  {total}
                </span>
              </div>
            </div>

            {isOrderPlaced ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Order Transmitted to Kitchen!</span>
              </div>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>
                  Place Order to Table • {RESTAURANT_INFO.currencySymbol}
                  {total}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
