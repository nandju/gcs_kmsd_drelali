import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import type { ReactNode } from 'react';
import { GcsHeader } from '@/components/gcs/site-header';
import { GcsFooter } from '@/components/gcs/site-footer';
import { GCS_SITE } from '@/config/gcs-site';

const outfit = Outfit({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `GCS — ${GCS_SITE.tagline}`,
    template: '%s | GCS',
  },
  description: GCS_SITE.description,
};

export default function GcsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`flex min-h-screen flex-col bg-white text-[var(--gcs-ink)] ${outfit.className}`}>
      <GcsHeader />
      <div className="flex-1">{children}</div>
      <GcsFooter />
    </div>
  );
}
