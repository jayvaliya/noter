"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Only render home page content if not authenticated
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
