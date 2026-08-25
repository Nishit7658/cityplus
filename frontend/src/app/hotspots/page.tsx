'use client';

// F.5 — Hotspots Page (Official Infrastructure Vulnerability Index) with Trilingual i18n
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HotspotsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'recurring'>('all');
  const { lastEvent } = useSocket();
  const { language, t } = useLanguage();
  const { selectedWard } = useWard();

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

  const filtered = safe.filter((c) => {
    if (filterType === 'critical') return (c.severity_score || 0) >= 80;
    if (filterType === 'recurring') return !!c.is_recurring;
    return true;
  });

  const sortedHotspots = [...filtered].sort((a, b) => (b.severity_score || 0) - (a.severity_score || 0));

  const criticalCount = safe.filter((c) => (c.severity_score || 0) >= 80).length;
  const recurringCount = safe.filter((c) => c.is_recurring).length;

  return (
    <>
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
        {/* Official Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>{t('vmc.title')}</span>
              <span>•</span>
              <span>{t('hotspots.title')}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
              {t('hotspots.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('hotspots.desc')}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">{t('hotspots.critical_spots')}</span>
              <span className="font-mono font-bold text-[#B91C1C] text-base">{criticalCount}</span>
            </div>
            <div className="px-3 py-1 text-xs">
              <span className="text-slate-500 block">{t('hotspots.chronic_recurring')}</span>
              <span className="font-mono font-bold text-[#B45309] text-base">{recurringCount}</span>
            </div>
          </div>
        </div>

        {/* GIS Thermal Heatmap Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider">
              {t('hotspots.heatmap_title')}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {t('hotspots.heatmap_sub')}
            </span>
          </div>
          <div className="h-[380px] w-full relative">
            <MapView complaints={sortedHotspots} onSelectComplaint={setSelected} height={380} showHeatmap />
          </div>
        </div>

        {/* Ranked Infrastructure Risk Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
            <div>
              <h2 className="text-base font-bold text-[#0B2545]">
                {t('hotspots.ledger_title')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('hotspots.ledger_sub')}
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-300">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer ${
                  filterType === 'all' ? 'bg-[#0B2545] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('hotspots.all_spots')} ({safe.length})
              </button>
              <button
                onClick={() => setFilterType('critical')}
                className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer ${
                  filterType === 'critical' ? 'bg-[#B91C1C] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('hotspots.high_risk')}
              </button>
              <button
                onClick={() => setFilterType('recurring')}
                className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer ${
                  filterType === 'recurring' ? 'bg-[#B45309] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('hotspots.recurring_spots')}
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">
                  {language === 'gu' ? 'અગ્રતા ક્રમ અને ID' : language === 'hi' ? 'प्राथमिकता क्रम एवं ID' : 'Priority Rank & ID'}
                </th>
                <th className="px-4 py-3.5">
                  {language === 'gu' ? 'ખામી વર્ણન' : language === 'hi' ? 'खराबी का विवरण' : 'Defect Description'}
                </th>
                <th className="px-4 py-3.5">{t('queue.th_ward')}</th>
                <th className="px-4 py-3.5">
                  {language === 'gu' ? 'ઇજનેરી જોખમ સ્કોર' : language === 'hi' ? 'इंजीनियरिंग जोखिम स्कोर' : 'Engineering Risk Score'}
                </th>
                <th className="px-4 py-3.5">
                  {language === 'gu' ? 'નાગરિક પુષ્ટિ' : language === 'hi' ? 'नागरिक पुष्टि' : 'Citizen Confirmations'}
                </th>
                <th className="px-4 py-3.5">
                  {language === 'gu' ? 'પુનરાવર્તન' : language === 'hi' ? 'पुनरावृत्ति' : 'Recurrence Tag'}
                </th>
                <th className="px-6 py-3.5 text-right">{t('queue.th_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedHotspots.map((c, i) => {
                const score = c.severity_score || 0;
                const isCritical = score >= 80;
                const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
                const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[11px] ${
                            i < 3
                              ? 'bg-[#0B2545] text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <span className="font-mono text-slate-500 font-semibold">#{c.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 capitalize">
                        {catLabel}
                      </div>
                      <div className="text-slate-500 text-[11px] max-w-sm truncate">
                        {c.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold text-[11px]">
                        📍 {wardLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${score}%` }}
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-[#B91C1C]' : 'bg-[#133E87]'
                            }`}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-800 font-semibold">
                      👥 {c.confirmation_count || 1} {language === 'gu' ? 'ચકાસાયેલ' : language === 'hi' ? 'सत्यापित' : 'verified'}
                    </td>
                    <td className="px-4 py-3.5">
                      {c.is_recurring ? (
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          ⚠️ {c.total_cycles || 2}× {language === 'gu' ? `વખત (${c.months_span || 6} મહિના)` : language === 'hi' ? `बार (${c.months_span || 6} माह)` : `Cycles (${c.months_span || 6}mo)`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-mono">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(c);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-[#0B2545] hover:text-white text-slate-800 font-semibold rounded text-xs transition-colors cursor-pointer"
                      >
                        {t('hotspots.inspect')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
