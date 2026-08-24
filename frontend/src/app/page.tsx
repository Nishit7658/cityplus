'use client';

// F.1 — Overview Page (Civic Control Wall)
// Asymmetric Bento Grid: Hero Live Map + Today's Signal + Category Breakdown + Recurring Alerts + Recent Activity

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapView } from '@/components/MapView';
import { StatCard } from '@/components/StatCard';
import { RecurringAlertCard } from '@/components/RecurringAlertCard';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { getCategoryColor } from '@/components/CategoryIcon';
import { useSocket } from '@/components/SocketProvider';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function OverviewPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const { lastEvent } = useSocket();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/complaints`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${API_URL}/api/officers`)
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([c, o]) => {
      if (Array.isArray(c) && c.length > 0) setComplaints(c);
      if (Array.isArray(o) && o.length > 0) setOfficers(o);
    });
  }, []);

  useEffect(() => {
    if (lastEvent?.type === 'new_complaint') {
      const nc = lastEvent.data as Complaint;
      setComplaints((prev) => [nc, ...prev]);
    }
  }, [lastEvent]);

  const safe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;
  const pending = safe.filter((c) => c.status === 'Pending');
  const inProgress = safe.filter((c) => c.status === 'In Progress' || c.status === 'Assigned');
  const resolved = safe.filter((c) => c.status === 'Resolved');
  const recurring = safe.filter((c) => c.is_recurring);

  // Category breakdown
  const catCounts: Record<string, number> = {};
  safe.forEach((c) => {
    const k = (c.category || 'other').replace(/_/g, ' ');
    catCounts[k] = (catCounts[k] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts).sort(([, a], [, b]) => b - a).slice(0, 7);
  const maxCat = catEntries[0]?.[1] || 1;

  const sparkData = [12, 18, 14, 22, 28, 24, safe.length];

  return (
    <>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '28px 40px 60px',
          position: 'relative',
        }}
      >
        {/* E.4 — Ward silhouette watermark */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <svg
            width="700"
            height="500"
            viewBox="0 0 600 400"
            style={{ position: 'absolute', top: '5%', left: '3%', opacity: 0.035 }}
            fill="var(--color-teal-700)"
          >
            <path d="M100,200 L200,100 L350,80 L480,150 L520,280 L400,380 L250,360 L120,320 Z" />
            <path d="M200,100 L280,50 L350,80 Z" />
            <path d="M350,80 L420,60 L480,150 Z" />
          </svg>
        </div>

        {/* Bento Grid */}
        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Row: Hero Map (7 cols) + Today's Signal (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Live Map (Hero) — span 7 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden border border-cp-border bg-cp-surface shadow-rest"
              style={{ minHeight: 490 }}
            >
              <div className="px-5 py-3 border-b border-cp-border bg-cp-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-pulse" />
                  <span
                    style={{
                      fontSize: 'var(--fs-eyebrow)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    VMC LIVE CIVIC RADAR
                  </span>
                </div>
                <span className="text-xs text-cp-muted font-mono font-medium">
                  {safe.length} citywide problem spots
                </span>
              </div>
              <div className="flex-1 relative" style={{ minHeight: 440 }}>
                <MapView complaints={safe} onSelectComplaint={setSelected} height="100%" />
              </div>
            </motion.div>

            {/* TODAY'S SIGNAL (Stats) — span 5 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex flex-col gap-4"
            >
              {/* Header card with Hero Stat */}
              <div className="bg-cp-surface border border-cp-border rounded-lg p-5 shadow-rest flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      fontSize: 'var(--fs-eyebrow)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    TODAY'S SIGNAL
                  </span>
                  <span className="text-xs font-mono text-cp-muted">Vadodara Municipal</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <span
                      style={{
                        fontSize: 'var(--fs-display-xl)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: 'var(--color-ink)',
                        lineHeight: 1,
                      }}
                    >
                      {safe.length}
                    </span>
                    <span className="ml-3 text-sm text-cp-muted font-body">active tickets</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-sev-critical">
                    <span>▲ +14%</span>
                    <span className="text-cp-faint font-normal">vs avg</span>
                  </div>
                </div>
              </div>

              {/* 3 Sub-stat cards in a row/grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <StatCard
                  eyebrow="Pending"
                  value={pending.length}
                  trend={{ direction: 'down', percent: 8, positive: true }}
                />
                <StatCard
                  eyebrow="In Action"
                  value={inProgress.length}
                />
                <StatCard
                  eyebrow="Resolved"
                  value={resolved.length}
                  trend={{ direction: 'up', percent: 23, positive: true }}
                  sparklineData={[10, 14, 12, 18, 22, 19, resolved.length || 1]}
                />
              </div>

              {/* Citizen Verification Highlight */}
              <div
                className="rounded-lg p-4 flex items-center justify-between border"
                style={{
                  background: 'linear-gradient(135deg, var(--color-teal-100) 0%, #FFFFFF 100%)',
                  borderColor: 'var(--color-teal-200)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-mono font-bold text-xs">
                    94%
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-cp-ink uppercase tracking-wider">
                      Closed-Loop Citizen Verification
                    </div>
                    <div className="text-xs text-cp-muted">
                      Citizens verify resolution via WhatsApp
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal-700 font-bold">ACTIVE</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Category Breakdown (4) + Recurring Alerts (4) + Recent Activity (4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
            {/* CATEGORY BREAKDOWN — span 4 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-cp-surface border border-cp-border rounded-lg p-6 shadow-rest flex flex-col"
              style={{ minHeight: 380 }}
            >
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
                WHAT NEEDS ATTENTION
              </p>
              <div className="flex flex-col gap-3.5 flex-1 justify-around">
                {catEntries.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getCategoryColor(cat.replace(/\s+/g, '_')),
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-xs font-medium text-cp-ink capitalize min-w-[110px] truncate">
                      {cat}
                    </span>
                    <div className="flex-1 h-2 bg-cp-sunken rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCat) * 100}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        style={{
                          height: '100%',
                          background: getCategoryColor(cat.replace(/\s+/g, '_')),
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-cp-muted min-w-[24px] text-right font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RECURRING ALERTS — span 4 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 flex flex-col gap-3"
              style={{ minHeight: 380 }}
            >
              <p
                style={{
                  fontSize: 'var(--fs-eyebrow)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-ink-muted)',
                  fontWeight: 600,
                }}
              >
                RECURRING ALERTS
              </p>
              <div className="flex flex-col gap-3 flex-1">
                {recurring.slice(0, 2).map((c) => (
                  <RecurringAlertCard key={c.id} complaint={c} onClick={() => setSelected(c)} />
                ))}
                {recurring.length === 0 && (
                  <div className="bg-cp-surface border border-cp-border rounded-lg p-6 text-center text-sm text-cp-faint flex items-center justify-center flex-1">
                    No recurring problem spots detected.
                  </div>
                )}
              </div>
            </motion.div>

            {/* RECENT ACTIVITY — span 4 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-cp-surface border border-cp-border rounded-lg p-6 shadow-rest flex flex-col"
              style={{ minHeight: 380 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  style={{
                    fontSize: 'var(--fs-eyebrow)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-ink-muted)',
                    fontWeight: 600,
                  }}
                >
                  RECENT ACTIVITY
                </p>
                <span className="text-xs font-mono text-teal-700 font-semibold">LIVE</span>
              </div>
              <div className="overflow-y-auto flex-1 flex flex-col gap-2 max-h-[300px] pr-1">
                <AnimatePresence>
                  {safe.slice(0, 8).map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelected(c)}
                      className="flex gap-3 items-center cursor-pointer p-2 rounded-md hover:bg-cp-sunken transition-colors"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: getCategoryColor(c.category),
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-cp-ink capitalize truncate">
                          {(c.category || '').replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-cp-muted font-mono truncate">
                          {c.ward_name || `Ward ${c.ward_id || 1}`} · {timeAgo(c.created_at)}
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            c.status === 'Resolved'
                              ? 'var(--color-tint-low)'
                              : 'var(--color-tint-pending)',
                          color:
                            c.status === 'Resolved'
                              ? 'var(--color-status-resolved)'
                              : 'var(--color-status-pending)',
                        }}
                      >
                        {c.status}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

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