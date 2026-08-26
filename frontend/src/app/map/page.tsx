'use client';

// F.2 — Live GIS Cartography & Municipal Incident Console
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Docked Filter Ribbon, Full-Bleed Spatial Map, Clean Item Sidebar, Zero Side Accent Stripes

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { useSocket } from '@/components/SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { Complaint, Officer } from '@/types';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FilterOption {
  key: string;
  label: string;
}

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);

  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSeverities, setActiveSeverities] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses]     = useState<string[]>([]);

  const { lastEvent } = useSocket();
  const { language, t } = useLanguage();
  const { selectedWard, setSelectedWard } = useWard();

  const CATEGORY_FILTERS: FilterOption[] = [
    { key: 'pothole',            label: t('cat.pothole') },
    { key: 'water_leak',         label: t('cat.water_leak') },
    { key: 'broken_streetlight', label: t('cat.broken_streetlight') },
    { key: 'garbage_overflow',   label: t('cat.garbage_overflow') },
    { key: 'open_manhole',       label: t('cat.open_manhole') },
    { key: 'exposed_wiring',     label: t('cat.exposed_wiring') },
    { key: 'gas_leak',           label: t('cat.gas_leak') },
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

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, key: string) => {
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
  };

  const clearAll = () => {
    setActiveCategories([]);
    setActiveSeverities([]);
    setActiveStatuses([]);
  };

  const hasFilters = activeCategories.length > 0 || activeSeverities.length > 0 || activeStatuses.length > 0;

  return (
    <>
      <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)] flex flex-col">
        {/* Compact Docked Filter Ribbon */}
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter Category Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                {t('map.category_label')}:
              </span>
              {CATEGORY_FILTERS.map((f) => {
                const active = activeCategories.includes(f.key);
                return (
                  <button
                    key={f.key}
                    onClick={() => toggleFilter(activeCategories, setActiveCategories, f.key)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0B2545] text-white border-[#0B2545]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Severity, Status & Reset */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <div className="flex items-center gap-1">
                {SEVERITY_FILTERS.map((f) => {
                  const active = activeSeverities.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleFilter(activeSeverities, setActiveSeverities, f.key)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#B45309] text-white border-[#B45309]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-1">
                {STATUS_FILTERS.map((f) => {
                  const active = activeStatuses.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleFilter(activeStatuses, setActiveStatuses, f.key)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#133E87] text-white border-[#133E87]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-mono text-slate-500 font-semibold pl-2">
                {`${filtered.length} / ${safe.length} ${t('overview.spots', 'spots')}`}
              </span>

              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold text-[#B91C1C] hover:underline cursor-pointer pl-1"
                >
                  {t('map.clear_all')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Spatial Map & Clean Item Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Map Viewport */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden h-[620px] relative">
            <MapView
              complaints={filtered}
              onSelectComplaint={setSelected}
              onSelectWard={(wId) => setSelectedWard(String(wId))}
              selectedWard={selectedWard}
              height={620}
            />
          </div>

          {/* Clean Item Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[620px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider">
                {t('map.live_feed_title')}
              </span>
              <span className="text-xs font-mono font-bold text-[#133E87]">
                {filtered.length} {t('overview.spots')}
              </span>
            </div>
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filtered.map((c) => (
                <ComplaintCard key={c.id} complaint={c} onClick={() => setSelected(c)} />
              ))}
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
