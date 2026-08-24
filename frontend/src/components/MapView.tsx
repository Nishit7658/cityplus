'use client';

// C.7 — Map Card with Bilingual Tooltips & Legend
// Vadodara Municipal Corporation (VMC)

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Complaint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface MapViewProps {
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
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
  center,
  zoom,
  height,
  showHeatmap: initialHeatmap = false,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(initialHeatmap);
  const [showPins, setShowPins] = useState(true);
  const [showWards, setShowWards] = useState(false);
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
        complaints={showPins ? safeComplaints : []}
        onSelectComplaint={onSelectComplaint}
        center={center}
        zoom={zoom}
        showHeatmap={showHeatmap}
      />

      {/* Floating control cluster, bottom-right (Pins / Heat / Wards) */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 20,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-hover)',
          border: '1px solid var(--color-border)',
          padding: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Pins toggle */}
        <button
          onClick={() => setShowPins((p) => !p)}
          title={t('map.toggle_pins')}
          className={`w-9 h-9 rounded-md border-none flex items-center justify-center cursor-pointer transition-colors ${
            showPins ? 'bg-[#0B2545] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>

        {/* Heatmap toggle */}
        <button
          onClick={() => setShowHeatmap((h) => !h)}
          title={t('map.toggle_heatmap')}
          className={`w-9 h-9 rounded-md border-none flex items-center justify-center cursor-pointer transition-colors ${
            showHeatmap ? 'bg-[#0B2545] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </button>

        {/* Wards boundary toggle */}
        <button
          onClick={() => setShowWards((w) => !w)}
          title={t('map.toggle_wards')}
          className={`w-9 h-9 rounded-md border-none flex items-center justify-center cursor-pointer transition-colors ${
            showWards ? 'bg-[#0B2545] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      </div>

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
