'use client';

// F.3 — Task Queue Table/Grid
// Civic Operations Command — Dynamic Task Queue Table & Interactive Grid
// Multi-segment priority meters + Forensic status transitions + Instant Dispatch trigger

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Complaint } from '@/types';
import { getCategoryColor } from './CategoryIcon';

interface TaskQueueTableProps {
  complaints: Complaint[];
  onSelect?: (c: Complaint) => void;
  newIds?: number[];
}

type SortKey = 'priority' | 'newest' | 'confirmed' | 'oldest';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'priority', label: '⚡ Priority Score ▾' },
  { key: 'newest',   label: '🕒 Newest First' },
  { key: 'confirmed',label: '👥 Most Confirmed' },
  { key: 'oldest',   label: '⏳ Longest Pending' },
];

function sortComplaints(complaints: Complaint[], key: SortKey): Complaint[] {
  const arr = [...complaints];
  switch (key) {
    case 'priority':  return arr.sort((a, b) => (b.severity_score || 0) - (a.severity_score || 0));
    case 'newest':    return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'confirmed': return arr.sort((a, b) => (b.confirmation_count || 0) - (a.confirmation_count || 0));
    case 'oldest':    return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    default:          return arr;
  }
}

export const TaskQueueTable: React.FC<TaskQueueTableProps> = ({ complaints, onSelect, newIds = [] }) => {
  const safe = Array.isArray(complaints) ? complaints : [];
  const [sort, setSort] = useState<SortKey>('priority');
  const [view, setView] = useState<'table' | 'grid'>('table');

  const sorted = sortComplaints(safe, sort);

  return (
    <div className="flex flex-col gap-4">
      {/* Control Bar: Sort & View Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-cp-muted uppercase font-bold mr-1">Sort:</span>
          {SORT_OPTIONS.map((opt) => {
            const isActive = sort === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-cp-surface text-cp-muted border border-cp-border hover:bg-cp-surface-hover hover:text-cp-ink'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-cp-surface p-1 rounded-lg border border-cp-border">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              view === 'table' ? 'bg-teal-700 text-white shadow-xs' : 'text-cp-muted hover:text-cp-ink'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              view === 'grid' ? 'bg-teal-700 text-white shadow-xs' : 'text-cp-muted hover:text-cp-ink'
            }`}
          >
            Tactical Cards
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-cp-surface rounded-2xl border border-cp-border shadow-rest overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-cp-bg border-b border-cp-border text-[11px] font-mono uppercase tracking-wider text-cp-muted font-bold">
                <tr>
                  <th className="px-6 py-4">Ticket & Category</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Priority Urgency</th>
                  <th className="px-4 py-4">Jurisdiction Ward</th>
                  <th className="px-4 py-4">Citizen Density</th>
                  <th className="px-4 py-4">Reported</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cp-border">
                {sorted.map((c) => {
                  const score = c.severity_score || 0;
                  const isCritical = score >= 80;
                  const isMedium = score >= 55 && score < 80;
                  const accentColor = getCategoryColor(c.category);
                  const isFresh = newIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelect?.(c)}
                      className={`hover:bg-cp-surface-hover cursor-pointer transition-all ${
                        isFresh ? 'bg-teal-50/80 animate-pulse' : ''
                      }`}
                    >
                      {/* ID & Category */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-cp-ink capitalize text-sm">
                                {(c.category || '').replace(/_/g, ' ')}
                              </span>
                              <span className="font-mono text-[11px] text-cp-faint font-semibold">
                                #{c.id}
                              </span>
                              {c.is_recurring && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  ↻ Recurring ({c.total_cycles}×)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-cp-muted line-clamp-1 max-w-md mt-0.5 font-normal">
                              {c.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                            c.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : c.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : c.status === 'Assigned'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-600'
                                : c.status === 'In Progress'
                                ? 'bg-amber-500'
                                : 'bg-slate-500'
                            }`}
                          />
                          {c.status}
                        </span>
                      </td>

                      {/* Priority Score Bar */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 max-w-[130px]">
                          <div className="flex-1 h-2 bg-cp-bg rounded-full overflow-hidden border border-cp-border">
                            <div
                              style={{ width: `${Math.min(100, score)}%` }}
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-red-600' : isMedium ? 'bg-amber-500' : 'bg-teal-600'
                              }`}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isCritical ? 'text-red-700' : 'text-cp-ink'
                            }`}
                          >
                            {score}
                          </span>
                        </div>
                      </td>

                      {/* Ward */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-cp-ink bg-cp-bg px-2.5 py-1 rounded-md border border-cp-border text-[11px]">
                          📍 {c.ward_name || `Ward ${c.ward_id || 1}`}
                        </span>
                      </td>

                      {/* Citizen Confirmations */}
                      <td className="px-4 py-4">
                        <span className="font-mono font-bold text-cp-ink text-xs bg-cp-bg px-2 py-0.5 rounded border border-cp-border">
                          👥 {c.confirmation_count || 1} verified
                        </span>
                      </td>

                      {/* Reported Date */}
                      <td className="px-4 py-4 font-mono text-[11px] text-cp-muted">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(c);
                          }}
                          className="px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-700 hover:text-white transition-all shadow-2xs"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sorted.map((c) => {
              const score = c.severity_score || 0;
              const isCritical = score >= 80;
              const accentColor = getCategoryColor(c.category);

              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => onSelect?.(c)}
                  className="bg-cp-surface p-5 rounded-2xl border border-cp-border shadow-rest hover:shadow-hover hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}30` }}
                        className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border"
                      >
                        {(c.category || '').replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-xs font-bold text-cp-faint">
                        #{c.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-cp-ink mb-1.5 line-clamp-2">
                      {c.description}
                    </h3>

                    <div className="text-xs text-cp-muted font-mono mb-3">
                      📍 {c.ward_name || `Ward ${c.ward_id || 1}`}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-cp-border flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cp-ink">
                      👥 {c.confirmation_count || 1} confirmed
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        isCritical ? 'bg-red-100 text-red-800' : 'bg-teal-50 text-teal-800'
                      }`}
                    >
                      Score: {score}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="text-center py-16 text-cp-faint font-body text-sm bg-cp-surface rounded-2xl border border-cp-border">
          No complaints matching the active criteria.
        </div>
      )}
    </div>
  );
};
