import Link from 'next/link';
import { GCS_SITE } from '@/config/gcs-site';

export function GcsFooter() {
  return (
    <footer className="bg-[var(--gcs-navy-950)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--gcs-accent)] text-sm font-extrabold">
              GC
            </span>
            <span className="text-sm font-extrabold tracking-wide">GCS</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-white/70">{GCS_SITE.description}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            {GCS_SITE.tagline}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Navigation
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {GCS_SITE.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/75 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Contact
          </p>
          <p className="mt-3 text-sm text-white/60">{GCS_SITE.contact.note}</p>
          <Link
            href="/gcs/contact"
            className="mt-2 inline-block text-sm font-medium text-white/85 hover:text-white"
          >
            Page contact →
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/40 sm:px-6">
          Site de démonstration — informations en cours de validation.
        </p>
      </div>
    </footer>
  );
}
