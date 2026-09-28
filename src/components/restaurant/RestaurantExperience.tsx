'use client';

import React, { useState } from 'react';
import { TableQRCodeScreen } from './TableQRCodeScreen';
import { RestaurantMenuView } from './RestaurantMenuView';
import { RestaurantARCameraView } from './RestaurantARCameraView';
import { DishDossierModal } from './DishDossierModal';
import { OrderCartDrawer, CartItem } from './OrderCartDrawer';
import { RESTAURANT_MENU, DishItem } from '../../data/restaurantMenu';
import { soundManager } from '../../lib/audio/soundManager';

export const RestaurantExperience: React.FC = () => {
  // Step in user flow: 'qr' -> 'menu' -> 'camera'
  const [currentStep, setCurrentStep] = useState<'qr' | 'menu' | 'camera'>('qr');

  // Currently inspected/active dish (defaults to classic burger ₹249)
  const [selectedDish, setSelectedDish] = useState<DishItem>(RESTAURANT_MENU[0]);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Nutrition & Ingredients Dossier Modal
  const [dossierDish, setDossierDish] = useState<DishItem | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  const handleAddToCart = (dish: DishItem) => {
    soundManager.playClick();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (dishId: string, delta: number) => {
    soundManager.playClick();
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOpenInfo = (dish: DishItem) => {
    soundManager.playClick();
    setDossierDish(dish);
    setIsDossierOpen(true);
  };

  return (
    <div className="relative w-screen h-screen bg-black text-white select-none overflow-y-auto">
      {/* 1. View Switcher based on Flow Step */}
      {currentStep === 'qr' && (
        <TableQRCodeScreen
          onSelectDish={(dish) => {
            setSelectedDish(dish);
            setCurrentStep('camera');
          }}
          onEnterMenu={() => setCurrentStep('menu')}
        />
      )}

      {currentStep === 'menu' && (
        <RestaurantMenuView
          onSelectDishForAR={(dish) => {
            setSelectedDish(dish);
            setCurrentStep('camera');
          }}
          onOpenInfo={handleOpenInfo}
          onAddToCart={handleAddToCart}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
          onBackToQR={() => setCurrentStep('qr')}
        />
      )}

      {currentStep === 'camera' && (
        <RestaurantARCameraView
          currentDish={selectedDish}
          onSelectDish={setSelectedDish}
          onBackToMenu={() => setCurrentStep('qr')}
          onTapInfo={handleOpenInfo}
          onAddToCart={handleAddToCart}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* 2. Tap -> Info Dossier Modal */}
      {dossierDish && (
        <DishDossierModal
          dish={dossierDish}
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 3. Table Order Tray / Billing Drawer */}
      <OrderCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
      />
    </div>
  );
};
