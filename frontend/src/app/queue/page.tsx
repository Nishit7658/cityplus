'use client';

// F.3 — Complaint Queue Page (Official Municipal Grievance Queue)
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// High-contrast status filters, formal queue ledger, and direct officer dispatch

import React, { useEffect, useState } from 'react';
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
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['Pending', 'Assigned', 'In Progress', 'Resolved']);
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
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
        {/* Official Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Vadodara Municipal Corporation</span>
              <span>•</span>
              <span>Central Grievance Redressal Queue</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
              Municipal Work Orders & Citizen Task Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active intake queue for zonal triage, priority escalation, and field engineering dispatch.
            </p>
          </div>

          {/* Status Counts HUD */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex-wrap">
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">Pending</span>
              <span className="font-mono font-bold text-slate-900 text-base">{pending}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">Assigned</span>
              <span className="font-mono font-bold text-[#1E40AF] text-base">{assigned}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">In Progress</span>
              <span className="font-mono font-bold text-[#B45309] text-base">{inProgress}</span>
            </div>
            <div className="px-3 py-1 text-xs">
              <span className="text-slate-500 block">Resolved</span>
              <span className="font-mono font-bold text-[#15803D] text-base">{resolved}</span>
            </div>
          </div>
        </div>

        {/* High-Visibility Status Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider">
              Filter by Status:
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStatuses(['Pending', 'Assigned', 'In Progress', 'Resolved'])}
              className="text-xs font-semibold text-[#133E87] hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveStatuses([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Queue Table */}
        <TaskQueueTable complaints={filtered} onSelect={setSelected} newIds={newIds} />
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
