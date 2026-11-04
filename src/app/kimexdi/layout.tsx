import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/kimexdi/site-header';
import { SiteFooter } from '@/components/kimexdi/site-footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'KIMEXDI — Logistique, import-export et groupage au Canada',
    template: '%s | KIMEXDI',
  },
  description:
    'KIMEXDI / KMSD Canada : logistique, import-export, transport, entreposage, groupage et services logistiques locaux au Canada.',
};

export default function KimexdiLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`flex min-h-screen flex-col bg-[var(--kimexdi-white)] text-[var(--kimexdi-ink)] ${poppins.className}`}
    >
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
