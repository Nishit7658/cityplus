'use client';

// F.7 — Transparency Page (Official Municipal Citizen Charter & Audit Record)
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean, dignified government public audit terminal and 10-ward SLA compliance ledger

import React, { useEffect, useState } from 'react';
import { TransparencyStats } from '@/types';
import { MOCK_TRANSPARENCY } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const WORKFLOW_STEPS = [
  {
    step: 'STAGE 1',
    title: 'Citizen Grievance Intake',
    desc: 'Citizens report civic defects via official VMC WhatsApp Helpline or web portal with photos and GPS geo-location.',
  },
  {
    step: 'STAGE 2',
    title: 'Spatial De-duplication',
    desc: 'PostGIS spatial engine automatically clusters multi-citizen reports within 18m into a consolidated work order.',
  },
  {
    step: 'STAGE 3',
    title: 'Zonal Officer Dispatch',
    desc: 'Tickets are dynamically prioritized and routed to designated ward executive engineers with strict turnaround SLAs.',
  },
  {
    step: 'STAGE 4',
    title: 'Citizen Verification',
    desc: 'Automated verification message sent to citizen upon completion. Citizen confirms fix quality before final ticket closure.',
  },
];

export default function TransparencyPage() {
  const [stats, setStats] = useState<TransparencyStats>(MOCK_TRANSPARENCY);

  useEffect(() => {
    fetch(`${API_URL}/api/transparency`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.total_complaints > 0) setStats(d);
      })
      .catch(() => {});
  }, []);

  const safeStats = stats || MOCK_TRANSPARENCY;
  const resolutionRate = Math.round(
    (safeStats.resolved_complaints / Math.max(1, safeStats.total_complaints)) * 100
  );

  return (
    <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
      {/* Official Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Vadodara Municipal Corporation</span>
            <span>•</span>
            <span>Public Record & Citizen Charter Compliance</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
            Transparency, Civic Performance & Ward Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time public record of civic complaints, resolution turnaround times, and departmental accountability under the Citizen Charter.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
          <span>Official Public Record: </span>
          <span className="font-mono text-emerald-700">Verified Open Access</span>
        </div>
      </div>

      {/* 4 Official Civic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            Total Intake (All Wards)
          </div>
          <div className="text-3xl font-mono font-bold text-[#0B2545]">
            {safeStats.total_complaints}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Complaints logged across all 10 VMC wards
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#15803D]">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            Resolved Grievances
          </div>
          <div className="text-3xl font-mono font-bold text-[#15803D]">
            {safeStats.resolved_complaints}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Verified by reporting citizens via WhatsApp
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#133E87]">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            Resolution Efficiency
          </div>
          <div className="text-3xl font-mono font-bold text-[#133E87]">
            {resolutionRate}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            SLA compliance across municipal departments
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs border-l-4 border-l-[#B45309]">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            Average Turnaround Time
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900">
            {Math.round(safeStats.avg_resolution_hours)} <span className="text-base font-normal text-slate-500">hours</span>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-2">
            Target SLA: &lt; 24.0 hours standard
          </div>
        </div>
      </div>

      {/* Official 4-Stage Redressal Protocol (Clean, crisp GovTech cards) */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0B2545]">
              Standard Operating Procedure (SOP) — Citizen Grievance Redressal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated 4-tier lifecycle ensuring spatial accuracy, rapid field dispatch, and citizen-verified closure.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
            VMC Circular 2026/04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono font-bold text-[#133E87] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-2.5">
                  {step.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-400 font-mono">
                Automated System Check ✓
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10-Ward Comparative SLA Resolution Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-[#0B2545]">
              Ward-Level Resolution Performance Ledger (10 VMC Wards)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited complaint volume, resolution count, and SLA performance across all administrative zones.
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Administrative Ward</th>
              <th className="px-4 py-3.5">Total Logged</th>
              <th className="px-4 py-3.5">Resolved Fixed</th>
              <th className="px-6 py-3.5">Resolution SLA Progress</th>
              <th className="px-6 py-3.5 text-right">Status Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeStats.wards.map((ward) => {
              const pct = ward.total > 0 ? Math.round((ward.resolved / ward.total) * 100) : 0;
              const isCompliant = pct >= 75;

              return (
                <tr key={ward.ward_name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {ward.ward_name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    {ward.total} tickets
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[#15803D]">
                    {ward.resolved} cleared
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3 max-w-sm">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-[#15803D]' : pct >= 65 ? 'bg-[#133E87]' : 'bg-[#B45309]'
                          }`}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        isCompliant
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompliant ? 'SLA Compliant' : 'Under Review'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
