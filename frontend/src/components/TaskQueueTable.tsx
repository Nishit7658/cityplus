'use client';

// F.3 — Task Queue Table/Grid
// Card grid view + table toggle, sort controls, sticky status summary

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Complaint } from '@/types';
import { ComplaintCard } from './ComplaintCard';

interface TaskQueueTableProps {
  complaints: Complaint[];
  onSelect?: (c: Complaint) => void;
  newIds?: number[];
}

type SortKey = 'priority' | 'newest' | 'confirmed' | 'oldest';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'priority', label: 'Priority Score ▾' },
  { key: 'newest',   label: 'Newest' },
  { key: 'confirmed',label: 'Most Confirmed' },
  { key: 'oldest',   label: 'Oldest' },
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
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const pending    = safe.filter(c => c.status === 'Pending').length;
  const assigned   = safe.filter(c => c.status === 'Assigned').length;
  const inProgress = safe.filter(c => c.status === 'In Progress').length;
  const resolved   = safe.filter(c => c.status === 'Resolved').length;

  const sorted = sortComplaints(safe, sort);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Sort controls + view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            style={{
              height: 36, padding: '0 14px',
              borderRadius: 'var(--radius-pill)',
              border: sort === opt.key ? 'none' : '1px solid var(--color-border)',
              background: sort === opt.key ? 'var(--color-teal-100)' : 'transparent',
              color: sort === opt.key ? 'var(--color-teal-900)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
              fontSize: 'var(--fs-body-sm)', fontWeight: 500,
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* View toggle */}
        {(['grid', 'table'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            title={v === 'grid' ? 'Card grid' : 'Table view'}
            style={{
              width: 36, height: 36,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: view === v ? 'var(--color-teal-100)' : 'transparent',
              color: view === v ? 'var(--color-teal-900)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {v === 'grid'
              ? <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></svg>
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="0" y1="2" x2="14" y2="2"/><line x1="0" y1="7" x2="14" y2="7"/><line x1="0" y1="12" x2="14" y2="12"/></svg>
            }
          </button>
        ))}
      </div>

      {/* Sticky status summary pill row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Pending', count: pending, color: 'var(--color-status-pending)' },
          { label: 'Assigned', count: assigned, color: 'var(--color-status-progress)' },
          { label: 'In Progress', count: inProgress, color: 'var(--color-status-progress)' },
          { label: 'Resolved', count: resolved, color: 'var(--color-status-resolved)' },
        ].map(s => (
          <span key={s.label} style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-ink-muted)' }}>
            <span style={{ fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)', fontSize: 15 }}>{s.count}</span>{' '}
            {s.label}
            {s !== [pending, assigned, inProgress, resolved].map((c, i) => ({ label: ['Pending','Assigned','In Progress','Resolved'][i], count: c, color: '' }))[3] && (
              <span style={{ marginLeft: 12, color: 'var(--color-border-strong)' }}>·</span>
            )}
          </span>
        ))}
      </div>

      {/* Card grid */}
      {view === 'grid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {sorted.map(c => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                isNew={newIds.includes(c.id)}
                onClick={() => onSelect?.(c)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                {['ID', 'Category', 'Status', 'Confirmations', 'Score', 'Ward', 'Reported'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', color: 'var(--color-ink-muted)', fontWeight: 600, fontSize: 'var(--fs-eyebrow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect?.(c)}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-sunken)',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--color-surface-sunken)')}
                >
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-faint)' }}>#{c.id}</td>
                  <td style={{ padding: '10px 12px', textTransform: 'capitalize', color: 'var(--color-ink)' }}>{(c.category || '').replace(/_/g, ' ')}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)', fontSize: 11 }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>{c.confirmation_count}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>{c.severity_score}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-ink-muted)' }}>{c.ward_name || `Ward ${c.ward_id}`}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-faint)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-ink-faint)', fontFamily: 'var(--font-body)' }}>
          No complaints in queue
        </div>
      )}
    </div>
  );
};
