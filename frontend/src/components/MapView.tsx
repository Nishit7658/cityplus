'use client';

// C.7 — Map Card (Hero centerpiece)
// Light CARTO Positron basemap with CSS warm filter
// Floating control cluster (Pins / Heat / Wards) + floating legend chip

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Complaint } from '@/types';

interface MapViewProps {
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  height?: number | string;
}

const DynamicMap = dynamic(
  () => import('./MapViewComponent').then((mod) => mod.MapViewComponent),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 400,
          background: 'var(--color-surface-sunken)',
          borderRadius: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          color: 'var(--color-ink-faint)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4}
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
}) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [showWards, setShowWards] = useState(false);
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height || '100%',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      <DynamicMap
        complaints={showPins ? safeComplaints : []}
        onSelectComplaint={onSelectComplaint}
        center={center}
        zoom={zoom}
        showHeatmap={showHeatmap}
      />

      {/* C.7 — Floating control cluster, bottom-right (Pins / Heat / Wards) */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 500,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-hover)',
          border: '1px solid var(--color-border)',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Pins toggle */}
        <button
          onClick={() => setShowPins((p) => !p)}
          title="Toggle Pins"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: showPins ? 'var(--color-teal-100)' : 'transparent',
            color: showPins ? 'var(--color-teal-900)' : 'var(--color-ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 120ms ease, color 120ms ease',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>

        {/* Heatmap toggle */}
        <button
          onClick={() => setShowHeatmap((h) => !h)}
          title="Toggle Heatmap"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: showHeatmap ? 'var(--color-teal-100)' : 'transparent',
            color: showHeatmap ? 'var(--color-teal-900)' : 'var(--color-ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 120ms ease, color 120ms ease',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </button>

        {/* Wards boundary toggle */}
        <button
          onClick={() => setShowWards((w) => !w)}
          title="Toggle Ward Boundaries"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: showWards ? 'var(--color-teal-100)' : 'transparent',
            color: showWards ? 'var(--color-teal-900)' : 'var(--color-ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 120ms ease, color 120ms ease',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      </div>

      {/* C.7 — Bottom-left legend chip */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 500,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--color-border)',
          padding: '6px 14px',
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
          { color: '#6B9E7A', label: 'Low' },
          { color: '#D89A2C', label: 'Medium' },
          { color: '#B33B2E', label: 'Critical' },
          { color: '#3E8E5B', label: 'Resolved' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
