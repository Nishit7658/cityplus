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
      <body
        style={{
          background: 'var(--color-bg-app)',
          color: 'var(--color-ink)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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