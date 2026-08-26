'use client';

// C.7 — Map Card with Bilingual Tooltips & Legend
// Vadodara Municipal Corporation (VMC)

import dynamic from 'next/dynamic';
import React from 'react';
import { Complaint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface MapViewProps {
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectWard?: (wardId: number | string) => void;
  selectedWard?: number | string;
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  showHeatmap?: boolean;
}

const DynamicMap = dynamic(
  () => import('./MapViewComponent').then((mod) => mod.MapViewComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-inherit flex items-center justify-center flex-col gap-3 text-slate-400 font-mono text-xs">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        Loading city map…
      </div>
    ),
  }
);

export const MapView: React.FC<MapViewProps> = ({
  complaints = [],
  onSelectComplaint,
  onSelectWard,
  selectedWard,
  center,
  zoom,
  height,
  showHeatmap = false,
}) => {
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height || '100%',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        isolation: 'isolate',
        zIndex: 1,
      }}
    >
      <DynamicMap
        complaints={safeComplaints}
        onSelectComplaint={onSelectComplaint}
        onSelectWard={onSelectWard}
        selectedWard={selectedWard}
        center={center}
        zoom={zoom}
        showHeatmap={showHeatmap}
      />

      {/* Bottom-left legend chip */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 20,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 11,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-ink-muted)',
          boxShadow: 'var(--shadow-rest)',
        }}
      >
        {[
          { color: '#166534', label: t('sev.low') },
          { color: '#B45309', label: t('sev.medium') },
          { color: '#B91C1C', label: t('sev.critical') },
          { color: '#15803D', label: t('status.resolved') },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: '#0F172A' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
