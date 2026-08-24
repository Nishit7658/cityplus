'use client';

// F.5 — Hotspots Page (Official Infrastructure Vulnerability Index)
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean, dignified government engineering ledger for chronic civic defect clusters

import React, { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { Complaint, Officer } from '@/types';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HotspotsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'recurring'>('all');

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

  const safe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

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
              <span>Vadodara Municipal Corporation</span>
              <span>•</span>
              <span>Engineering & Capital Works Division</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
              Urban Infrastructure Vulnerability & Failure Hotspots
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              GIS spatial density analysis identifying chronic civic failure clusters requiring capital engineering intervention.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
            <div className="px-3 py-1 border-r border-slate-200 text-xs">
              <span className="text-slate-500 block">Critical Risk Spots</span>
              <span className="font-mono font-bold text-[#B91C1C] text-base">{criticalCount} Locations</span>
            </div>
            <div className="px-3 py-1 text-xs">
              <span className="text-slate-500 block">Chronic Recurring</span>
              <span className="font-mono font-bold text-[#B45309] text-base">{recurringCount} Spots</span>
            </div>
          </div>
        </div>

        {/* GIS Thermal Heatmap Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider">
              Citywide Infrastructure Density & Risk Heatmap
            </span>
            <span className="text-xs font-mono text-slate-500">
              Spatial PostGIS Interpolation (Vadodara Metro)
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
                Ranked Infrastructure Defect Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Priority order based on citizen report density, failure recurrence frequency, and severity risk index.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-300">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  filterType === 'all' ? 'bg-[#0B2545] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Spots ({safe.length})
              </button>
              <button
                onClick={() => setFilterType('critical')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  filterType === 'critical' ? 'bg-[#B91C1C] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                High Risk (80+)
              </button>
              <button
                onClick={() => setFilterType('recurring')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  filterType === 'recurring' ? 'bg-[#B45309] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Recurring Spots
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Priority Rank & ID</th>
                <th className="px-4 py-3.5">Defect Description</th>
                <th className="px-4 py-3.5">Jurisdiction Ward</th>
                <th className="px-4 py-3.5">Engineering Risk Score</th>
                <th className="px-4 py-3.5">Citizen Confirmations</th>
                <th className="px-4 py-3.5">Recurrence Tag</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedHotspots.map((c, i) => {
                const score = c.severity_score || 0;
                const isCritical = score >= 80;

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
                        {(c.category || '').replace(/_/g, ' ')}
                      </div>
                      <div className="text-slate-500 text-[11px] max-w-sm truncate">
                        {c.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold text-[11px]">
                        📍 {c.ward_name || `Ward ${c.ward_id}`}
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
                      👥 {c.confirmation_count || 1} verified
                    </td>
                    <td className="px-4 py-3.5">
                      {c.is_recurring ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          ⚠️ {c.total_cycles || 2}× Cycles ({c.months_span || 6}mo)
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
                        className="px-3 py-1 bg-slate-100 hover:bg-[#0B2545] hover:text-white text-slate-800 font-semibold rounded text-xs transition-colors"
                      >
                        Inspect
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
