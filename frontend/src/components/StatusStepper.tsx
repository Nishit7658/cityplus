'use client';

// C.9 — Status Stepper (Complaint Detail Drawer) with Bilingual i18n
// Vadodara Municipal Corporation (VMC)

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const RAW_STEPS = [
  { key: 'pending', labelKey: 'status.pending' },
  { key: 'assigned', labelKey: 'status.assigned' },
  { key: 'in_progress', labelKey: 'status.in_progress' },
  { key: 'resolved', labelKey: 'status.resolved' },
];

interface StatusStepperProps {
  currentStatus: string;
  logs?: { new_status: string; changed_at: string; officer_name?: string }[];
}

const CheckGlyph = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1 4L3 6L7 2" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, logs = [] }) => {
  const { language, t } = useLanguage();

  const currentIndex = RAW_STEPS.findIndex((s) =>
    s.key === (currentStatus || '').toLowerCase().replace(/\s+/g, '_')
  );

  const getLogForStep = (stepKey: string) =>
    logs.find((l) => (l.new_status || '').toLowerCase().replace(/\s+/g, '_') === stepKey);

  return (
    <div className="flex flex-col">
      {RAW_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent  = i === currentIndex;
        const isFuture   = i > currentIndex;
        const log = getLogForStep(step.key);

        return (
          <div key={step.key} className="flex gap-4 relative">
            {/* Connecting line */}
            <div className="flex flex-col items-center w-5 shrink-0">
              {/* Node */}
              <div className="relative inline-flex items-center justify-center z-1">
                {isCompleted && (
                  <div className="w-5 h-5 rounded-full bg-[#15803D] flex items-center justify-center">
                    <CheckGlyph />
                  </div>
                )}
                {isCurrent && (
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-[#0B2545] border-2 border-blue-200" />
                  </div>
                )}
                {isFuture && (
                  <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white" />
                )}
              </div>

              {/* Connecting line below (except last) */}
              {i < RAW_STEPS.length - 1 && (
                <div
                  className={`flex-1 w-0.5 min-h-[32px] mt-1 ${
                    isCompleted ? 'bg-[#15803D]' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>

            {/* Step content */}
            <div className={`flex-1 ${i < RAW_STEPS.length - 1 ? 'pb-6' : ''}`}>
              <div
                className={`text-xs font-bold ${
                  isCurrent ? 'text-[#0B2545]' : isFuture ? 'text-slate-400' : 'text-slate-800'
                }`}
              >
                {t(step.labelKey)}
              </div>
              {(log || isCompleted || isCurrent) && (
                <div className="flex gap-2 mt-0.5 flex-wrap text-[11px] text-slate-500 font-mono">
                  {log?.changed_at && (
                    <span>
                      {new Date(log.changed_at).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                  {log?.officer_name && (
                    <span>• {log.officer_name}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
