'use client';

// C.3 / D.1 — Executive Municipal Operations Command Center
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Unified Telemetry Command Bar, Clean Integrated Split Workspace, Zero Gradients, Zero Side Stripes

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { useAuth } from '@/context/AuthContext';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { ChronicEscalationDossier } from '@/components/ChronicEscalationDossier';
import { MapView } from '@/components/MapView';
import { CategoryIcon, getCategoryColor } from '@/components/CategoryIcon';
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
  const [dossierComplaint, setDossierComplaint] = useState<Complaint | null>(null);
  const { user, isAdmin, isDispatcher, isOfficer, isAuthenticated } = useAuth();
  const { lastEvent } = useSocket();
  const { language, t } = useLanguage();
  const { selectedWard, setSelectedWard } = useWard();

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

  // Auto-switch ward for Zonal Dispatcher
  useEffect(() => {
    if (isDispatcher && user?.ward_id) {
      setSelectedWard(String(user.ward_id));
    }
  }, [isDispatcher, user, setSelectedWard]);

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
        setComplaints((prev) => {
          const existing = prev.find((c) => c.id === updated.id);
          const merged = existing ? { ...existing, ...updated } : updated;
          return [merged, ...prev.filter((c) => c.id !== updated.id)];
        });
        if (selected && selected.id === updated.id) {
          setSelected((prev) => (prev ? { ...prev, ...updated } : null));
        }
        if (dossierComplaint && dossierComplaint.id === updated.id) {
          setDossierComplaint((prev) => (prev ? { ...prev, ...updated } : null));
        }
      }
    }
  }, [lastEvent, selected, dossierComplaint]);

  const rawSafe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

  // Filter by Global WardContext
  const safe = selectedWard === 'all'
    ? rawSafe
    : rawSafe.filter((c) => String(c.ward_id) === String(selectedWard));

  const pending = safe.filter((c) => c.status === 'Pending');
  const inProgress = safe.filter((c) => c.status === 'In Progress' || c.status === 'Assigned');
  const resolved = safe.filter((c) => c.status === 'Resolved');
  const criticalIssues = safe.filter((c) => (c.severity_score || 0) >= 80 && c.status !== 'Resolved');

  // Chronic overdue issues (>60-90 days or recurring cycles)
  const chronicComplaints = rawSafe.filter((c) => c.status !== 'Resolved' && (c.is_chronic_overdue || (c.days_unresolved || 0) >= 60 || (c.months_span || 1) >= 2));

  // Officer assigned tasks
  const myAssignedComplaints = rawSafe.filter((c) => c.assigned_officer_id === user?.id && c.status !== 'Resolved');

  return (
    <>
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
        {/* Role-Based Command Header Banner */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-extrabold text-sm shrink-0 uppercase">
                {user.role === 'admin' ? '👑' : user.role === 'dispatcher' ? '📡' : '👷'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#0B2545]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#133E87] bg-blue-50 px-2 py-0.2 rounded border border-blue-200 uppercase">
                    {user.role === 'admin' ? 'MAIN INCHARGE (CENTRAL COMMAND)' : user.role === 'dispatcher' ? `ZONAL SUPERVISOR (WARD ${user.ward_id || 1})` : 'FIELD ENGINEER'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user.role === 'admin' 
                    ? 'Citywide Operations Oversight • Chronic Grievance Escalation Control • Executive SLA Monitoring'
                    : user.role === 'dispatcher'
                    ? `Sayajigunj Zonal Redressal Cell • Ward ${user.ward_id || 1} Task Allocation & Supervisor Accountability`
                    : `${user.department} • Active Field Work Orders & Direct Repair Resolution Desk`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && chronicComplaints.length > 0 && (
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>{chronicComplaints.length} Chronic Overdue (&gt;2 Mo)</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Section 1: Executive Chronic Grievance Oversight Panel — Main Admin Portal Only */}
        {isAdmin && chronicComplaints.length > 0 && (
          <div className="mb-6 bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-[#B45309] flex items-center justify-center text-base shrink-0">
                  ⚖️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                      Executive Oversight • Chronic Grievance Review (&gt;60 Days)
                    </h2>
                    <span className="bg-amber-100 text-[#B45309] text-[10px] font-mono font-bold px-2 py-0.2 rounded border border-amber-200">
                      {chronicComplaints.length} Cases Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grievances exceeding municipal standard turnaround. Supervisory accountability logs track assigned field units and zonal supervisors.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chronicComplaints.map((c) => {
                const days = c.days_unresolved ?? Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000);
                const months = (days / 30).toFixed(1);
                const accentColor = getCategoryColor(c.category);

                return (
                  <div
                    key={c.id}
                    className="bg-slate-50/80 rounded-lg border border-slate-200 hover:border-slate-300 p-4 flex flex-col justify-between transition-colors shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-white border border-slate-200">
                            <CategoryIcon category={c.category} size={14} color={accentColor} />
                          </div>
                          <span className="text-xs font-bold text-[#0B2545] capitalize truncate">
                            {c.category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{c.id}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold bg-amber-50 text-[#B45309] border border-amber-200 px-2 py-0.5 rounded shrink-0">
                          {days}d active ({months} mo)
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-3 bg-white p-2.5 rounded border border-slate-200/80">
                        &quot;{c.description}&quot;
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">📍 Ward:</span>
                          <strong className="text-slate-900">{c.ward_name || `Ward ${c.ward_id}`}</strong>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">👥 Citizen Flags:</span>
                          <strong className="text-slate-800 font-mono">{c.confirmation_count || 1} people</strong>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">👷 Assigned Worker:</span>
                          <strong className="text-slate-900">{c.officer_name || 'Rajesh Patel'}</strong>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500 font-medium">📡 Zonal Supervisor:</span>
                          <span className="text-slate-700 font-medium truncate max-w-[140px]">{c.assigned_by_supervisor_name || 'Sayajigunj Zonal Dispatcher'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDossierComplaint(c)}
                        className="w-full py-2 px-3 rounded bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>📄</span>
                        <span>View Case Dossier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Officer Personalized Field Work Deck */}
        {isOfficer && (
          <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B2545] uppercase tracking-wider">
                  👷 My Active Field Work Orders ({myAssignedComplaints.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tasks assigned directly to you for field investigation, repair, and photographic resolution.
                </p>
              </div>
            </div>

            {myAssignedComplaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAssignedComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="p-4 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0B2545] capitalize">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          #{c.id} • {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mb-3 line-clamp-2">
                        {c.description}
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        📍 {c.ward_name || `Ward ${c.ward_id}`} • 👥 {c.confirmation_count || 1} Confirmations
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-[#133E87] font-bold">Open Action Drawer →</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                        Severity {c.severity_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                ✓ No pending tasks assigned to you. All assigned work orders are resolved!
              </div>
            )}
          </div>
        )}

        {/* Section 3: Unified Executive Telemetry Command Bar */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs mb-6 overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B2545]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                {t('vmc.title')} • {t('overview.gis_title')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">
                Jurisdiction: <strong className="text-[#0B2545]">{selectedWard === 'all' ? t('vmc.all_wards') : `${t('queue.th_ward')} ${selectedWard}`}</strong>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ● Live Operations
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* Metric 1: Total Intake */}
            <div className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.total_logged')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight">
                  {safe.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {t('overview.logged_24h')}
                </span>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-[#133E87]">
                100% Citywide Coverage
              </div>
            </div>

            {/* Metric 2: Pending Triage */}
            <div className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.pending_triage')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#B45309] font-mono tracking-tight">
                  {pending.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {t('overview.unassigned')}
                </span>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-[#B45309]">
                ⚡ Requires Dispatcher Review
              </div>
            </div>

            {/* Metric 3: Active Dispatches */}
            <div className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.active_works')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1E40AF] font-mono tracking-tight">
                  {inProgress.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {t('overview.crew_on_ground')}
                </span>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-[#1E40AF]">
                🛠️ Field Units Deployed
              </div>
            </div>

            {/* Metric 4: Verified Resolved */}
            <div className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('overview.citizen_verified')}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#15803D] font-mono tracking-tight">
                  {resolved.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {safe.length ? Math.round((resolved.length / safe.length) * 100) : 0}% {t('overview.rate')}
                </span>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-[#15803D]">
                ✓ Closed with Citizen Signoff
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: High-Priority Notice Banner */}
        {criticalIssues.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ⚠️
              </div>
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
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {t('overview.open_triage')} →
            </Link>
          </div>
        )}

        {/* Section 3: Dual Situational Command Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Full-Resolution GIS Cartography */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                {t('overview.gis_title')}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {safe.length} {t('overview.geo_pinned')}
              </span>
            </div>
            <div className="h-[480px] w-full relative">
              <MapView
                complaints={safe}
                onSelectComplaint={setSelected}
                onSelectWard={(wId) => setSelectedWard(String(wId))}
                selectedWard={selectedWard}
                height={480}
              />
            </div>
          </div>

          {/* Right 4 Cols: High-Density Live Grievance Activity Ledger */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[526px]">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                {t('overview.live_feed')}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {safe.length} items
              </span>
            </div>

            <div className="p-3 divide-y divide-slate-100 overflow-y-auto flex-1">
              {safe.slice(0, 10).map((c) => {
                const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
                const statusKey = (c.status || '').toLowerCase().replace(/ /g, '_');
                const statusLabel = t(`status.${statusKey}`, c.status);
                const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);
                const accentColor = getCategoryColor(c.category);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="py-3 px-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 p-1.5 rounded bg-slate-50 text-slate-700 border border-slate-200 shrink-0">
                        <CategoryIcon category={c.category} size={14} color={accentColor} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#0B2545] capitalize truncate">
                            {catLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            #{c.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
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

      {/* Chronic Issue Executive Accountability Dossier Modal */}
      <ChronicEscalationDossier
        complaint={dossierComplaint}
        officers={officers}
        onClose={() => setDossierComplaint(null)}
        onActionComplete={() => {
          fetch(`${API_URL}/api/complaints`)
            .then((r) => r.json())
            .then((d) => {
              if (Array.isArray(d)) setComplaints(d);
            })
            .catch(() => {});
        }}
      />
    </>
  );
}