import type { ReactNode } from 'react';
import { AuthVisual } from './auth-visual';

// Coque commune des pages d'authentification : carrousel visuel à gauche,
// contenu (formulaire) à droite sur fond marine #12314e, accent cyan.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-[#12314e]">
      <AuthVisual />

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[520px] lg:shrink-0 lg:px-14">
        <div className="w-full max-w-sm">
          <p className="text-sm font-semibold tracking-wide text-cyan-300">
            Espace de gestion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-sm text-gray-300">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-8 text-center text-xs leading-relaxed text-gray-400">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
