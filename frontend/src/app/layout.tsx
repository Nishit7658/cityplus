import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { TopIdentityStrip } from '@/components/TopIdentityStrip';
import { PillTabNav } from '@/components/PillTabNav';

export const metadata: Metadata = {
  title: 'CityPulse — VMC Municipal Operations Portal',
  description: 'Vadodara Municipal Corporation Civic Grievance & GIS Command Console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: 'var(--color-bg-app)',
          color: 'var(--color-ink)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Public Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Providers>
          {/* C.1 — Top Identity Strip */}
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