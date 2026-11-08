'use client';

// Carrousel visuel du panneau gauche des pages d'authentification.
// Alterne automatiquement (fondu, 5 s) les photos logistiques des deux
// plateformes ; indicateur de position + caption marine.

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SLIDES = [
  {
    src: '/images/gcs/2151989598.jpg',
    alt: 'Logistique GCS — Côte d’Ivoire',
    label: 'GCS — Côte d’Ivoire',
  },
  {
    src: '/images/kimexdi/129640.jpg',
    alt: 'Logistique KIMEXDI — Canada',
    label: 'KIMEXDI — Canada',
  },
  {
    src: '/images/gcs/71414.jpg',
    alt: 'Opérations GCS',
    label: 'GCS — Côte d’Ivoire',
  },
  {
    src: '/images/kimexdi/735.jpg',
    alt: 'Opérations KIMEXDI',
    label: 'KIMEXDI — Canada',
  },
] as const;

const INTERVAL_MS = 5000;

export function AuthVisual() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative hidden flex-1 overflow-hidden lg:block">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="55vw"
          />
        </div>
      ))}

      {/* Voile marine + caption + indicateurs */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12314e]/85 via-[#12314e]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-10">
        <div>
          <p className="text-2xl font-bold text-white">
            Plateforme opérationnelle
          </p>
          <p className="mt-1 text-sm text-cyan-100/80">
            {SLIDES[index].label}
          </p>
        </div>
        <div className="flex gap-2" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
