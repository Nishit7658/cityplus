'use client';

// F.6 — Officers Page (Official Municipal Personnel Directory)
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean, dignified government directory with department cadres, zonal jurisdictions, and work order metrics

import React, { useEffect, useState } from 'react';
import { Officer } from '@/types';
import { MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  'All Departments',
  'Road & Building Dept',
  'Drainage & Sewerage',
  'Solid Waste Management',
  'Electrical & Lighting',
  'Water Supply Department',
  'Health & Sanitation',
];

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetch(`${API_URL}/api/officers`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setOfficers(d);
      })
      .catch(() => {});
  }, []);

  const safe = Array.isArray(officers) ? officers : MOCK_OFFICERS;

  // Filter officers
  const filtered = safe.filter((o) => {
    const matchesDept =
      selectedDept === 'All Departments' ||
      (o.department || '').toLowerCase().includes(selectedDept.toLowerCase());
    const matchesSearch =
      (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.ward_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const totalActive = safe.reduce((acc, o) => acc + (o.active_complaints || 0), 0);
  const totalResolved = safe.reduce((acc, o) => acc + (o.resolved_complaints || 0), 0);

  return (
    <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
      {/* Official Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Vadodara Municipal Corporation</span>
            <span>•</span>
            <span>Engineering & Field Cadre Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
            Zonal Field Engineers & Departmental Officers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official roster of designated ward engineers, active municipal work orders, and jurisdiction assignments.
          </p>
        </div>

        {/* Cadre Metrics Summary */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
          <div className="px-3 py-1 border-r border-slate-200 text-xs">
            <span className="text-slate-500 block">Total Officers</span>
            <span className="font-mono font-bold text-[#0B2545] text-base">{safe.length} Cadres</span>
          </div>
          <div className="px-3 py-1 border-r border-slate-200 text-xs">
            <span className="text-slate-500 block">Active Work Orders</span>
            <span className="font-mono font-bold text-[#B45309] text-base">{totalActive} Tasks</span>
          </div>
          <div className="px-3 py-1 text-xs">
            <span className="text-slate-500 block">Total Resolved</span>
            <span className="font-mono font-bold text-[#15803D] text-base">{totalResolved} Fixed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        {/* Department Filter Buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {DEPARTMENTS.map((dept) => {
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded text-xs font-semibold tracking-tight transition-colors ${
                  isActive
                    ? 'bg-[#0B2545] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <input
            type="text"
            placeholder="Search by officer, ward, dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 px-3 text-xs rounded border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#133E87] w-64"
          />

          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                viewMode === 'grid' ? 'bg-white text-[#0B2545] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                viewMode === 'table' ? 'bg-white text-[#0B2545] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Officers Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map((officer) => {
            const activeCount = officer.active_complaints || 0;
            const resolvedCount = officer.resolved_complaints || 0;

            return (
              <div
                key={officer.id}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Official ID */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      VMC-CADRE-0{officer.id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Executive Engineer
                    </span>
                  </div>

                  {/* Officer Info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-[#0B2545] text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {(officer.name || '?')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0B2545]">
                        {officer.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {officer.department}
                      </p>
                    </div>
                  </div>

                  {/* Official Jurisdiction */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-4 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Ward:</span>
                      <span className="font-bold text-slate-900">{officer.ward_name || `Ward ${officer.ward_id}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Official Contact:</span>
                      <span className="font-mono font-semibold text-slate-800">{officer.phone || '+91 98250 12345'}</span>
                    </div>
                  </div>

                  {/* Work Order Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <span className="text-slate-500 block text-[11px]">Active Tasks</span>
                      <span className="font-mono font-bold text-[#B45309] text-sm">{activeCount}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <span className="text-slate-500 block text-[11px]">Total Cleared</span>
                      <span className="font-mono font-bold text-[#15803D] text-sm">{resolvedCount}</span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Trigger */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Status: Active</span>
                  <a
                    href={`tel:${officer.phone}`}
                    className="px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] font-semibold rounded hover:bg-[#DBEAFE] transition-colors"
                  >
                    Direct Contact
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Official Table View */
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Cadre ID & Name</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Assigned Jurisdiction</th>
                <th className="px-4 py-3.5">Active Workload</th>
                <th className="px-4 py-3.5">Total Resolved</th>
                <th className="px-4 py-3.5">Official Contact</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((officer) => (
                <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="font-bold text-[#0B2545]">{officer.name}</div>
                    <div className="font-mono text-slate-400 text-[11px]">VMC-CADRE-0{officer.id}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{officer.department}</td>
                  <td className="px-4 py-3.5">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {officer.ward_name || `Ward ${officer.ward_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[#B45309]">
                    {officer.active_complaints || 0} tasks
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[#15803D]">
                    {officer.resolved_complaints || 0} cleared
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">
                    {officer.phone || '+91 98250 12345'}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <a
                      href={`tel:${officer.phone}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded transition-colors"
                    >
                      Contact
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
