"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "../../components/ui/LoadingScreen";

// Dynamic import with ssr: false ensures WebGL, Three.js & Camera only run in browser
const RestaurantExperience = dynamic(
  () =>
    import("../../components/restaurant/RestaurantExperience").then(
      (mod) => mod.RestaurantExperience
    ),
  {
    ssr: false,
    loading: () => (
      <LoadingScreen
        title="Loading 3D AR Dining"
        subtitle="Preparing Tabletop AR & Gourmet Visuals..."
      />
    ),
  }
);

export default function RestaurantPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black text-white">
      <RestaurantExperience />
    </main>
  );
}
