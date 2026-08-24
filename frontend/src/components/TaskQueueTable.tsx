'use client';

// F.3 — Task Queue Table/Grid with Bilingual i18n
// Vadodara Municipal Corporation (VMC)

import React, { useState } from 'react';
import { Complaint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface TaskQueueTableProps {
  complaints: Complaint[];
  onSelect?: (c: Complaint) => void;
  newIds?: number[];
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

export const TaskQueueTable: React.FC<TaskQueueTableProps> = ({ complaints, onSelect, newIds = [] }) => {
  const safe = Array.isArray(complaints) ? complaints : [];
  const [sort, setSort] = useState<SortKey>('priority');
  const { language, t } = useLanguage();

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'priority', label: language === 'gu' ? '⚡ અગ્રતા સ્કોર ▾' : '⚡ Priority Score ▾' },
    { key: 'newest',   label: language === 'gu' ? '🕒 નવીનતમ પ્રથમ' : '🕒 Newest First' },
    { key: 'confirmed',label: language === 'gu' ? '👥 સૌથી વધુ પુષ્ટિ' : '👥 Most Confirmed' },
    { key: 'oldest',   label: language === 'gu' ? '⏳ સૌથી જૂની પેન્ડિંગ' : '⏳ Longest Pending' },
  ];

  const sorted = sortComplaints(safe, sort);

  return (
    <div className="flex flex-col gap-4">
      {/* Control Bar: Sort & View Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            {language === 'gu' ? 'ક્રમ:' : 'Sort:'}
          </span>
          {SORT_OPTIONS.map((opt) => {
            const isActive = sort === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B2545] text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5">{t('queue.th_ticket')}</th>
                <th className="px-4 py-3.5">{t('queue.th_status')}</th>
                <th className="px-4 py-3.5">{t('queue.th_priority')}</th>
                <th className="px-4 py-3.5">{t('queue.th_ward')}</th>
                <th className="px-4 py-3.5">{t('queue.th_density')}</th>
                <th className="px-4 py-3.5">{t('queue.th_reported')}</th>
                <th className="px-6 py-3.5 text-right">{t('queue.th_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((c) => {
                const score = c.severity_score || 0;
                const isCritical = score >= 80;
                const isMedium = score >= 55 && score < 80;
                const isFresh = newIds.includes(c.id);
                const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
                const statusKey = (c.status || '').toLowerCase().replace(/ /g, '_');
                const statusLabel = t(`status.${statusKey}`, c.status);
                const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelect?.(c)}
                    className={`hover:bg-slate-50 cursor-pointer transition-all ${
                      isFresh ? 'bg-blue-50/80 animate-pulse' : ''
                    }`}
                  >
                    {/* ID & Category */}
                    <td className="px-6 py-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 capitalize text-sm">
                            {catLabel}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 font-semibold">
                            #{c.id}
                          </span>
                          {c.is_recurring && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              ↻ {language === 'gu' ? `પુનરાવર્તન (${c.total_cycles}×)` : `Recurring (${c.total_cycles}×)`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">
                          {c.description}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : c.status === 'Assigned'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    {/* Priority Score Bar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, score)}%` }}
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-red-600' : isMedium ? 'bg-amber-500' : 'bg-[#133E87]'
                            }`}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold text-xs ${
                            isCritical ? 'text-red-700' : 'text-slate-800'
                          }`}
                        >
                          {score}
                        </span>
                      </div>
                    </td>

                    {/* Ward */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
                        📍 {wardLabel}
                      </span>
                    </td>

                    {/* Citizen Confirmations */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        👥 {c.confirmation_count || 1} {language === 'gu' ? 'ચકાસાયેલ' : 'verified'}
                      </span>
                    </td>

                    {/* Reported Date */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {new Date(c.created_at).toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect?.(c);
                        }}
                        className="px-3 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-[#0B2545] hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        {t('queue.review')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-slate-400 font-body text-sm bg-white rounded-lg border border-slate-200">
          {language === 'gu' ? 'પસંદ કરેલ માપદંડ મુજબ કોઈ ફરિયાદ નથી.' : 'No complaints matching the active criteria.'}
        </div>
      )}
    </div>
  );
};
