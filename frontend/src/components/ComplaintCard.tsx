'use client';

// C.5 — Complaint Card (Refined Enterprise Row / Item) with Trilingual i18n
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean subtle borders, high contrast badges, zero side-accent stripes, zero scroll bounces

import React from 'react';
import { Complaint } from '@/types';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';
import { useLanguage, Language } from '@/context/LanguageContext';

interface ComplaintCardProps {
  complaint: Complaint;
  isNew?: boolean;
  onClick?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending:       { bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' },
  Assigned:      { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
  'In Progress': { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  Resolved:      { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
};

function timeAgo(dateStr: string, lang: Language): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (lang === 'gu') {
    if (h > 24) return `${Math.floor(h / 24)} દિવસ પહેલા`;
    if (h > 0) return `${h} કલાક પહેલા`;
    return `${m} મિનિટ પહેલા`;
  }
  if (lang === 'hi') {
    if (h > 24) return `${Math.floor(h / 24)} दिन पहले`;
    if (h > 0) return `${h} घंटे पहले`;
    return `${m} मिनट पहले`;
  }
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint: c, isNew = false, onClick }) => {
  const { language, t } = useLanguage();
  const accentColor = getCategoryColor(c.category);
  const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.Pending;

  const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
  const statusKey = (c.status || '').toLowerCase().replace(/ /g, '_');
  const statusLabel = t(`status.${statusKey}`, c.status);
  const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);
  const isCritical = (c.severity_score || 0) >= 80;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-start gap-3 rounded-lg border transition-colors cursor-pointer bg-white p-3.5 shadow-2xs hover:border-slate-400 hover:bg-slate-50/70 ${
        isNew ? 'bg-blue-50/80 border-blue-300' : 'border-slate-200'
      }`}
    >
      {/* Category Icon */}
      <div className="mt-0.5 p-2 rounded bg-slate-50 text-slate-700 border border-slate-200 shrink-0">
        <CategoryIcon category={c.category} size={16} color={accentColor} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-[#0B2545] capitalize text-xs truncate">
              {catLabel}
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-semibold shrink-0">
              #{c.id}
            </span>
          </div>

          <span
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              borderColor: statusStyle.border,
            }}
            className="text-[10px] font-bold px-2 py-0.5 rounded border shrink-0"
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-2 line-clamp-1">
          {c.description ||
            (language === 'gu'
              ? 'નાગરિક દ્વારા નોંધાયેલ ફરિયાદ.'
              : language === 'hi'
              ? 'नागरिक द्वारा दर्ज शिकायत।'
              : 'Civic infrastructure report submitted by citizen.')}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
          <span className="truncate">📍 {wardLabel}</span>
          <span className="shrink-0">{timeAgo(c.created_at, language)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <ConfirmationAvatarStack count={c.confirmation_count || 1} size={18} />
          {isCritical ? (
            <span className="text-[10px] font-mono font-bold text-[#B91C1C] bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
              ⚡ {c.severity_score || 0}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              ⚡ {c.severity_score || 0}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
