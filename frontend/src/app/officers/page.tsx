'use client';

// F.6 — Officers Page
// Civic Command Center — Municipal Field Personnel Operations Roster
// Tactical Dossiers + Live Field Telemetry + Workload Capacity HUD + Interactive Dispatch Roster

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Officer } from '@/types';
import { MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  'All Departments',
  'Road & Building',
  'Drainage & Sewerage',
  'Solid Waste',
  'Electrical & Lighting',
  'Water Supply',
  'Sanitation',
];

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [viewMode, setViewMode] = useState<'tactical' | 'table'>('tactical');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/officers`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setOfficers(d);
      })
      .catch(() => {});
  }, []);

  const safe = Array.isArray(officers) ? officers : MOCK_OFFICERS;

  // Filter officers
  const filtered = safe.filter((o) => {
    const matchesDept =
      selectedDept === 'All Departments' ||
      (o.department || '').toLowerCase().includes(selectedDept.toLowerCase());
    const matchesSearch =
      (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.ward_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const totalActiveTasks = safe.reduce((acc, o) => acc + (o.active_complaints || 0), 0);
  const totalResolved = safe.reduce((acc, o) => acc + (o.resolved_complaints || 0), 0);
  const avgLoad = (totalActiveTasks / (safe.length || 1)).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[1480px] mx-auto px-6 py-8"
    >
      {/* Top Header & Telemetry HUD */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-cp-border">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
              VMC FIELD OPERATIONS ROSTER
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-cp-ink tracking-tight">
            Municipal Field Officers
          </h1>
          <p className="text-sm text-cp-muted mt-1 max-w-2xl">
            Live deployment radar, workload saturation metrics, and tactical jurisdiction dispatch for Vadodara Municipal Corporation.
          </p>
        </div>

        {/* Global HUD Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cp-surface p-3.5 rounded-xl border border-cp-border shadow-rest">
          <div className="px-3 py-1 border-r border-cp-border">
            <div className="text-[10px] font-mono uppercase text-cp-muted font-semibold">Active Force</div>
            <div className="text-xl font-mono font-bold text-cp-ink">{safe.length} Officers</div>
          </div>
          <div className="px-3 py-1 border-r border-cp-border">
            <div className="text-[10px] font-mono uppercase text-cp-muted font-semibold">Active Load</div>
            <div className="text-xl font-mono font-bold text-amber-700">{totalActiveTasks} Tasks</div>
          </div>
          <div className="px-3 py-1 border-r border-cp-border">
            <div className="text-[10px] font-mono uppercase text-cp-muted font-semibold">Avg Load / Off</div>
            <div className="text-xl font-mono font-bold text-teal-800">{avgLoad}</div>
          </div>
          <div className="px-3 py-1">
            <div className="text-[10px] font-mono uppercase text-cp-muted font-semibold">Total Cleared</div>
            <div className="text-xl font-mono font-bold text-emerald-700">{totalResolved}</div>
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Department Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          {DEPARTMENTS.map((dept) => {
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-sm ring-2 ring-teal-800/20'
                    : 'bg-cp-surface text-cp-muted border border-cp-border hover:bg-cp-surface-hover hover:text-cp-ink'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search officer or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 pl-8 text-xs rounded-lg border border-cp-border bg-cp-surface text-cp-ink placeholder:text-cp-faint focus:outline-none focus:border-teal-700 w-56 font-body"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cp-faint text-xs">🔍</span>
          </div>

          <div className="flex items-center bg-cp-surface p-1 rounded-lg border border-cp-border">
            <button
              onClick={() => setViewMode('tactical')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'tactical'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-cp-muted hover:text-cp-ink'
              }`}
            >
              Tactical Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-cp-muted hover:text-cp-ink'
              }`}
            >
              Roster Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Officers Display */}
      {viewMode === 'tactical' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((officer, i) => {
              const activeCount = officer.active_complaints || 0;
              const maxLoad = 10;
              const loadPercent = Math.min(100, Math.round((activeCount / maxLoad) * 100));

              const isHeavy = activeCount >= 7;
              const isModerate = activeCount >= 4 && activeCount < 7;
              const statusColor = isHeavy
                ? 'bg-red-50 text-red-700 border-red-200'
                : isModerate
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200';

              const statusText = isHeavy ? 'High Saturation' : isModerate ? 'Moderate Load' : 'Optimal Capacity';

              return (
                <motion.div
                  key={officer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                  className="bg-cp-surface rounded-xl border border-cp-border shadow-rest hover:shadow-hover hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Top Tactical Bar with Status Indicator */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-cp-border/60 bg-gradient-to-b from-cp-bg/50 to-transparent">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isHeavy ? 'bg-red-600' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cp-faint">
                      OFF-{String(officer.id).padStart(3, '0')}
                    </span>
                  </div>

                  {/* Officer Identity Banner */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-3.5 mb-4">
                      {/* Avatar with Initials */}
                      <div className="w-12 h-12 rounded-xl bg-teal-900 text-white font-mono font-bold flex items-center justify-center text-base shadow-sm shrink-0 border border-teal-700">
                        {(officer.name || '?')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      {/* Name & Dept */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-cp-ink truncate group-hover:text-teal-800 transition-colors">
                          {officer.name}
                        </h3>
                        <p className="text-xs text-cp-muted font-medium truncate mt-0.5">
                          {officer.department}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[11px] font-semibold text-cp-ink bg-cp-bg px-2 py-0.5 rounded border border-cp-border truncate">
                            📍 {officer.ward_name || `Ward ${officer.ward_id || 1}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Workload Capacity Meter */}
                    <div className="bg-cp-bg/80 rounded-lg p-3 border border-cp-border mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-cp-muted">Active Workload</span>
                        <span className="font-mono font-bold text-cp-ink">
                          {activeCount} / 10 <span className="text-[10px] text-cp-muted font-normal">({loadPercent}%)</span>
                        </span>
                      </div>

                      {/* Multi-segment load bar */}
                      <div className="h-2 rounded-full bg-cp-border overflow-hidden flex">
                        <div
                          style={{ width: `${loadPercent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHeavy ? 'bg-red-600' : isModerate ? 'bg-amber-500' : 'bg-teal-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Performance Indices */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-cp-border">
                      <div className="p-2 rounded bg-cp-surface">
                        <div className="text-[10px] font-mono uppercase text-cp-muted font-semibold">Lifetime Resolved</div>
                        <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5">
                          {officer.resolved_complaints || 0} issues
                        </div>
                      </div>
                      <div className="p-2 rounded bg-cp-surface">
                        <div className="text-[10px] font-mono uppercase text-cp-muted font-semibold">Avg Turnaround</div>
                        <div className="text-sm font-mono font-bold text-cp-ink mt-0.5">
                          {2.8 + (officer.id % 3) * 0.7} hrs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="mt-auto px-5 py-3 border-t border-cp-border bg-cp-bg/40 flex items-center justify-between">
                    <span className="text-xs font-mono text-cp-muted">
                      📞 {officer.phone || '+91 98250 00000'}
                    </span>
                    <a
                      href={`tel:${officer.phone}`}
                      className="px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
                    >
                      Dispatch
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Executive Command Table View */
        <div className="bg-cp-surface rounded-xl border border-cp-border shadow-rest overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cp-bg border-b border-cp-border text-[11px] font-mono uppercase tracking-wider text-cp-muted font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Officer & Designation</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Assigned Jurisdiction</th>
                  <th className="px-4 py-3.5">Workload Capacity</th>
                  <th className="px-4 py-3.5">Lifetime Resolved</th>
                  <th className="px-4 py-3.5">Direct Contact</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cp-border font-body">
                {filtered.map((officer) => {
                  const activeCount = officer.active_complaints || 0;
                  const loadPercent = Math.min(100, Math.round((activeCount / 10) * 100));

                  return (
                    <tr key={officer.id} className="hover:bg-cp-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {(officer.name || '?')
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-cp-ink">{officer.name}</div>
                            <div className="text-[11px] text-cp-muted font-mono">OFF-{String(officer.id).padStart(3, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-cp-muted font-medium">{officer.department}</td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-cp-ink bg-cp-bg px-2 py-0.5 rounded border border-cp-border">
                          {officer.ward_name || `Ward ${officer.ward_id}`}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 max-w-[140px]">
                          <div className="flex-1 h-1.5 rounded-full bg-cp-border overflow-hidden">
                            <div
                              style={{ width: `${loadPercent}%` }}
                              className={`h-full rounded-full ${
                                activeCount >= 7 ? 'bg-red-600' : activeCount >= 4 ? 'bg-amber-500' : 'bg-teal-600'
                              }`}
                            />
                          </div>
                          <span className="font-mono font-bold text-cp-ink text-[11px]">
                            {activeCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-emerald-700">
                        {officer.resolved_complaints || 0} issues
                      </td>
                      <td className="px-4 py-4 font-mono text-cp-muted">
                        {officer.phone || '+91 98250 00000'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`tel:${officer.phone}`}
                          className="px-3 py-1.5 rounded-md bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors"
                        >
                          Dispatch Task
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
