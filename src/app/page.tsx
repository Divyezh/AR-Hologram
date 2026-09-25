import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <div className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </div>
      <Footer />
    </main>
  );
}
