'use client';

// F.5 — Hotspots Page (Spatial Defect & Urban Infrastructure Risk Console)
// High-Density Thermal Radar + Ranked Infrastructure Risk Intelligence Matrix (Zero generic card clutter)

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '@/components/MapView';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { getCategoryColor, getSeverityColor } from '@/components/CategoryIcon';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HotspotsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'recurring'>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'confirmations' | 'cycles'>('severity');

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

  // Filter & sort hotspots
  const filtered = safe.filter((c) => {
    if (filterSeverity === 'critical') return (c.severity_score || 0) >= 80;
    if (filterSeverity === 'recurring') return !!c.is_recurring;
    return true;
  });

  const sortedHotspots = [...filtered].sort((a, b) => {
    if (sortBy === 'confirmations') return (b.confirmation_count || 1) - (a.confirmation_count || 1);
    if (sortBy === 'cycles') return (b.total_cycles || 1) - (a.total_cycles || 1);
    return (b.severity_score || 0) - (a.severity_score || 0);
  });

  const criticalCount = safe.filter((c) => (c.severity_score || 0) >= 80).length;
  const recurringCount = safe.filter((c) => c.is_recurring).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1480px] mx-auto px-6 py-8"
      >
        {/* Header & Spatial Telemetry Strip */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-cp-border">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
                SPATIAL DEFECT INTELLIGENCE • POSTGIS 18M
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-cp-ink tracking-tight">
              Urban Problem Hotspots
            </h1>
            <p className="text-sm text-cp-muted mt-1 max-w-2xl">
              Spatial density analysis ranking infrastructure failure clusters by citizen verification density, recurrence rate, and composite risk index.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 bg-cp-surface p-2 rounded-xl border border-cp-border shadow-rest">
            <div className="px-3.5 py-1 border-r border-cp-border">
              <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Critical Clusters</div>
              <div className="text-xl font-mono font-bold text-red-700">{criticalCount} High Risk</div>
            </div>
            <div className="px-3.5 py-1">
              <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Chronic Recurring</div>
              <div className="text-xl font-mono font-bold text-amber-800">{recurringCount} Spots</div>
            </div>
          </div>
        </div>

        {/* Hero Thermal Density Map */}
        <div className="w-full rounded-2xl overflow-hidden border border-cp-border shadow-rest mb-8 bg-cp-surface">
          <div className="px-5 py-3 border-b border-cp-border bg-gradient-to-r from-cp-surface via-cp-surface to-cp-bg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-cp-ink font-bold">
                CITYWIDE DENSITY HEATMAP RADAR
              </span>
            </div>
            <span className="text-xs font-mono text-cp-muted">
              Interpolated Spatial Density • Zoom to Inspect
            </span>
          </div>
          <div className="h-[400px] w-full relative">
            <MapView complaints={sortedHotspots} onSelectComplaint={setSelected} height={400} showHeatmap />
          </div>
        </div>

        {/* Ranked Infrastructure Risk Intelligence Matrix (Zero repetitive cards) */}
        <div>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
                RANKED INFRASTRUCTURE RISK INDEX
              </span>
              <h2 className="text-xl font-display font-bold text-cp-ink mt-0.5">
                Top Chronic Civic Failure Points
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Buttons */}
              <div className="flex items-center bg-cp-surface p-1 rounded-lg border border-cp-border text-xs font-semibold">
                <button
                  onClick={() => setFilterSeverity('all')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    filterSeverity === 'all' ? 'bg-teal-700 text-white' : 'text-cp-muted hover:text-cp-ink'
                  }`}
                >
                  All Spots ({safe.length})
                </button>
                <button
                  onClick={() => setFilterSeverity('critical')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    filterSeverity === 'critical' ? 'bg-red-700 text-white' : 'text-cp-muted hover:text-cp-ink'
                  }`}
                >
                  Critical (80+)
                </button>
                <button
                  onClick={() => setFilterSeverity('recurring')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    filterSeverity === 'recurring' ? 'bg-amber-700 text-white' : 'text-cp-muted hover:text-cp-ink'
                  }`}
                >
                  Recurring Spots
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs font-mono text-cp-muted bg-cp-surface px-3 py-1.5 rounded-lg border border-cp-border">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-cp-ink focus:outline-none cursor-pointer"
                >
                  <option value="severity">Severity Score</option>
                  <option value="confirmations">Citizen Density</option>
                  <option value="cycles">Recurrence Cycles</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tactical Intelligence Leaderboard Matrix */}
          <div className="bg-cp-surface rounded-2xl border border-cp-border shadow-rest overflow-hidden">
            <div className="divide-y divide-cp-border">
              {sortedHotspots.map((c, i) => {
                const score = c.severity_score || 0;
                const isCritical = score >= 80;
                const isMedium = score >= 60 && score < 80;
                const accentColor = getCategoryColor(c.category);

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    onClick={() => setSelected(c)}
                    className="p-5 sm:px-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-cp-surface-hover cursor-pointer transition-all group"
                  >
                    {/* Rank & Problem Spot Info */}
                    <div className="flex items-start gap-4 min-w-[320px]">
                      <div
                        className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                          i < 3
                            ? 'bg-red-700 text-white ring-2 ring-red-200'
                            : isCritical
                            ? 'bg-red-100 text-red-800'
                            : 'bg-cp-bg text-cp-muted border border-cp-border'
                        }`}
                      >
                        #{i + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }}
                            className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
                          >
                            {(c.category || '').replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-mono text-cp-faint">
                            #{c.id}
                          </span>
                          {c.is_recurring && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              ⚠️ {c.total_cycles || 2}× Recurring
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-cp-ink group-hover:text-teal-800 transition-colors line-clamp-1">
                          {c.description}
                        </h3>

                        <div className="text-xs text-cp-muted font-mono mt-1 flex items-center gap-2">
                          <span>📍 {c.ward_name || `Ward ${c.ward_id || 1}`}</span>
                          <span>•</span>
                          <span className="text-cp-faint">{c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Urgency Score & Multi-segment Meter */}
                    <div className="flex-1 max-w-sm">
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="font-semibold text-cp-muted">Urgency Risk Rating</span>
                        <span className={`font-bold ${isCritical ? 'text-red-700' : isMedium ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {score} / 100
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-cp-bg rounded-full overflow-hidden p-0.5 border border-cp-border">
                        <div
                          style={{ width: `${Math.min(100, score)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-gradient-to-r from-amber-500 to-red-600' : 'bg-gradient-to-r from-teal-600 to-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Citizen Density & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-cp-border">
                      <div className="text-left lg:text-right">
                        <div className="text-xs font-mono uppercase text-cp-muted font-semibold">Verification Density</div>
                        <div className="text-sm font-mono font-bold text-cp-ink flex items-center lg:justify-end gap-1.5 mt-0.5">
                          <span>👥 {c.confirmation_count || 1} citizens</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(c);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cp-bg group-hover:bg-teal-700 group-hover:text-white border border-cp-border group-hover:border-teal-700 text-xs font-semibold text-cp-ink transition-all shadow-xs"
                      >
                        Inspect Spot →
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
