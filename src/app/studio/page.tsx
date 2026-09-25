'use client';

import dynamic from 'next/dynamic';
import { LoadingScreen } from '../../components/ui/LoadingScreen';

// Dynamic import with ssr: false ensures WebGL & MediaPipe only load in browser
const StudioLayout = dynamic(
  () => import('../../components/studio/StudioLayout').then((mod) => mod.StudioLayout),
  {
    ssr: false,
    loading: () => <LoadingScreen title="Loading AR Hologram Studio" subtitle="Initializing WebGL & Computer Vision..." />,
  }
);

export default function StudioPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black text-white">
      <StudioLayout />
    </main>
  );
}
