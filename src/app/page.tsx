"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { HowItWorks } from '@/components/how-it-works';
import { RecentPublicNotes } from '@/components/recent-public-notes';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect to explore if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/explore');
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

  return (
    <main>
      <HeroSection />
      <RecentPublicNotes className="bg-neutral-900 py-16" />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
    </main>
  );
}