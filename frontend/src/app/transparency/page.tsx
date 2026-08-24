'use client';

// F.7 — Transparency Page (public)
// 4-step "how it works" strip + stat cards + ward comparison bar list

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/StatCard';
import { TransparencyStats } from '@/types';
import { MOCK_TRANSPARENCY } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6B5C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Citizen Reports',
    description: 'Citizen messages the VMC WhatsApp line with a photo and geo-location pin.',
  },
  {
    step: '02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6B5C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'Spatial De-duplication',
    description: 'PostGIS spatial cluster engine groups nearby reports within 18m into one ticket.',
  },
  {
    step: '03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6B5C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Officer Dispatch',
    description: 'VMC dashboard automatically routes task to the responsible ward field officer.',
  },
  {
    step: '04',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6B5C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Citizen Closed-Loop',
    description: 'Citizen receives verification WhatsApp: "Fixed" or "Reopen" if unresolved.',
  },
];

export default function TransparencyPage() {
  const [stats, setStats] = useState<TransparencyStats>(MOCK_TRANSPARENCY);

  useEffect(() => {
    fetch(`${API_URL}/api/transparency`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.total_complaints > 0) setStats(d);
      })
      .catch(() => {});
  }, []);

  const safeStats = stats || MOCK_TRANSPARENCY;
  const maxWardTotal = safeStats?.wards?.reduce((m, w) => Math.max(m, w.total), 1) || 1;
  const resolutionRate = Math.round(
    (safeStats.resolved_complaints / Math.max(1, safeStats.total_complaints)) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 40px 60px' }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 40 }}>
        <p
          style={{
            fontSize: 'var(--fs-eyebrow)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-ink-muted)',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          MUNICIPAL PUBLIC RECORD
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-display-md)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 1.2,
          }}
        >
          Transparency & Performance
        </h1>
        <p
          style={{
            fontSize: 'var(--fs-body-md)',
            color: 'var(--color-ink-muted)',
            marginTop: 8,
            maxWidth: 680,
            lineHeight: 1.6,
          }}
        >
          CityPulse is an open civic system for Vadodara Municipal Corporation. Every complaint, resolution time, and officer action is logged here for public scrutiny.
        </p>
      </div>

      {/* How CityPulse Works — 4-step strip */}
      <div style={{ marginBottom: 48 }}>
        <p
          style={{
            fontSize: 'var(--fs-eyebrow)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-ink-muted)',
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          HOW CITYPULSE OPERATES
        </p>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Connecting dashed line on desktop only */}
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              top: 28,
              left: '12.5%',
              right: '12.5%',
              height: 1,
              borderTop: '2px dashed var(--color-border-strong)',
              zIndex: 0,
            }}
          />

          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center p-4 relative z-10 bg-cp-bg rounded-lg"
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '2px solid var(--color-teal-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  background: 'var(--color-surface)',
                  boxShadow: '0 0 0 4px var(--color-bg-app)',
                }}
              >
                {step.icon}
              </div>
              <div
                style={{
                  fontSize: 'var(--fs-eyebrow)',
                  color: 'var(--color-teal-700)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 4,
                }}
              >
                STEP {step.step}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  marginBottom: 6,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {step.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.55 }}>
                {step.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stat cards — teal/sage palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        <StatCard
          eyebrow="Total Complaints"
          value={safeStats.total_complaints}
          sparklineData={[120, 150, 180, 220, 270, 310, safeStats.total_complaints]}
        />
        <StatCard
          eyebrow="Resolved"
          value={safeStats.resolved_complaints}
          trend={{ direction: 'up', percent: 28, positive: true }}
        />
        <StatCard eyebrow="Resolution Rate (%)" value={resolutionRate} />
        <StatCard eyebrow="Avg Hours to Resolve" value={Math.round(safeStats.avg_resolution_hours)} />
      </div>

      {/* Ward comparison — horizontal ranked bar list */}
      <div>
        <p
          style={{
            fontSize: 'var(--fs-eyebrow)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-ink-muted)',
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          WARD RESOLUTION PERFORMANCE (10 VMC WARDS)
        </p>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-rest)',
          }}
        >
          {safeStats.wards.map((ward, i) => {
            const resolvedPct = ward.total > 0 ? ward.resolved / ward.total : 0;
            return (
              <div
                key={ward.ward_name}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:px-6"
                style={{
                  borderBottom:
                    i < safeStats.wards.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-sunken)',
                }}
              >
                <div
                  style={{
                    minWidth: 180,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {ward.ward_name}
                </div>

                {/* Total bar */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    height: 10,
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'var(--color-surface-sunken)',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(ward.total / maxWardTotal) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                    style={{
                      height: '100%',
                      background: 'var(--color-teal-200)',
                      borderRadius: 5,
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${resolvedPct * 100}%` }}
                      transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: i * 0.05 + 0.1,
                      }}
                      style={{ height: '100%', background: 'var(--color-status-resolved)' }}
                    />
                  </motion.div>
                </div>

                {/* Numbers */}
                <div className="flex gap-4 text-xs sm:text-sm flex-shrink-0">
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                    {ward.total} tickets
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-status-resolved)',
                      fontWeight: 600,
                    }}
                  >
                    {ward.resolved} resolved ({Math.round(resolvedPct * 100)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
