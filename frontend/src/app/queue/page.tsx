'use client';

// F.3 — Task / Grievance Queue Page with Full Trilingual i18n, Filter Badges & Officer Filter
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TaskQueueTable } from '@/components/TaskQueueTable';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { Complaint, Officer } from '@/types';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StatusFilter {
  key: string;
  label: string;
}

function QueueContent() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [newIds, setNewIds] = useState<number[]>([]);
  const { lastEvent } = useSocket();
  const { t } = useLanguage();
  const { selectedWard } = useWard();
  const searchParams = useSearchParams();
  const router = useRouter();

  const officerIdParam = searchParams.get('officer_id');

  const STATUS_FILTERS: StatusFilter[] = [
    { key: 'Pending',     label: t('status.pending') },
    { key: 'Assigned',    label: t('status.assigned') },
    { key: 'In Progress', label: t('status.in_progress') },
    { key: 'Resolved',    label: t('status.resolved') },
  ];

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

  // Complete Socket Event Synchronization
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'new_complaint' || lastEvent.type === 'complaint:created') {
      const nc = lastEvent.data as Complaint;
      if (nc && nc.id) {
        setComplaints((prev) => [nc, ...prev.filter((c) => c.id !== nc.id)]);
        setNewIds((prev) => [...prev, nc.id]);
        setTimeout(() => setNewIds((prev) => prev.filter((id) => id !== nc.id)), 1600);
      }
    } else if (
      lastEvent.type === 'complaint_status_changed' ||
      lastEvent.type === 'complaint:updated' ||
      lastEvent.type === 'complaint:reopened' ||
      lastEvent.type === 'complaint_reopened'
    ) {
      const updated = lastEvent.data as Complaint;
      if (updated && updated.id) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        );
        if (selected && selected.id === updated.id) {
          setSelected((prev) => (prev ? { ...prev, ...updated } : null));
        }
      }
    }
  }, [lastEvent, selected]);

  const rawSafe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

  // Filter by Global WardContext & Officer Filter
  const safe = rawSafe
    .filter((c) => (selectedWard === 'all' ? true : String(c.ward_id) === String(selectedWard)))
    .filter((c) => (officerIdParam ? String(c.assigned_officer_id) === String(officerIdParam) : true));

  const filtered = safe.filter((c) =>
    activeStatuses.length === 0 || activeStatuses.includes(c.status)
  );

  const pending    = safe.filter((c) => c.status === 'Pending').length;
  const assigned   = safe.filter((c) => c.status === 'Assigned').length;
  const inProgress = safe.filter((c) => c.status === 'In Progress').length;
  const resolved   = safe.filter((c) => c.status === 'Resolved').length;

  const assignedOfficer = officerIdParam ? officers.find((o) => String(o.id) === String(officerIdParam)) : null;

  return (
    <>
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
        {/* Official Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>{t('vmc.title')}</span>
              <span>•</span>
              <span>{t('queue.title')}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
              {t('queue.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('queue.desc')}
            </p>
          </div>

          {/* Status Counts HUD */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex-wrap">
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">{t('status.pending')}</span>
              <span className="font-mono font-bold text-[#1E40AF] text-base">{pending}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">{t('status.assigned')}</span>
              <span className="font-mono font-bold text-[#B45309] text-base">{assigned}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">{t('status.in_progress')}</span>
              <span className="font-mono font-bold text-[#B45309] text-base">{inProgress}</span>
            </div>
            <div className="px-3 py-1 text-xs">
              <span className="text-slate-500 block">{t('status.resolved')}</span>
              <span className="font-mono font-bold text-[#15803D] text-base">{resolved}</span>
            </div>
          </div>
        </div>

        {/* Filter Pills with High-Contrast Border & Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <button
            onClick={() => setActiveStatuses([])}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border ${
              activeStatuses.length === 0
                ? 'bg-[#0B2545] text-white border-[#0B2545]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t('queue.all_items')} ({safe.length})
          </button>

          {STATUS_FILTERS.map((s) => {
            const active = activeStatuses.includes(s.key);
            const count = safe.filter((c) => c.status === s.key).length;

            return (
              <button
                key={s.key}
                onClick={() =>
                  setActiveStatuses((prev) =>
                    prev.includes(s.key) ? prev.filter((k) => k !== s.key) : [...prev, s.key]
                  )
                }
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#0B2545] text-white border-[#0B2545]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {assignedOfficer && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1 rounded text-xs font-semibold">
              <span>👤 Filtered by: <strong>{assignedOfficer.name}</strong> (#{assignedOfficer.id})</span>
              <button
                onClick={() => router.push('/queue')}
                className="text-blue-600 hover:text-blue-950 font-bold ml-1 cursor-pointer"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* Queue Table Container */}
        <TaskQueueTable
          complaints={filtered}
          onSelectComplaint={setSelected}
          newComplaintIds={newIds}
        />
      </div>

      <ComplaintDetailDrawer
        complaint={selected}
        officers={officers}
        onClose={() => setSelected(null)}
        onUpdateStatus={async (id, status, officerId, photoAfterUrl) => {
          const res = await fetch(`${API_URL}/api/complaints/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              assigned_officer_id: officerId,
              photo_after_url: photoAfterUrl,
            }),
          });
          if (!res.ok) throw new Error('Update failed');
          const updated = await res.json();
          setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
          setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updated } : updated));
        }}
        onResolve={async (id, officerId, photoAfterUrl) => {
          const res = await fetch(`${API_URL}/api/complaints/${id}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ officer_id: officerId, photo_after_url: photoAfterUrl }),
          });
          if (!res.ok) throw new Error('Resolve failed');
          const data = await res.json();
          const updated = data.complaint || { id, status: 'Resolved' };
          setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
          setSelected(null);
        }}
      />
    </>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500 font-mono">Loading Grievance Queue...</div>}>
      <QueueContent />
    </Suspense>
  );
}
