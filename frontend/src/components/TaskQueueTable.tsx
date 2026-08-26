'use client';

// F.3 — Task Queue Table/Grid with Trilingual i18n, Real-Time Search & CSV Work Order Export
// Vadodara Municipal Corporation (VMC)

import React, { useState } from 'react';
import { Complaint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface TaskQueueTableProps {
  complaints: Complaint[];
  onSelect?: (c: Complaint) => void;
  onSelectComplaint?: (c: Complaint) => void;
  newIds?: number[];
  newComplaintIds?: number[];
}

type SortKey = 'priority' | 'newest' | 'confirmed' | 'oldest';

function sortComplaints(complaints: Complaint[], key: SortKey): Complaint[] {
  const arr = [...complaints];
  switch (key) {
    case 'priority':  return arr.sort((a, b) => (b.severity_score || 0) - (a.severity_score || 0));
    case 'newest':    return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'confirmed': return arr.sort((a, b) => (b.confirmation_count || 0) - (a.confirmation_count || 0));
    case 'oldest':    return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    default:          return arr;
  }
}

export const TaskQueueTable: React.FC<TaskQueueTableProps> = ({
  complaints,
  onSelect,
  onSelectComplaint,
  newIds = [],
  newComplaintIds = [],
}) => {
  const handleSelect = onSelectComplaint || onSelect;
  const activeNewIds = newComplaintIds.length > 0 ? newComplaintIds : newIds;
  const safe = Array.isArray(complaints) ? complaints : [];
  const [sort, setSort] = useState<SortKey>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const { language, t } = useLanguage();

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    {
      key: 'priority',
      label:
        language === 'gu'
          ? '⚡ અગ્રતા સ્કોર ▾'
          : language === 'hi'
          ? '⚡ प्राथमिकता स्कोर ▾'
          : '⚡ Priority Score ▾',
    },
    {
      key: 'newest',
      label:
        language === 'gu'
          ? '🕒 નવીનતમ પ્રથમ'
          : language === 'hi'
          ? '🕒 नवीनतम पहले'
          : '🕒 Newest First',
    },
    {
      key: 'confirmed',
      label:
        language === 'gu'
          ? '👥 વધુ પુષ્ટિ થયેલ'
          : language === 'hi'
          ? '👥 सर्वाधिक पुष्टि'
          : '👥 Most Confirmed',
    },
    {
      key: 'oldest',
      label:
        language === 'gu'
          ? '⏳ જૂની ફરિયાદો'
          : language === 'hi'
          ? '⏳ पुरानी शिकायतें'
          : '⏳ Oldest First',
    },
  ];

  // Real-time search filter
  const filteredBySearch = safe.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(c.id).includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.ward_name || '').toLowerCase().includes(q)
    );
  });

  const sorted = sortComplaints(filteredBySearch, sort);

  const exportCSV = () => {
    const headers = ['ID', 'Category', 'Description', 'Ward', 'Status', 'Severity Score', 'Confirmations', 'Created At'];
    const rows = sorted.map((c) => [
      c.id,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"Ward ${c.ward_id || 1}"`,
      `"${c.status || 'Pending'}"`,
      c.severity_score || 0,
      c.confirmation_count || 1,
      `"${c.created_at}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMC_Work_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const statusKey = (status || '').toLowerCase().replace(/ /g, '_');
    const label = t(`status.${statusKey}`, status);

    switch (status) {
      case 'Resolved':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded text-[11px] inline-block">
            {label}
          </span>
        );
      case 'In Progress':
        return (
          <span className="bg-blue-50 text-blue-900 border border-blue-200 font-bold px-2.5 py-0.5 rounded text-[11px] inline-block">
            {label}
          </span>
        );
      case 'Assigned':
        return (
          <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2.5 py-0.5 rounded text-[11px] inline-block">
            {label}
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 text-slate-700 border border-slate-300 font-bold px-2.5 py-0.5 rounded text-[11px] inline-block">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Top Controls: Search, Sort & CSV Export */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-[#0B2545] tracking-wider shrink-0">
            {t('queue.table_header')} ({sorted.length})
          </span>

          {/* Real-time search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, category, or notes..."
              className="h-8 pl-8 pr-3 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:border-[#133E87] w-60"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        {/* Sort Controls & CSV Export */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">{t('queue.sort_by')}:</span>
            <div className="flex bg-white rounded border border-slate-300 p-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                    sort === opt.key ? 'bg-[#0B2545] text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click CSV Export */}
          <button
            onClick={exportCSV}
            className="h-8 px-3 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Download CSV Work Orders for Field Officers"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">{t('queue.th_id')}</th>
              <th className="px-4 py-3.5">{t('queue.th_category')}</th>
              <th className="px-4 py-3.5">{t('queue.th_description')}</th>
              <th className="px-4 py-3.5">{t('queue.th_ward')}</th>
              <th className="px-4 py-3.5">{t('queue.th_status')}</th>
              <th className="px-4 py-3.5">{t('queue.th_score')}</th>
              <th className="px-4 py-3.5">{t('queue.th_confirmations')}</th>
              <th className="px-4 py-3.5">{t('queue.th_reported')}</th>
              <th className="px-6 py-3.5 text-right">{t('queue.th_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {sorted.map((c) => {
              const isNew = activeNewIds.includes(c.id);
              const isCritical = (c.severity_score || 0) >= 80;
              const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
              const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);

              return (
                <tr
                  key={c.id}
                  onClick={() => handleSelect && handleSelect(c)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    isNew ? 'bg-amber-50/70 font-semibold' : ''
                  }`}
                >
                  <td className="px-6 py-3.5 font-mono text-[#0B2545] font-bold">
                    #{c.id}
                  </td>
                  <td className="px-4 py-3.5 capitalize font-semibold text-[#0B2545]">
                    {catLabel}
                  </td>
                  <td className="px-4 py-3.5 max-w-xs truncate text-slate-600">
                    {c.description || '—'}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold text-[11px]">
                      📍 {wardLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold ${
                          isCritical ? 'text-[#B91C1C]' : 'text-slate-800'
                        }`}
                      >
                        {c.severity_score || 0}
                      </span>
                      {isCritical && (
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded border border-red-200">
                          {t('sev.critical')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    👥 {c.confirmation_count || 1}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(c.created_at).toLocaleDateString(language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleSelect) handleSelect(c);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-[#0B2545] hover:text-white text-slate-800 font-semibold rounded text-xs transition-colors cursor-pointer"
                    >
                      {t('queue.action_review')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
