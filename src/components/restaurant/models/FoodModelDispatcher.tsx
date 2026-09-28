'use client';

import React from 'react';
import { Burger3DModel } from './Burger3DModel';
import { Pizza3DModel } from './Pizza3DModel';
import { Fries3DModel } from './Fries3DModel';
import { Sushi3DModel } from './Sushi3DModel';
import { Dessert3DModel } from './Dessert3DModel';
import { DishItem } from '../../../data/restaurantMenu';

interface FoodModelDispatcherProps {
  dish: DishItem;
  onTapInfo?: () => void;
}

export const FoodModelDispatcher: React.FC<FoodModelDispatcherProps> = ({ dish, onTapInfo }) => {
  switch (dish.modelType) {
    case 'burger':
      return <Burger3DModel onTap={onTapInfo} />;
    case 'pizza':
      return <Pizza3DModel onTap={onTapInfo} />;
    case 'fries':
      return <Fries3DModel onTap={onTapInfo} />;
    case 'sushi':
      return <Sushi3DModel onTap={onTapInfo} />;
    case 'cake':
    case 'drink':
    default:
      return <Dessert3DModel onTap={onTapInfo} />;
  }
};
