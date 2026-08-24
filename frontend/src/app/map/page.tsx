'use client';

// F.2 — Live Map Page with Full Bilingual Gujarati & English Support
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { FilterPillRow, FilterOption } from '@/components/FilterPillRow';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSeverities, setActiveSeverities] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses]     = useState<string[]>([]);
  const { lastEvent } = useSocket();
  const { language, t } = useLanguage();

  const CATEGORY_FILTERS: FilterOption[] = [
    { key: 'pothole',            label: t('cat.pothole') },
    { key: 'water_leak',         label: t('cat.water_leak') },
    { key: 'broken_streetlight', label: t('cat.broken_streetlight') },
    { key: 'garbage_overflow',   label: t('cat.garbage_overflow') },
    { key: 'open_manhole',       label: t('cat.open_manhole') },
    { key: 'exposed_wiring',     label: t('cat.exposed_wiring') },
    { key: 'drainage_overflow',  label: t('cat.drainage_overflow') },
    { key: 'gas_leak',           label: t('cat.gas_leak') },
    { key: 'traffic_signal',     label: t('cat.traffic_signal') },
    { key: 'road_damage',        label: t('cat.road_damage') },
  ];

  const SEVERITY_FILTERS: FilterOption[] = [
    { key: 'low',      label: t('sev.low') },
    { key: 'medium',   label: t('sev.medium') },
    { key: 'critical', label: t('sev.critical') },
  ];

  const STATUS_FILTERS: FilterOption[] = [
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

  useEffect(() => {
    if (lastEvent?.type === 'new_complaint') {
      setComplaints((prev) => [lastEvent.data as Complaint, ...prev]);
    }
  }, [lastEvent]);

  const safe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

  // Apply filters
  const filtered = safe.filter((c) => {
    const catKey = (c.category || '').toLowerCase().replace(/\s+/g, '_');
    const count = c.confirmation_count || 1;
    const sevKey = count >= 8 ? 'critical' : count >= 4 ? 'medium' : 'low';

    if (activeCategories.length > 0 && !activeCategories.includes(catKey)) return false;
    if (activeSeverities.length > 0 && !activeSeverities.includes(sevKey)) return false;
    if (activeStatuses.length > 0 && !activeStatuses.includes(c.status)) return false;
    return true;
  });

  const toggleFilter = (key: string, active: string[], set: (v: string[]) => void) => {
    set(active.includes(key) ? active.filter((k) => k !== key) : [...active, key]);
  };

  const hasActiveFilters = activeCategories.length > 0 || activeSeverities.length > 0 || activeStatuses.length > 0;

  const resetAllFilters = () => {
    setActiveCategories([]);
    setActiveSeverities([]);
    setActiveStatuses([]);
  };

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-115px)] overflow-hidden bg-slate-50">
        {/* Filter bar container */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col gap-2.5 flex-shrink-0 shadow-2xs">
          {/* Row 1: Categories */}
          <div className="flex gap-3 flex-wrap items-center">
            <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider min-w-[70px] shrink-0">
              {t('common.category')}:
            </span>
            <FilterPillRow
              options={CATEGORY_FILTERS}
              active={activeCategories}
              onToggle={(k) => toggleFilter(k, activeCategories, setActiveCategories)}
            />
          </div>

          {/* Row 2: Status, Severity & Clear Button */}
          <div className="flex gap-4 flex-wrap items-center justify-between pt-1 border-t border-slate-100">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex gap-2 items-center">
                <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider min-w-[70px] shrink-0">
                  {t('common.status')}:
                </span>
                <FilterPillRow
                  options={STATUS_FILTERS}
                  active={activeStatuses}
                  onToggle={(k) => toggleFilter(k, activeStatuses, setActiveStatuses)}
                />
              </div>

              <div className="h-4 w-px bg-slate-300 hidden sm:block" />

              <div className="flex gap-2 items-center">
                <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider shrink-0">
                  {t('common.severity')}:
                </span>
                <FilterPillRow
                  options={SEVERITY_FILTERS}
                  active={activeSeverities}
                  onToggle={(k) => toggleFilter(k, activeSeverities, setActiveSeverities)}
                />
              </div>
            </div>

            {/* Right side stats + Clear action */}
            <div className="flex items-center gap-3 ml-auto">
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  type="button"
                  className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {t('common.clear_filters')}
                </button>
              )}
              <span className="text-xs font-mono text-[#0B2545] font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300">
                {language === 'gu'
                  ? `${safe.length} માંથી ${filtered.length} સ્પોટ્સ`
                  : `${filtered.length} of ${safe.length} spots`}
              </span>
            </div>
          </div>
        </div>

        {/* Map + List split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Map View */}
          <div className="flex-1 lg:basis-[68%] relative h-[320px] lg:h-full">
            <MapView complaints={filtered} onSelectComplaint={setSelected} height="100%" />
          </div>

          {/* Complaint List */}
          <div className="lg:basis-[32%] flex-1 lg:flex-none overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                {filtered.length} {t('map.pinned_issues')}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                {t('map.live_feed')}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-3">
              {filtered.map((c) => (
                <ComplaintCard key={c.id} complaint={c} onClick={() => setSelected(c)} />
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  {t('common.no_data')}
                </div>
              )}
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
