'use client';

// F.6 — Officers Page (Official Municipal Personnel Directory) with Trilingual i18n & WardContext
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { useEffect, useState } from 'react';
import { Officer } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { language, t } = useLanguage();
  const { selectedWard } = useWard();

  const DEPARTMENTS = [
    { key: 'all', label: t('dept.all') },
    { key: 'Road', label: t('dept.road') },
    { key: 'Drainage', label: t('dept.drainage') },
    { key: 'Solid Waste', label: t('dept.waste') },
    { key: 'Electrical', label: t('dept.electric') },
    { key: 'Water', label: t('dept.water') },
    { key: 'Health', label: t('dept.health') },
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/officers`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setOfficers(d);
      })
      .catch(() => {});
  }, []);

  const rawSafe = Array.isArray(officers) ? officers : MOCK_OFFICERS;

  // Filter by Global WardContext
  const safe = selectedWard === 'all'
    ? rawSafe
    : rawSafe.filter((o) => String(o.ward_id) === String(selectedWard));

  // Filter officers
  const filtered = safe.filter((o) => {
    const matchesDept =
      selectedDept === 'all' ||
      (o.department || '').toLowerCase().includes(selectedDept.toLowerCase());
    const matchesSearch =
      (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.ward_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const totalActive = safe.reduce((acc, o) => acc + (o.active_complaints || o.active_assigned || 0), 0);
  const totalResolved = safe.reduce((acc, o) => acc + (o.resolved_complaints || 0), 0);

  return (
    <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
      {/* Official Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{t('vmc.title')}</span>
            <span>•</span>
            <span>{t('officers.title')}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
            {t('officers.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('officers.desc')}
          </p>
        </div>

        {/* Cadre Metrics Summary */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
          <div className="px-3 py-1 border-r border-slate-200 text-xs">
            <span className="text-slate-500 block">{t('officers.total_officers')}</span>
            <span className="font-mono font-bold text-[#0B2545] text-base">{safe.length}</span>
          </div>
          <div className="px-3 py-1 border-r border-slate-200 text-xs">
            <span className="text-slate-500 block">{t('officers.active_orders')}</span>
            <span className="font-mono font-bold text-[#B45309] text-base">{totalActive}</span>
          </div>
          <div className="px-3 py-1 text-xs">
            <span className="text-slate-500 block">{t('officers.total_resolved')}</span>
            <span className="font-mono font-bold text-[#15803D] text-base">{totalResolved}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.key}
              onClick={() => setSelectedDept(dept.key)}
              className={`px-3 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                selectedDept === dept.key
                  ? 'bg-[#0B2545] text-white border-[#0B2545]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('officers.search_placeholder')}
              className="h-8 pl-8 pr-3 text-xs rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#133E87] w-64"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center rounded border border-slate-300 bg-slate-100 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#0B2545] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ▦ {t('officers.cards_view')}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#0B2545] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☰ {t('officers.roster_view')}
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table Layout */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((officer) => {
            const wardLabel = t(`ward.${officer.ward_id}`, officer.ward_name || `Ward ${officer.ward_id}`);
            const activeCount = officer.active_complaints || officer.active_assigned || 0;
            const resolvedCount = officer.resolved_complaints || 0;

            return (
              <div
                key={officer.id}
                className="bg-white rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {officer.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                      ID: #{officer.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0B2545] mt-3">
                    {officer.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {officer.department}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">{t('officers.jurisdiction')}:</span>
                      <span className="font-semibold text-slate-900">📍 {wardLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">{t('officers.official_phone')}:</span>
                      <span className="font-mono text-slate-800 font-bold">{officer.phone || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 -mx-5 -mb-5 p-3 rounded-b-lg">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('status.active')}</span>
                    <span className="font-mono font-bold text-[#B45309] text-sm">{activeCount}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('status.resolved')}</span>
                    <span className="font-mono font-bold text-[#15803D] text-sm">{resolvedCount}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('officers.cadre')}</span>
                    <span className="text-[11px] font-bold text-[#0B2545]">{t('officers.cadre_role')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">{t('officers.th_officer_id')}</th>
                <th className="px-4 py-3.5">{t('officers.th_name')}</th>
                <th className="px-4 py-3.5">{t('officers.th_dept')}</th>
                <th className="px-4 py-3.5">{t('officers.th_ward_jurisdiction')}</th>
                <th className="px-4 py-3.5">{t('officers.th_phone')}</th>
                <th className="px-4 py-3.5 text-center">{t('officers.th_active_tasks')}</th>
                <th className="px-4 py-3.5 text-center">{t('officers.th_resolved')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.map((officer) => {
                const wardLabel = t(`ward.${officer.ward_id}`, officer.ward_name || `Ward ${officer.ward_id}`);
                const activeCount = officer.active_complaints || officer.active_assigned || 0;
                const resolvedCount = officer.resolved_complaints || 0;

                return (
                  <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-500 font-bold">#{officer.id}</td>
                    <td className="px-4 py-3.5 font-bold text-[#0B2545]">{officer.name}</td>
                    <td className="px-4 py-3.5">{officer.department}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold text-[11px]">
                        📍 {wardLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">{officer.phone || '—'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {activeCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {resolvedCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
