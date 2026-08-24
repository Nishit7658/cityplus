'use client';

// F.2 — Live Map Page
// Full-width map (70%) + visible complaints list synced to map bounds (30%)
// Filter pill row for category/severity/ward

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { FilterPillRow, FilterOption } from '@/components/FilterPillRow';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORY_FILTERS: FilterOption[] = [
  { key: 'pothole',            label: 'Pothole' },
  { key: 'water_leak',         label: 'Water Leak' },
  { key: 'broken_streetlight', label: 'Streetlight' },
  { key: 'garbage_overflow',   label: 'Garbage' },
  { key: 'open_manhole',       label: 'Manhole' },
  { key: 'exposed_wiring',     label: 'Wiring' },
  { key: 'drainage',           label: 'Drainage' },
  { key: 'gas_leak',           label: 'Gas Leak' },
  { key: 'traffic_signal',     label: 'Traffic' },
  { key: 'road_damage',        label: 'Road' },
];

const SEVERITY_FILTERS: FilterOption[] = [
  { key: 'low',      label: 'Low' },
  { key: 'medium',   label: 'Medium' },
  { key: 'critical', label: 'Critical' },
];

const STATUS_FILTERS: FilterOption[] = [
  { key: 'Pending',     label: 'Pending' },
  { key: 'Assigned',    label: 'Assigned' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Resolved',    label: 'Resolved' },
];

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSeverities, setActiveSeverities] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses]     = useState<string[]>([]);
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

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
        {/* Filter pill row */}
        <div className="px-6 py-3 bg-cp-bg border-b border-cp-border flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-4 flex-wrap items-center">
            <span
              style={{
                fontSize: 'var(--fs-eyebrow)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-ink-muted)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Category
            </span>
            <FilterPillRow
              options={CATEGORY_FILTERS}
              active={activeCategories}
              onToggle={(k) => toggleFilter(k, activeCategories, setActiveCategories)}
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <span
              style={{
                fontSize: 'var(--fs-eyebrow)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-ink-muted)',
                fontWeight: 600,
                flexShrink: 0,
                minWidth: 56,
              }}
            >
              Status & Severity
            </span>
            <FilterPillRow
              options={STATUS_FILTERS}
              active={activeStatuses}
              onToggle={(k) => toggleFilter(k, activeStatuses, setActiveStatuses)}
            />
            <FilterPillRow
              options={SEVERITY_FILTERS}
              active={activeSeverities}
              onToggle={(k) => toggleFilter(k, activeSeverities, setActiveSeverities)}
            />
            <span className="ml-auto text-xs font-mono text-cp-muted flex-shrink-0 font-medium">
              {filtered.length} of {safe.length} spots visible
            </span>
          </div>
        </div>

        {/* Map + List split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 lg:basis-[68%] relative h-[320px] lg:h-full">
            <MapView complaints={filtered} onSelectComplaint={setSelected} height="100%" />
          </div>

          {/* Complaint list */}
          <div className="lg:basis-[32%] flex-1 lg:flex-none overflow-y-auto border-t lg:border-t-0 lg:border-l border-cp-border bg-cp-bg flex flex-col">
            <div className="p-4 border-b border-cp-border bg-cp-surface flex items-center justify-between flex-shrink-0">
              <span
                style={{
                  fontSize: 'var(--fs-eyebrow)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-ink-muted)',
                  fontWeight: 600,
                }}
              >
                {filtered.length} Pinned Issues
              </span>
              <span className="text-xs text-cp-faint font-mono">Live VMC Feed</span>
            </div>
            <div className="p-3 flex flex-col gap-3">
              {filtered.map((c) => (
                <ComplaintCard key={c.id} complaint={c} onClick={() => setSelected(c)} />
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-cp-faint text-sm">
                  No complaints match the selected filters.
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
