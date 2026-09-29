export interface DishMacros {
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

export interface DishItem {
  id: string;
  name: string;
  subtitle: string;
  price: number; // in INR (₹)
  currency: string;
  category: "burgers" | "pizzas" | "sides" | "specialty" | "desserts" | "drinks";
  rating: number;
  reviewCount: number;
  prepTime: string;
  calories: number;
  servingWeight: string;
  isChefSpecial?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  spicyLevel?: number; // 1 to 3
  modelType: "burger" | "pizza" | "fries" | "sushi" | "cake" | "drink";
  defaultScale: number;
  macros: DishMacros;
  allergens: string[];
  ingredients: string[];
  chefNotes: string;
  accentColor: string;
  badge: string;
  emoji: string;
}

export const RESTAURANT_INFO = {
  name: "L'Aura Dining & Bistro",
  tagline: "Immersive 3D Gastronomy & AR Table Ordering",
  tableNumber: "Table 04",
  currencySymbol: "₹",
  taxRate: 0.05, // 5% GST
  serviceChargeRate: 0.05, // 5% Service Charge
};

export const MENU_CATEGORIES = [
  { id: "all", label: "All Items", icon: "🍽️" },
  { id: "burgers", label: "Gourmet Burgers", icon: "🍔" },
  { id: "pizzas", label: "Wood-Fired Pizza", icon: "🍕" },
  { id: "sides", label: "Crispy Sides", icon: "🍟" },
  { id: "specialty", label: "Chef Specialty", icon: "🍣" },
  { id: "desserts", label: "Sweet Finishes", icon: "🍫" },
] as const;

export const RESTAURANT_MENU: DishItem[] = [
  {
    id: "classic-burger",
    name: "Classic Burger",
    subtitle: "Flame-Grilled Artisan Brioche",
    price: 249,
    currency: "₹",
    category: "burgers",
    rating: 4.9,
    reviewCount: 382,
    prepTime: "12-15 mins",
    calories: 560,
    servingWeight: "280g",
    isChefSpecial: true,
    isVegetarian: false,
    isSpicy: false,
    spicyLevel: 1,
    modelType: "burger",
    defaultScale: 1.0,
    macros: {
      protein: "28g",
      carbs: "44g",
      fat: "24g",
      fiber: "4g",
    },
    allergens: ["Gluten", "Dairy", "Sesame"],
    ingredients: [
      "Flame-Grilled Prime Angus Patty (or Beyond Meat)",
      "Aged Wisconsin Sharp Cheddar Melt",
      "Fresh Heirloom Vine Tomato Slice",
      "Crisp Ruffled Farm Leaf Lettuce",
      "Caramelized Sweet Spanish Onions",
      "Butter-Toasted Golden Brioche Bun",
      "White Sesame Seed Crown",
      "Signature Smoked Paprika House Aioli",
    ],
    chefNotes:
      "Seared at 450°F on volcanic lava stones to lock in natural umami juices. Draped with slow-melted aged cheddar and finished with fresh farm greens picked this morning.",
    accentColor: "#f59e0b",
    badge: "Best Seller",
    emoji: "🍔",
  },
  {
    id: "truffle-pizza",
    name: "Truffle Artisan Pizza",
    subtitle: "Wood-Fired Sourdough & Wild Porcini",
    price: 399,
    currency: "₹",
    category: "pizzas",
    rating: 4.8,
    reviewCount: 245,
    prepTime: "15-18 mins",
    calories: 780,
    servingWeight: "380g",
    isChefSpecial: true,
    isVegetarian: true,
    isSpicy: false,
    modelType: "pizza",
    defaultScale: 1.1,
    macros: {
      protein: "24g",
      carbs: "82g",
      fat: "31g",
      fiber: "6g",
    },
    allergens: ["Gluten", "Dairy"],
    ingredients: [
      "72-Hour Fermented Sourdough Crust",
      "San Marzano DOP Tomato Coulis",
      "Fresh Fior di Latte Mozzarella",
      "Black Truffle Infused Olive Oil",
      "Pan-Roasted Wild Porcini Mushrooms",
      "Fresh Genovese Basil Leaves",
      "Aged Parmigiano-Reggiano Shavings",
    ],
    chefNotes:
      "Baked for 90 seconds in our 900°F oak-fired stone oven creating authentic leopard charring and a cloud-like blistered rim.",
    accentColor: "#ef4444",
    badge: "Chef's Signature",
    emoji: "🍕",
  },
  {
    id: "crispy-fries",
    name: "Peri-Peri Loaded Fries",
    subtitle: "Triple-Cooked Russet with Garlic Aioli",
    price: 149,
    currency: "₹",
    category: "sides",
    rating: 4.7,
    reviewCount: 512,
    prepTime: "8-10 mins",
    calories: 380,
    servingWeight: "220g",
    isVegetarian: true,
    isSpicy: true,
    spicyLevel: 2,
    modelType: "fries",
    defaultScale: 0.95,
    macros: {
      protein: "6g",
      carbs: "54g",
      fat: "16g",
      fiber: "5g",
    },
    allergens: [],
    ingredients: [
      "Triple-Cooked Idaho Russet Potatoes",
      "Artisan African Bird’s Eye Chili Dust",
      "Smoked Sea Salt Crystals",
      "Roasted Garlic Aioli Dip",
      "Fresh Chopped Italian Parsley",
    ],
    chefNotes:
      "Cut thick and twice-blanched in pure sunflower oil for maximum outer crunch while remaining pillow-soft on the inside.",
    accentColor: "#f97316",
    badge: "Popular",
    emoji: "🍟",
  },
  {
    id: "emperor-sushi",
    name: "Emperor Dragon Roll",
    subtitle: "Tempura Prawn & Avocado Shavings",
    price: 449,
    currency: "₹",
    category: "specialty",
    rating: 4.95,
    reviewCount: 189,
    prepTime: "12-14 mins",
    calories: 420,
    servingWeight: "260g",
    isChefSpecial: true,
    isVegetarian: false,
    isSpicy: true,
    spicyLevel: 1,
    modelType: "sushi",
    defaultScale: 1.05,
    macros: {
      protein: "19g",
      carbs: "58g",
      fat: "12g",
      fiber: "4g",
    },
    allergens: ["Crustaceans", "Fish", "Soy", "Sesame"],
    ingredients: [
      "Crispy Tiger Prawn Tempura",
      "Koshihikari Seasoned Sushi Rice",
      "Shingled Hass Avocado Dragon Scales",
      "Crisp English Cucumber & Spring Onion",
      "Toasted Nori Seaweed Sheet",
      "Unagi Glaze & Spicy Sriracha Mayo",
      "Golden Tobiko Caviar Pearls",
    ],
    chefNotes:
      "Hand-rolled to order by Master Shokunin with warm vinegar rice balancing the cooling crunch of fresh Hass avocado.",
    accentColor: "#10b981",
    badge: "Premium Catch",
    emoji: "🍣",
  },
  {
    id: "molten-lava-cake",
    name: "Molten Belgian Lava Cake",
    subtitle: "70% Valrhona Dark Ganache Core",
    price: 199,
    currency: "₹",
    category: "desserts",
    rating: 4.92,
    reviewCount: 420,
    prepTime: "10-12 mins",
    calories: 490,
    servingWeight: "190g",
    isVegetarian: true,
    isSpicy: false,
    modelType: "cake",
    defaultScale: 0.9,
    macros: {
      protein: "7g",
      carbs: "52g",
      fat: "29g",
      fiber: "4g",
    },
    allergens: ["Dairy", "Eggs", "Gluten"],
    ingredients: [
      "70% Valrhona Guanaja Single-Origin Chocolate",
      "Organic Normandy Butter",
      "Madagascar Bourbon Vanilla Bean",
      "Free-Range Egg Souffle Fondant",
      "Fresh Raspberry Coulis Drizzle",
      "Velvety Fior di Latte Ice Cream Scoop",
    ],
    chefNotes:
      "Warm soufflé crust that releases an irresistible stream of hot dark chocolate ganache when pierced with your spoon.",
    accentColor: "#a855f7",
    badge: "Sweet Finish",
    emoji: "🍫",
  },
];
