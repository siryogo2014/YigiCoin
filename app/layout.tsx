import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Pacifico } from 'next/font/google';
import './globals.css';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'YigiCoin - Plataforma de Crecimiento',
  description: 'Plataforma de oportunidades y crecimiento económico',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={[
          inter.variable,
          jetbrainsMono.variable,
          pacifico.variable,
          'min-h-screen',
          'bg-slate-50',
          'text-slate-900',
          'antialiased',
          'font-sans',
        ].join(' ')}
      >
        {children}
      </body>
    </html>
  );
}
