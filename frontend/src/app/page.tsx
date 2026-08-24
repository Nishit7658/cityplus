'use client';

// F.1 — Overview Page (Executive Municipal Control Room) with Trilingual i18n
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage, Language } from '@/context/LanguageContext';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function timeAgo(d: string, lang: Language) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
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

  // Department counts
  const catCounts: Record<string, number> = {};
  safe.forEach((c) => {
    const k = c.category || 'other';
    catCounts[k] = (catCounts[k] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts).sort(([, a], [, b]) => b - a).slice(0, 6);

  const resolutionPct = Math.round((resolved.length / Math.max(1, safe.length)) * 100);

  return (
    <>
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
        {/* Official Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>{t('vmc.gov_gujarat')}</span>
              <span>•</span>
              <span>{t('vmc.dept_name')}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
              {t('overview.title')}
            </h1>
          </div>

          {/* Official Portal Metadata Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-3.5 py-2 rounded border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500">{t('vmc.jurisdiction')}: </span>
              <span className="font-bold text-[#0B2545]">{t('vmc.all_wards')}</span>
            </div>
            <div className="bg-white px-3.5 py-2 rounded border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500">{t('vmc.system_status')}: </span>
              <span className="font-bold text-emerald-700">● {t('vmc.operational')}</span>
            </div>
          </div>
        </div>

        {/* 4 Primary Municipal KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              {t('overview.total_logged')}
            </div>
            <div className="text-3xl font-mono font-bold text-[#0B2545]">
              {safe.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {t('overview.total_logged_sub')}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#1E40AF]">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              {t('overview.pending_dispatch')}
            </div>
            <div className="text-3xl font-mono font-bold text-[#1E40AF]">
              {pending.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {t('overview.pending_dispatch_sub')}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#B45309]">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              {t('overview.active_progress')}
            </div>
            <div className="text-3xl font-mono font-bold text-[#B45309]">
              {inProgress.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {t('overview.active_progress_sub')}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#15803D]">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              {t('overview.closed_verified')}
            </div>
            <div className="text-3xl font-mono font-bold text-[#15803D]">
              {resolved.length} <span className="text-sm font-normal text-slate-500">({resolutionPct}%)</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {t('overview.closed_verified_sub')}
            </div>
          </div>
        </div>

        {/* Main Grid: GIS Map (7 cols) + Right Administrative Panel (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Live GIS Map Card */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#133E87]" />
                <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider">
                  {t('overview.gis_map_title')}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {t('overview.gis_map_sub')}
              </span>
            </div>
            <div className="flex-1 min-h-[460px] relative">
              <MapView complaints={safe} onSelectComplaint={setSelected} height="100%" />
            </div>
          </div>

          {/* Right Panel: Official Redressal Protocol & Citizen Closed Loop */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Citizen Verification Banner */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                  {t('overview.closed_loop_title')}
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {t('overview.closed_loop_mandatory')}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {t('overview.closed_loop_desc')}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">{t('overview.verification_rate')}</span>
                  <span className="font-mono font-bold text-lg text-emerald-800">94.2%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t('overview.auto_reopen')}</span>
                  <span className="font-mono font-bold text-lg text-[#B91C1C]">100% SLA</span>
                </div>
              </div>
            </div>

            {/* Departmental Work Distribution */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                  {t('overview.dept_dist_title')}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{t('overview.active_tickets')}</span>
              </div>
              <div className="space-y-2.5">
                {catEntries.map(([cat, count]) => {
                  const pct = Math.round((count / safe.length) * 100);
                  const catLabel = t(`cat.${cat}`, cat.replace(/_/g, ' '));
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 capitalize">{catLabel}</span>
                        <span className="font-mono font-bold text-slate-900">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#133E87] rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: High Priority Infrastructure Spot + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recurring Infrastructure Failure Alert */}
          <div className="lg:col-span-6 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#B91C1C]">{t('overview.high_priority_alert')}</span>
              </div>
              <span className="text-xs font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                {t('overview.chronic_spot')}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('overview.location')}</span>
                <span className="font-bold text-slate-900">
                  {language === 'gu'
                    ? 'મુક્તાનંદ સર્કલ • વોર્ડ ૪ (કારેલીબાગ)'
                    : language === 'hi'
                    ? 'मुक्तानंद सर्कल • वार्ड ४ (कारेलीबाग)'
                    : 'Muktanand Circle • Ward 4 (Karelibaug)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('overview.defect_category')}</span>
                <span className="font-bold text-slate-900">
                  {language === 'gu'
                    ? 'ખુલ્લી ગટર અને સ્ટ્રોમ ડ્રેનેજ નુકસાન'
                    : language === 'hi'
                    ? 'खुला मैनहोल एवं स्टॉर्म ड्रेन क्षति'
                    : 'Open Manhole & Storm Drain Collapse'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('overview.failure_recurrence')}</span>
                <span className="font-bold text-red-700">
                  {language === 'gu'
                    ? '૮ મહિનામાં ૪ વખત પુનરાવર્તન (માળખાકીય ખામી)'
                    : language === 'hi'
                    ? '८ महीनों में ४ बार पुनरावृत्ति (संरचनात्मक दोष)'
                    : 'Reported 4× in 8 months (Structural Defect)'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 mt-2 text-slate-700 leading-relaxed">
                <strong>{t('overview.exec_note')}</strong>
              </div>
            </div>
          </div>

          {/* Real-time Grievance Inflow Audit Trail */}
          <div className="lg:col-span-6 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                {t('overview.recent_inbound')}
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">{t('overview.live_stream')}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {safe.slice(0, 4).map((c) => {
                const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
                const statusKey = (c.status || '').toLowerCase().replace(/ /g, '_');
                const statusLabel = t(`status.${statusKey}`, c.status);
                const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer px-2 rounded transition-colors text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 capitalize">
                        {catLabel} <span className="font-mono text-slate-500 font-normal">#{c.id}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {wardLabel} • {timeAgo(c.created_at, language)}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
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