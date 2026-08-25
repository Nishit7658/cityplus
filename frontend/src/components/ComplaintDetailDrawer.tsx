'use client';

// F.4 / D.6 — Complaint Detail Drawer with Full Trilingual i18n & Accessibility
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Complaint, Officer } from '@/types';
import { CategoryIcon, getCategoryColor, getSeverityColor } from './CategoryIcon';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';
import { StatusStepper } from './StatusStepper';
import { useLanguage } from '@/context/LanguageContext';

interface DrawerProps {
  complaint: Complaint | null;
  officers: Officer[];
  onClose: () => void;
  onUpdateStatus: (id: number, status: string, officerId?: number) => Promise<boolean | void>;
  onResolve: (id: number, officerId?: number) => Promise<boolean | void>;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending:    { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  Assigned:   { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  'In Progress': { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  Resolved:   { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
};

export const ComplaintDetailDrawer: React.FC<DrawerProps> = ({
  complaint,
  officers,
  onClose,
  onUpdateStatus,
  onResolve,
}) => {
  const [selectedOfficer, setSelectedOfficer] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (complaint) {
      setSelectedOfficer(complaint.assigned_officer_id ?? undefined);
      setErrorMessage(null);
    }
  }, [complaint?.id, complaint?.assigned_officer_id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && complaint) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complaint, onClose]);

  useEffect(() => {
    if (complaint) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [complaint]);

  const accentColor = complaint ? getCategoryColor(complaint.category) : '#6B9E7A';
  const severityColor = complaint ? getSeverityColor(complaint.confirmation_count, complaint.status) : '#6B9E7A';
  const statusStyle = complaint ? STATUS_STYLES[complaint.status] || STATUS_STYLES.Pending : STATUS_STYLES.Pending;
  const safeOfficers = Array.isArray(officers) ? officers : [];

  const catLabel = complaint ? t(`cat.${complaint.category}`, (complaint.category || '').replace(/_/g, ' ')) : '';
  const statusKey = complaint ? (complaint.status || '').toLowerCase().replace(/ /g, '_') : 'pending';
  const statusLabel = t(`status.${statusKey}`, complaint?.status || '');
  const wardLabel = complaint ? t(`ward.${complaint.ward_id}`, complaint.ward_name || `Ward ${complaint.ward_id}`) : '';

  const severityText = complaint
    ? complaint.confirmation_count >= 8
      ? t('sev.critical')
      : complaint.confirmation_count >= 4
      ? t('sev.medium')
      : t('sev.low')
    : '';

  return (
    <AnimatePresence>
      {complaint && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1200]"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl z-[1250] flex flex-col overflow-y-auto border-l border-slate-200"
          >
            {/* Close button (min 44x44 touch area) */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-11 h-11 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 text-lg cursor-pointer z-10 transition-colors"
              aria-label="Close details drawer"
            >
              ✕
            </button>

            {/* Left accent bar */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                background: accentColor,
              }}
            />

            <div className="p-7 flex-1 flex flex-col pl-9">
              {/* Badges row */}
              <div className="flex gap-2 flex-wrap mb-4">
                <span
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}35` }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                >
                  <CategoryIcon category={complaint.category} size={14} />
                  <span className="capitalize">{catLabel}</span>
                </span>

                <span
                  style={{ backgroundColor: `${severityColor}15`, color: severityColor, borderColor: `${severityColor}35` }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                >
                  {severityText}
                </span>

                <span
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                >
                  {statusLabel}
                </span>
              </div>

              {/* Title */}
              <h2 id="drawer-title" className="text-xl font-bold text-[#0B2545] capitalize mb-1">
                {catLabel} — #{complaint.id}
              </h2>

              {/* Location & Reported date */}
              <p className="text-xs text-slate-500 mb-1 font-mono">
                📍 {wardLabel} • {language === 'gu' ? 'નોંધણી તારીખ: ' : language === 'hi' ? 'दर्ज तारीख: ' : 'Reported: '}
                {new Date(complaint.created_at).toLocaleDateString(
                  language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                )}
              </p>

              {typeof complaint.latitude === 'number' && (
                <p className="font-mono text-xs text-slate-400 mb-4">
                  GPS: {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                </p>
              )}

              {/* Description */}
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed mb-5">
                {complaint.description ||
                  (language === 'gu'
                    ? 'નાગરિક દ્વારા નોંધાયેલ ફરિયાદ.'
                    : language === 'hi'
                    ? 'नागरिक द्वारा दर्ज शिकायत।'
                    : 'Civic infrastructure report submitted by citizen.')}
              </div>

              {/* Error Message Toast if action fails */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Citizen Confirmations */}
              <div className="mb-6 pb-4 border-b border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-2.5">
                  {t('drawer.confirmations')} ({complaint.confirmation_count || 1})
                </div>
                <ConfirmationAvatarStack count={complaint.confirmation_count || 1} size={26} />
              </div>

              {/* Resolution Stepper */}
              <div className="mb-6 pb-4 border-b border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-4">
                  {t('drawer.timeline')}
                </div>
                <StatusStepper currentStatus={complaint.status} />
              </div>

              {/* Assign Officer */}
              {complaint.status !== 'Resolved' && (
                <div className="mb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block mb-2">
                    {t('drawer.assign_officer')}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedOfficer ?? ''}
                      onChange={(e) => setSelectedOfficer(e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1 h-11 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-800 px-3 focus:outline-none focus:border-[#133E87] cursor-pointer"
                    >
                      <option value="">{t('drawer.choose_officer')}</option>
                      {safeOfficers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.department})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (selectedOfficer) {
                          setIsSubmitting(true);
                          setErrorMessage(null);
                          try {
                            await onUpdateStatus(complaint.id, 'Assigned', selectedOfficer);
                          } catch {
                            setErrorMessage('Failed to assign officer. Please try again.');
                          } finally {
                            setIsSubmitting(false);
                          }
                        }
                      }}
                      disabled={isSubmitting || !selectedOfficer}
                      className="h-11 px-4 rounded bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133E87] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : t('drawer.assign_button')}
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons (min 44px height for accessibility) */}
              {complaint.status !== 'Resolved' && (
                <div className="flex gap-3 mt-auto pt-4 border-t border-slate-200">
                  <button
                    onClick={async () => {
                      setIsSubmitting(true);
                      setErrorMessage(null);
                      try {
                        await onUpdateStatus(complaint.id, 'In Progress', selectedOfficer);
                      } catch {
                        setErrorMessage('Failed to update status. Please try again.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded border border-[#0B2545] bg-white text-[#0B2545] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? '...' : t('drawer.in_progress_button')}
                  </button>
                  <button
                    onClick={async () => {
                      setIsSubmitting(true);
                      setErrorMessage(null);
                      try {
                        await onResolve(complaint.id, selectedOfficer);
                      } catch {
                        setErrorMessage('Failed to mark resolved. Please try again.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? '...' : t('drawer.mark_resolved_button')}
                  </button>
                </div>
              )}

              {complaint.reopened_count > 0 && (
                <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                  {language === 'gu'
                    ? `↩ નાગરિક ચકાસણી દ્વારા ${complaint.reopened_count}× વખત ફરી ખોલવામાં આવેલ છે`
                    : language === 'hi'
                    ? `↩ नागरिक सत्यापन द्वारा ${complaint.reopened_count}× बार पुनः खोला गया`
                    : `↩ Reopened ${complaint.reopened_count}× by citizen verification`}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
