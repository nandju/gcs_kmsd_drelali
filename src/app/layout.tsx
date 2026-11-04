import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Onest } from 'next/font/google';
import './globals.css';
import { ToasterProvider } from './providers/toaster';
import { ErpProvider } from '@/context/erp-store';
import { FormsProvider } from '@/context/forms-store';

const onest = Onest({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Plateforme opérationnelle — GCS · KIMEXDI · DRELALI',
    template: '%s | Plateforme GCS',
  },
  description:
    'Plateforme opérationnelle multi-entreprises : logistique, transport, distribution et agro-alimentaire. Prototype de démonstration frontend.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`bg-gray-50 dark:bg-dark-secondary min-h-screen flex flex-col ${onest.className}`}
      >
        <ThemeProvider disableTransitionOnChange defaultTheme="light">
          {/* ToasterProvider must render before the children components */}
          {/* https://github.com/emilkowalski/sonner/issues/168#issuecomment-1773734618 */}
          <ToasterProvider />

          <ErpProvider>
            <FormsProvider>
              <div className="isolate flex flex-col flex-1">{children}</div>
            </FormsProvider>
          </ErpProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
