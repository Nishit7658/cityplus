'use client';

// F.5 — Hotspots Page
// Full-width heatmap (360px) + horizontally scrolling hotspot cards ranked by severity

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '@/components/MapView';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { ConfirmationAvatarStack } from '@/components/ConfirmationAvatarStack';
import { CategoryIcon, getCategoryColor, getSeverityColor } from '@/components/CategoryIcon';
import { Complaint, Officer } from '@/types';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HotspotsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/complaints`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setComplaints(d);
      })
      .catch(() => {});
    fetch(`${API_URL}/api/officers`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setOfficers(d);
      })
      .catch(() => {});
  }, []);

  const safe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

  // Build hotspot list: top complaints by severity score
  const hotspots = [...safe]
    .sort((a, b) => (b.severity_score || 0) - (a.severity_score || 0))
    .slice(0, 12);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 40px' }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
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
            CRITICAL DENSITY ANALYSIS
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
            City Problem Hotspots
          </h1>
          <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-ink-muted)', marginTop: 4 }}>
            Urban clusters ranked by citizen confirmation density, recurrence rate, and composite risk score
          </p>
        </div>

        {/* Full-width heatmap */}
        <div
          style={{
            width: '100%',
            height: 380,
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            marginBottom: 32,
            boxShadow: 'var(--shadow-rest)',
          }}
        >
          <MapView complaints={safe} onSelectComplaint={setSelected} height={380} />
        </div>

        {/* Ranked hotspot cards — horizontal scroll */}
        <div style={{ marginBottom: 8 }}>
          <p
            style={{
              fontSize: 'var(--fs-eyebrow)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-ink-muted)',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Top Ranked Spots — Highest Civic Urgency
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 16,
              scrollbarWidth: 'none',
            }}
          >
            {hotspots.map((c, i) => {
              const accentColor = getCategoryColor(c.category);
              const sevColor = getSeverityColor(c.confirmation_count, c.status);
              const isCritical = c.confirmation_count >= 8;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(34,34,31,0.08)' }}
                  onClick={() => setSelected(c)}
                  style={{
                    minWidth: 260,
                    maxWidth: 280,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 20px 20px 24px',
                    boxShadow: 'var(--shadow-rest)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                    transition: 'box-shadow 200ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  {/* Rank badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: i < 3 ? 'var(--color-terracotta-700)' : 'var(--color-surface-sunken)',
                      color: i < 3 ? '#FAF7F2' : 'var(--color-ink-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    #{i + 1}
                  </div>

                  {/* Left accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: isCritical ? 'var(--color-severity-critical)' : accentColor,
                      borderRadius: '12px 0 0 12px',
                    }}
                  />

                  {/* Category icon */}
                  <div style={{ marginBottom: 10 }}>
                    <CategoryIcon category={c.category} size={24} color={accentColor} />
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      textTransform: 'capitalize',
                      marginBottom: 4,
                    }}
                  >
                    {(c.category || '').replace(/_/g, ' ')}
                  </div>

                  {/* Location */}
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-ink-muted)',
                      marginBottom: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.ward_name || `Ward ${c.ward_id || 1}`}
                  </div>

                  {/* Priority score bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div
                      style={{
                        height: 6,
                        flex: 1,
                        background: 'var(--color-surface-sunken)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((c.severity_score || 0) / 100) * 100)}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 + 0.1 }}
                        style={{ height: '100%', background: sevColor, borderRadius: 3 }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-ink-muted)',
                        flexShrink: 0,
                        fontWeight: 600,
                      }}
                    >
                      {c.severity_score || 0}
                    </span>
                  </div>

                  {/* Confirmation avatars */}
                  <ConfirmationAvatarStack count={c.confirmation_count || 1} size={22} />

                  {/* Recurring badge */}
                  {c.is_recurring && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--color-terracotta-100)',
                        color: 'var(--color-terracotta-700)',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      ↻ {c.total_cycles || 2}× in {c.months_span || 6}mo
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <ComplaintDetailDrawer
        complaint={selected}
        officers={officers}
        onClose={() => setSelected(null)}
        onUpdateStatus={async (id, status, officerId) => {
          await fetch(`${API_URL}/api/complaints/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, assigned_officer_id: officerId }),
          }).catch(() => {});
          setSelected(null);
        }}
        onResolve={async (id) => {
          await fetch(`${API_URL}/api/complaints/${id}/resolve`, { method: 'POST' }).catch(() => {});
          setSelected(null);
        }}
      />
    </>
  );
}
