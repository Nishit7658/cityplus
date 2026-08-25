'use client';

// C.3 / D.1 — Redesigned High-Authority Overview Dashboard
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Full Trilingual support + Connected WardContext & Real-time Socket Event Bus

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { MapView } from '@/components/MapView';
import { CategoryIcon } from '@/components/CategoryIcon';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function timeAgo(dateString: string, lang: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);

  if (lang === 'gu') {
    if (h > 24) return `${Math.floor(h / 24)} દિવસ પહેલા`;
    if (h > 0) return `${h} કલાક પહેલા`;
    return `${m} મિનિટ પહેલા`;
  }
  if (lang === 'hi') {
    if (h > 24) return `${Math.floor(h / 24)} दिन पहले`;
    if (h > 0) return `${h} घंटे पहले`;
    return `${m} मिनट पहले`;
  }
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function OverviewPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const { lastEvent } = useSocket();
  const { language, t } = useLanguage();
  const { selectedWard } = useWard();

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

  // Complete Socket Event Synchronization
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'new_complaint' || lastEvent.type === 'complaint:created') {
      const nc = lastEvent.data as Complaint;
      if (nc && nc.id) {
        setComplaints((prev) => [nc, ...prev.filter((c) => c.id !== nc.id)]);
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

  // Filter by Global WardContext
  const safe = selectedWard === 'all'
    ? rawSafe
    : rawSafe.filter((c) => String(c.ward_id) === String(selectedWard));

  const pending = safe.filter((c) => c.status === 'Pending');
  const inProgress = safe.filter((c) => c.status === 'In Progress' || c.status === 'Assigned');
  const resolved = safe.filter((c) => c.status === 'Resolved');

  // Department counts
  const catCounts: Record<string, number> = {};
  safe.forEach((c) => {
    const k = c.category || 'other';
    catCounts[k] = (catCounts[k] || 0) + 1;
  });

  const criticalIssues = safe.filter((c) => (c.severity_score || 0) >= 80 && c.status !== 'Resolved');

  return (
    <>
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
        {/* Section 1: Executive KPI Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Registered */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.total_logged')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {selectedWard === 'all' ? t('vmc.all_wards') : `${t('queue.th_ward')} ${selectedWard}`}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight">
                {safe.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('overview.logged_24h')}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#133E87] rounded-full w-full" />
            </div>
          </div>

          {/* Card 2: Pending Zonal Triage */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.pending_triage')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {t('overview.needs_action')}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#B45309] font-mono tracking-tight">
                {pending.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('overview.unassigned')}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${safe.length ? (pending.length / safe.length) * 100 : 0}%` }}
                className="h-full bg-[#B45309] rounded-full"
              />
            </div>
          </div>

          {/* Card 3: Field Crew In Progress */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.active_works')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {t('overview.dispatched')}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1E40AF] font-mono tracking-tight">
                {inProgress.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('overview.crew_on_ground')}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${safe.length ? (inProgress.length / safe.length) * 100 : 0}%` }}
                className="h-full bg-[#1E40AF] rounded-full"
              />
            </div>
          </div>

          {/* Card 4: Verified Resolved */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.citizen_verified')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {t('overview.sla_compliant')}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#15803D] font-mono tracking-tight">
                {resolved.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {safe.length ? Math.round((resolved.length / safe.length) * 100) : 0}% {t('overview.rate')}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${safe.length ? (resolved.length / safe.length) * 100 : 0}%` }}
                className="h-full bg-[#15803D] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Critical Flash Alerts Banner */}
        {criticalIssues.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#B91C1C] animate-ping shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#B91C1C]">
                  {t('overview.critical_banner')} ({criticalIssues.length} {t('overview.spots')})
                </h2>
                <p className="text-xs text-red-900 mt-0.5">
                  {t('overview.critical_sub')}
                </p>
              </div>
            </div>
            <Link
              href="/queue"
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-[#B91C1C] hover:bg-red-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {t('overview.open_triage')} →
            </Link>
          </div>
        )}

        {/* Section 3: Dual Command Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: GIS Live Situational Map */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#133E87]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                  {t('overview.gis_title')}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {safe.length} {t('overview.geo_pinned')}
              </span>
            </div>
            <div className="h-[460px] w-full relative">
              <MapView
                complaints={safe}
                onSelectComplaint={setSelected}
                height={460}
              />
            </div>
          </div>

          {/* Right 4 Cols: Live Incoming Citizen Grievance Stream */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                {t('overview.live_feed')}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ● {t('overview.sync')}
              </span>
            </div>

            <div className="p-3 divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {safe.slice(0, 8).map((c) => {
                const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
                const statusKey = (c.status || '').toLowerCase().replace(/ /g, '_');
                const statusLabel = t(`status.${statusKey}`, c.status);
                const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="py-3 px-2 hover:bg-slate-50 rounded cursor-pointer transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        <CategoryIcon category={c.category} size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#0B2545] capitalize">
                            {catLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            #{c.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                          {c.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                          <span>📍 {wardLabel}</span>
                          <span>•</span>
                          <span>{timeAgo(c.created_at, language)}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : c.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ComplaintDetailDrawer
        complaint={selected}
        officers={officers}
        onClose={() => setSelected(null)}
        onUpdateStatus={async (id, status, officerId) => {
          const res = await fetch(`${API_URL}/api/complaints/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, assigned_officer_id: officerId }),
          });
          if (!res.ok) throw new Error('Update failed');
          const updated = await res.json();
          setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
          setSelected(null);
        }}
        onResolve={async (id, officerId) => {
          const res = await fetch(`${API_URL}/api/complaints/${id}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ officer_id: officerId }),
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