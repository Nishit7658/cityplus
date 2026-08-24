'use client';

// F.1 — Overview Page (Executive Municipal Control Room)
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean, formal government dashboard with official zonal GIS radar and department dispatch metrics

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function OverviewPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const { lastEvent } = useSocket();

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
    const k = (c.category || 'other').replace(/_/g, ' ');
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
              <span>Government of Gujarat</span>
              <span>•</span>
              <span>Urban Development & Urban Housing Department</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
              Municipal Operations & Citizen Grievance Dashboard
            </h1>
          </div>

          {/* Official Portal Metadata Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-3.5 py-2 rounded border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500">Jurisdiction: </span>
              <span className="font-bold text-[#0B2545]">Vadodara (10 Administrative Wards)</span>
            </div>
            <div className="bg-white px-3.5 py-2 rounded border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500">System Status: </span>
              <span className="font-bold text-emerald-700">● 100% Operational</span>
            </div>
          </div>
        </div>

        {/* 4 Primary Municipal KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              Total Grievances Logged
            </div>
            <div className="text-3xl font-mono font-bold text-[#0B2545]">
              {safe.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Citizen intake via WhatsApp Cloud API & Web Portal
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#1E40AF]">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              Pending Zonal Dispatch
            </div>
            <div className="text-3xl font-mono font-bold text-[#1E40AF]">
              {pending.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Awaiting officer assignment and field inspection
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#B45309]">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              Active Work In Progress
            </div>
            <div className="text-3xl font-mono font-bold text-[#B45309]">
              {inProgress.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Field repair crews and engineering teams dispatched
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#15803D]">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
              Closed & Verified Fixes
            </div>
            <div className="text-3xl font-mono font-bold text-[#15803D]">
              {resolved.length} <span className="text-sm font-normal text-slate-500">({resolutionPct}%)</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Audited with citizen WhatsApp confirmation
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
                  VMC GIS Spatial Incident Map
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                18m Spatial Clustering Enabled
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
                  Citizen Closed-Loop Verification Protocol
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Mandatory
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Per VMC Citizen Charter guidelines, no grievance is permanently closed until the reporting citizen confirms the repair quality via WhatsApp Quick-Reply prompt.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Verification Rate</span>
                  <span className="font-mono font-bold text-lg text-emerald-800">94.2%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Auto-Reopen on 'No'</span>
                  <span className="font-mono font-bold text-lg text-[#B91C1C]">100% SLA</span>
                </div>
              </div>
            </div>

            {/* Departmental Work Distribution */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                  Departmental Workload Distribution
                </span>
                <span className="text-[11px] font-mono text-slate-500">Active Tickets</span>
              </div>
              <div className="space-y-2.5">
                {catEntries.map(([cat, count]) => {
                  const pct = Math.round((count / safe.length) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 capitalize">{cat}</span>
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
                <span className="text-sm font-bold text-[#B91C1C]">⚠️ High-Priority Municipal Alert</span>
              </div>
              <span className="text-xs font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                Chronic Spot #103
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-900">Muktanand Circle • Ward 4 (Karelibaug)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Defect Category:</span>
                <span className="font-bold text-slate-900">Open Manhole & Storm Drain Collapse</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Failure Recurrence:</span>
                <span className="font-bold text-red-700">Reported 4× in 8 months (Structural Defect)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 mt-2 text-slate-700 leading-relaxed">
                <strong>Executive Engineering Note:</strong> Sub-base erosion detected. Temporary asphalt patch insufficient. Requires capital structural reinforcement by Drainage & Sewerage Department.
              </div>
            </div>
          </div>

          {/* Real-time Grievance Inflow Audit Trail */}
          <div className="lg:col-span-6 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                Recent Inbound Citizen Grievances
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">Live Stream</span>
            </div>
            <div className="divide-y divide-slate-100">
              {safe.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer px-2 rounded transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 capitalize">
                      {(c.category || '').replace(/_/g, ' ')} <span className="font-mono text-slate-500 font-normal">#{c.id}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {c.ward_name || `Ward ${c.ward_id}`} • {timeAgo(c.created_at)}
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
                    {c.status}
                  </span>
                </div>
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