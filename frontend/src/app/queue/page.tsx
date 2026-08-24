'use client';

// F.3 — Complaint Queue Page
// Civic Command Center — Active Dispatch Workflow & SLA Tracking

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskQueueTable } from '@/components/TaskQueueTable';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { FilterPillRow, FilterOption } from '@/components/FilterPillRow';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_FILTERS: FilterOption[] = [
  { key: 'Pending',     label: 'Pending' },
  { key: 'Assigned',    label: 'Assigned' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Resolved',    label: 'Resolved' },
];

export default function QueuePage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['Pending', 'Assigned', 'In Progress']);
  const [newIds, setNewIds]         = useState<number[]>([]);
  const { lastEvent } = useSocket();

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

  // New complaint arrival
  useEffect(() => {
    if (lastEvent?.type === 'new_complaint') {
      const nc = lastEvent.data as Complaint;
      setComplaints((prev) => [nc, ...prev]);
      setNewIds((prev) => [...prev, nc.id]);
      setTimeout(() => setNewIds((prev) => prev.filter((id) => id !== nc.id)), 1600);
    }
  }, [lastEvent]);

  const safe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

  const filtered = safe.filter((c) =>
    activeStatuses.length === 0 || activeStatuses.includes(c.status)
  );

  const pending    = safe.filter((c) => c.status === 'Pending').length;
  const assigned   = safe.filter((c) => c.status === 'Assigned').length;
  const inProgress = safe.filter((c) => c.status === 'In Progress').length;
  const resolved   = safe.filter((c) => c.status === 'Resolved').length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1480px] mx-auto px-6 py-8"
      >
        {/* Top Header & Queue Telemetry */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-cp-border">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
                OPERATIONAL DISPATCH CONSOLE
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-cp-ink tracking-tight">
              Complaint Task Queue
            </h1>
            <p className="text-sm text-cp-muted mt-1 max-w-2xl">
              Live municipal task triage, priority re-scoring, and cross-departmental officer dispatch across Vadodara.
            </p>
          </div>

          {/* Status Counts HUD */}
          <div className="flex items-center gap-2 bg-cp-surface p-2 rounded-xl border border-cp-border shadow-rest flex-wrap">
            <div className="px-3 py-1 border-r border-cp-border">
              <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Pending</div>
              <div className="text-lg font-mono font-bold text-slate-700">{pending}</div>
            </div>
            <div className="px-3 py-1 border-r border-cp-border">
              <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Assigned</div>
              <div className="text-lg font-mono font-bold text-sky-800">{assigned}</div>
            </div>
            <div className="px-3 py-1 border-r border-cp-border">
              <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">In Action</div>
              <div className="text-lg font-mono font-bold text-amber-700">{inProgress}</div>
            </div>
            <div className="px-3 py-1">
              <div className="text-[10px] font-mono uppercase text-cp-muted font-bold">Resolved</div>
              <div className="text-lg font-mono font-bold text-emerald-700">{resolved}</div>
            </div>
          </div>
        </div>

        {/* Status filter chips */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-cp-muted font-bold">
            Filter Status:
          </span>
          <FilterPillRow
            options={STATUS_FILTERS.map((f) => ({
              ...f,
              count: safe.filter((c) => c.status === f.key).length,
            }))}
            active={activeStatuses}
            onToggle={(k) =>
              setActiveStatuses((prev) =>
                prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
              )
            }
          />
        </div>

        {/* Queue table/grid */}
        <TaskQueueTable complaints={filtered} onSelect={setSelected} newIds={newIds} />
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
