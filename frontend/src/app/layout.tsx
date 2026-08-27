import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { TopIdentityStrip } from '@/components/TopIdentityStrip';
import { PillTabNav } from '@/components/PillTabNav';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CityPulse — VMC Municipal Operations Portal',
  description: 'Vadodara Municipal Corporation Civic Grievance & GIS Command Console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${ibmPlexMono.variable}`}>
      <body
        className={plusJakartaSans.className}
        style={{
          background: 'var(--color-bg-app)',
          color: 'var(--color-ink)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Providers>
          {/* C.1 — Top Identity Strip with National Flag, Emblem & Citizen Intake */}
          <TopIdentityStrip />
          {/* C.2 — Pill Tab Navigation */}
          <PillTabNav />
          {/* Page content */}
          <main style={{ flex: 1, background: 'var(--color-bg-app)' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}