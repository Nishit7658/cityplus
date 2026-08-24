'use client';

// F.6 — Officers Page
// 4-col grid, radial gauge for active-complaint load, name, dept, ward

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PriorityRing } from '@/components/PriorityRing';
import { Officer } from '@/types';
import { MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);

  useEffect(() => {
    fetch(`${API_URL}/api/officers`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setOfficers(d);
      })
      .catch(() => {});
  }, []);

  const safe = Array.isArray(officers) ? officers : MOCK_OFFICERS;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 40px' }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
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
          MUNICIPAL FIELD PERSONNEL
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
          VMC Ward Officers
        </h1>
        <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-ink-muted)', marginTop: 4 }}>
          {safe.length} active department officers with live workload distribution across Vadodara
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {safe.map((officer, i) => {
          const activeCount = officer.active_complaints || 0;
          const maxLoad = 10;
          const loadPercent = Math.min(100, (activeCount / maxLoad) * 100);

          return (
            <motion.div
              key={officer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(34,34,31,0.08)' }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-rest)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 200ms cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {/* Top row: avatar + ring */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Officer avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--color-terracotta-100)',
                      color: 'var(--color-terracotta-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 15,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(officer.name || '?')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {officer.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                      {officer.department}
                    </div>
                  </div>
                </div>

                {/* E.5 — Priority Ring: active complaint load */}
                <PriorityRing
                  value={loadPercent}
                  maxValue={100}
                  size={64}
                  strokeWidth={5}
                  label={String(activeCount)}
                  sublabel="active"
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--color-border)' }} />

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>Assigned Jurisdiction</span>
                  <span style={{ color: 'var(--color-ink)', fontWeight: 500, textAlign: 'right' }}>
                    {officer.ward_name || `Ward ${officer.ward_id || 1}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>Active Load</span>
                  <span style={{ color: 'var(--color-ink)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {activeCount} tasks
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>Lifetime Resolved</span>
                  <span
                    style={{
                      color: 'var(--color-status-resolved)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {officer.resolved_complaints || 0}
                  </span>
                </div>
              </div>

              {/* Phone */}
              {officer.phone && (
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-ink-faint)',
                    borderTop: '1px dashed var(--color-border)',
                    paddingTop: 10,
                  }}
                >
                  📞 {officer.phone}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
