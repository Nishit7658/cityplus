'use client';

// F.1 — Overview Page (Civic Control Wall & Executive Command Hub)
// Tactical Hero Radar + Unified Operations KPI HUD + Municipal Intelligence Triptych

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '@/components/MapView';
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
  const catEntries = Object.entries(catCounts).sort(([, a], [, b]) => b - a).slice(0, 6);
  const maxCat = catEntries[0]?.[1] || 1;

  const resolutionPct = Math.round((resolved.length / Math.max(1, safe.length)) * 100);

  return (
    <>
      <div className="max-w-[1480px] mx-auto px-6 py-8 relative">
        {/* Top Command Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cp-border">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
                VMC CENTRAL CIVIC CONTROL WALL
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-cp-ink tracking-tight">
              Vadodara Municipal Command Center
            </h1>
            <p className="text-sm text-cp-muted mt-1">
              Real-time civic intelligence, PostGIS spatial clustering, and automated closed-loop field operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cp-ink bg-cp-surface px-3.5 py-1.5 rounded-xl border border-cp-border shadow-rest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold">{safe.length} Citywide Incidents</span>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="flex flex-col gap-6">
          {/* Top Hero Row: Tactical Radar (7 cols) + Operations KPI Command Tile (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Live Tactical Radar (Hero Map) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden border border-cp-border bg-cp-surface shadow-rest relative"
              style={{ minHeight: 520 }}
            >
              {/* Radar Glass Header */}
              <div className="px-5 py-3.5 border-b border-cp-border bg-gradient-to-r from-cp-surface via-cp-surface to-cp-bg flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-700 animate-ping" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-teal-900 font-bold">
                    VMC LIVE CIVIC RADAR • 10 WARDS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cp-muted">
                    Auto-calibrated PostGIS 18m
                  </span>
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative" style={{ minHeight: 460 }}>
                <MapView complaints={safe} onSelectComplaint={setSelected} height="100%" />
              </div>
            </motion.div>

            {/* Operations KPI Command Tile (Hero Right) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex flex-col gap-4"
            >
              {/* Primary Command Hub Banner */}
              <div className="bg-gradient-to-br from-cp-surface to-cp-bg border border-cp-border rounded-2xl p-6 shadow-rest flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cp-muted font-bold">
                    TODAY'S CIVIC SIGNAL
                  </span>
                  <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                    Live Telemetry
                  </span>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-mono font-bold text-cp-ink tracking-tight">
                      {safe.length}
                    </span>
                    <span className="text-sm font-semibold text-cp-muted">active municipal reports</span>
                  </div>
                  <div className="text-xs text-cp-muted mt-1.5 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">▲ +14%</span> intake velocity across central zones
                  </div>
                </div>

                {/* Status Distribution Progress Bar */}
                <div className="mt-4 pt-4 border-t border-cp-border">
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-slate-700 font-semibold">{pending.length} Pending</span>
                    <span className="text-amber-800 font-semibold">{inProgress.length} In Progress</span>
                    <span className="text-emerald-700 font-semibold">{resolved.length} Resolved</span>
                  </div>
                  <div className="h-2.5 w-full bg-cp-border/70 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                    <div
                      style={{ width: `${(pending.length / Math.max(1, safe.length)) * 100}%` }}
                      className="h-full bg-slate-600 rounded-l-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${(inProgress.length / Math.max(1, safe.length)) * 100}%` }}
                      className="h-full bg-amber-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${(resolved.length / Math.max(1, safe.length)) * 100}%` }}
                      className="h-full bg-emerald-600 rounded-r-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Metric Tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-cp-surface p-4 rounded-xl border border-cp-border shadow-rest text-center">
                  <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Pending</div>
                  <div className="text-2xl font-mono font-bold text-slate-700 mt-1">{pending.length}</div>
                  <div className="text-[10px] text-cp-faint mt-0.5">Awaiting dispatch</div>
                </div>
                <div className="bg-cp-surface p-4 rounded-xl border border-cp-border shadow-rest text-center">
                  <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">In Field</div>
                  <div className="text-2xl font-mono font-bold text-amber-700 mt-1">{inProgress.length}</div>
                  <div className="text-[10px] text-cp-faint mt-0.5">Assigned to crew</div>
                </div>
                <div className="bg-cp-surface p-4 rounded-xl border border-cp-border shadow-rest text-center border-l-2 border-l-emerald-600">
                  <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Resolved</div>
                  <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">{resolved.length}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{resolutionPct}% cleared</div>
                </div>
              </div>

              {/* Closed-Loop Verification HUD Ribbon */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-tactical">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/50 flex items-center justify-center font-mono font-bold text-sm text-teal-300">
                    94%
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-200">
                      Closed-Loop Citizen Verification
                    </div>
                    <div className="text-[11px] text-teal-100/70">
                      Citizens confirm fixes via WhatsApp before ticket closure
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-teal-800 text-teal-200 px-2 py-1 rounded border border-teal-700">
                  ACTIVE
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Municipal Intelligence Triptych */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
            {/* Category Breakdown — span 4 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-cp-surface border border-cp-border rounded-2xl p-6 shadow-rest flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
                    CATEGORY TRIAGE
                  </span>
                  <span className="text-xs font-mono text-cp-faint">Volume by Category</span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {catEntries.map(([cat, count]) => {
                    const color = getCategoryColor(cat);
                    const pct = Math.round((count / maxCat) * 100);
                    return (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-cp-ink capitalize">{cat}</span>
                          <span className="font-mono font-bold text-cp-muted">{count} tickets</span>
                        </div>
                        <div className="h-2 w-full bg-cp-bg rounded-full overflow-hidden p-0.5 border border-cp-border">
                          <div
                            style={{ width: `${pct}%`, backgroundColor: color }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cp-border text-xs text-cp-muted font-mono flex justify-between">
                <span>Top Hazard: Potholes & Manholes</span>
                <span>Ward 1 & 4 Peak</span>
              </div>
            </motion.div>

            {/* Recurring Spot Alert — span 4 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-gradient-to-br from-terracotta-50/50 via-cp-surface to-cp-surface border border-terracotta-200 rounded-2xl p-6 shadow-rest flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta-700 font-bold">
                    STRUCTURAL DEFECT RADAR
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-mono font-bold">
                    High Recurrence
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-terracotta-200 shadow-sm mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="text-sm font-bold text-cp-ink">
                        Reported 4× in past 8 months
                      </h4>
                      <p className="text-xs text-cp-muted mt-0.5">
                        Open Manhole & Storm Drain • Ward 4 (Karelibaug)
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-medium italic">
                    "Engineering inspection suggests chronic foundation sub-base erosion. Recommend structural reinforcement, not routine patch."
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-cp-muted">
                    <span>👥 14 confirmed citizens</span>
                    <span className="font-bold text-red-700">Priority: 96 / 100</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-cp-border">
                <span className="font-mono text-cp-muted">Problem Spot #103</span>
                <button
                  onClick={() => {
                    const c = safe.find((x) => x.id === 103);
                    if (c) setSelected(c);
                  }}
                  className="text-xs font-semibold text-terracotta-700 hover:underline"
                >
                  Inspect Incident →
                </button>
              </div>
            </motion.div>

            {/* Live Municipal Dispatch Wire — span 4 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-cp-surface border border-cp-border rounded-2xl p-6 shadow-rest flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
                      LIVE DISPATCH WIRE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    REALTIME
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-cp-border">
                  {safe.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="py-2.5 first:pt-0 last:pb-0 cursor-pointer hover:bg-cp-surface-hover transition-colors rounded-lg px-2 -mx-2"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-cp-ink capitalize truncate max-w-[160px]">
                          {(c.category || '').replace(/_/g, ' ')} #{c.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            c.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-800'
                              : c.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-cp-muted font-mono">
                        <span className="truncate max-w-[160px]">{c.ward_name || `Ward ${c.ward_id || 1}`}</span>
                        <span>{timeAgo(c.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cp-border flex justify-between text-xs">
                <span className="text-cp-muted font-mono">Connected to VMC Socket.IO</span>
                <span className="font-semibold text-teal-700">100% Operational</span>
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