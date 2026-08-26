'use client';

// F.4 / D.6 — Complaint Detail Drawer (Clean Enterprise Slide-Over Sheet) with Full Trilingual i18n
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Accessible ARIA dialog, Before/After Photo Evidence Pipeline, Fullscreen Image Lightbox

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Complaint, Officer } from '@/types';
import { CategoryIcon, getCategoryColor, getSeverityColor } from './CategoryIcon';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';
import { StatusStepper } from './StatusStepper';
import { ImageLightbox } from './ImageLightbox';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DrawerProps {
  complaint: Complaint | null;
  officers: Officer[];
  onClose: () => void;
  onUpdateStatus: (id: number, status: string, officerId?: number) => Promise<boolean | void>;
  onResolve: (id: number, officerId?: number, photoAfterUrl?: string) => Promise<boolean | void>;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending:       { bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' },
  Assigned:      { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
  'In Progress': { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  Resolved:      { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; src: string; title: string; subtitle?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { language, t } = useLanguage();

  useEffect(() => {
    if (complaint) {
      setSelectedOfficer(complaint.assigned_officer_id ?? undefined);
      setResolutionPhotoUrl(complaint.photo_after_url ?? null);
      setErrorMessage(null);
    }
  }, [complaint?.id, complaint?.assigned_officer_id, complaint?.photo_after_url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && complaint && !lightbox?.isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complaint, lightbox?.isOpen, onClose]);

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

  const accentColor = complaint ? getCategoryColor(complaint.category) : '#0B2545';
  const severityColor = complaint ? getSeverityColor(complaint.confirmation_count, complaint.status) : '#0B2545';
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

  // Handle uploading officer resolution proof photo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !complaint) return;

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploadingPhoto(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload photo.');
      }

      const data = await res.json();
      setResolutionPhotoUrl(data.url);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper to format image full URL
  const formatPhotoUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const intakePhotoFull = complaint?.photo_url ? formatPhotoUrl(complaint.photo_url) : null;
  const repairPhotoFull = resolutionPhotoUrl ? formatPhotoUrl(resolutionPhotoUrl) : complaint?.photo_after_url ? formatPhotoUrl(complaint.photo_after_url) : null;

  return (
    <>
      <AnimatePresence>
        {complaint && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[1200]"
            />

            {/* Drawer panel (Clean white sheet, no left stripe) */}
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-white shadow-2xl z-[1250] flex flex-col overflow-y-auto border-l border-slate-200"
            >
              {/* Header with Title and Close Button */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-xs z-20">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}35` }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border"
                    >
                      <CategoryIcon category={complaint.category} size={13} />
                      <span className="capitalize">{catLabel}</span>
                    </span>

                    <span
                      style={{ backgroundColor: `${severityColor}15`, color: severityColor, borderColor: `${severityColor}35` }}
                      className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border"
                    >
                      {severityText}
                    </span>

                    <span
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
                      className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border"
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h2 id="drawer-title" className="text-lg font-bold text-[#0B2545] capitalize leading-snug">
                    {catLabel} — #{complaint.id}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 text-base cursor-pointer shrink-0 transition-colors"
                  aria-label="Close details drawer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col space-y-6">
                {/* Location & Metadata */}
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-slate-700">
                    <span className="font-semibold text-slate-500">Jurisdiction:</span>
                    <span className="font-bold text-[#0B2545]">📍 {wardLabel}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-slate-700">
                    <span className="font-semibold text-slate-500">
                      {language === 'gu' ? 'નોંધણી તારીખ:' : language === 'hi' ? 'दर्ज तारीख:' : 'Logged At:'}
                    </span>
                    <span className="font-bold">
                      {new Date(complaint.created_at).toLocaleDateString(
                        language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                        { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                      )}
                    </span>
                  </div>
                  {typeof complaint.latitude === 'number' && (
                    <div className="flex items-center justify-between font-mono text-slate-700">
                      <span className="font-semibold text-slate-500">GPS Coordinates:</span>
                      <span className="font-semibold">{complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {language === 'gu' ? 'વિગતવાર વર્ણન' : language === 'hi' ? 'शिकायत का विवरण' : 'Description'}
                  </div>
                  <div className="p-3.5 rounded bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed">
                    {complaint.description ||
                      (language === 'gu'
                        ? 'નાગરિક દ્વારા નોંધાયેલ ફરિયાદ.'
                        : language === 'hi'
                        ? 'नागरिक द्वारा दर्ज शिकायत।'
                        : 'Civic infrastructure report submitted by citizen.')}
                  </div>
                </div>

                {/* Error Toast */}
                {errorMessage && (
                  <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Photo Evidence & Resolution Proof Pipeline */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                    <span>📷 {t('drawer.evidence_title')}</span>
                    {intakePhotoFull && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        ✓ Verified Media
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Citizen Intake Evidence Photo */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                        <span>{t('drawer.intake_photo')}</span>
                        <span className="text-[10px] text-slate-400 font-mono">BEFORE</span>
                      </div>

                      {intakePhotoFull ? (
                        <div
                          onClick={() =>
                            setLightbox({
                              isOpen: true,
                              src: intakePhotoFull,
                              title: `${catLabel} #${complaint.id} — Intake Evidence`,
                              subtitle: `Reported by citizen • ${new Date(complaint.created_at).toLocaleDateString()}`,
                            })
                          }
                          className="relative group cursor-pointer overflow-hidden rounded border border-slate-300 aspect-video bg-black flex items-center justify-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={intakePhotoFull}
                            alt="Citizen intake photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                            <span>🔍</span> {t('drawer.click_to_expand')}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video rounded border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-3 text-center text-slate-400">
                          <span className="text-xl mb-1 opacity-50">📷</span>
                          <span className="text-[11px] font-medium">{t('drawer.no_photo')}</span>
                        </div>
                      )}
                    </div>

                    {/* 2. Field Officer Repair Proof Photo */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                        <span>{t('drawer.repair_photo')}</span>
                        <span className="text-[10px] text-emerald-600 font-mono font-bold">AFTER</span>
                      </div>

                      {repairPhotoFull ? (
                        <div
                          onClick={() =>
                            setLightbox({
                              isOpen: true,
                              src: repairPhotoFull,
                              title: `${catLabel} #${complaint.id} — Resolution Proof`,
                              subtitle: `Verified by field engineering crew • ${complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : 'Work Completed'}`,
                            })
                          }
                          className="relative group cursor-pointer overflow-hidden rounded border border-emerald-300 aspect-video bg-black flex items-center justify-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={repairPhotoFull}
                            alt="Officer resolution photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                            <span>🔍</span> {t('drawer.click_to_expand')}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video rounded border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-3 text-center">
                          {complaint.status !== 'Resolved' ? (
                            <>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="officer-photo-upload"
                              />
                              <label
                                htmlFor="officer-photo-upload"
                                className="text-[11px] font-bold text-[#133E87] hover:text-[#0B2545] cursor-pointer flex flex-col items-center"
                              >
                                <span className="text-xl mb-1">📤</span>
                                {isUploadingPhoto ? t('drawer.uploading') : t('drawer.upload_resolution_photo')}
                              </label>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Resolution proof logged
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Citizen Confirmations */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    {t('drawer.confirmations')} ({complaint.confirmation_count || 1})
                  </div>
                  <ConfirmationAvatarStack count={complaint.confirmation_count || 1} size={26} />
                </div>

                {/* Resolution Stepper */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    {t('drawer.timeline')}
                  </div>
                  <StatusStepper currentStatus={complaint.status} />
                </div>

                {/* Assign Officer */}
                {complaint.status !== 'Resolved' && (
                  <div className="pt-4 border-t border-slate-200">
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
                  <div className="flex gap-3 pt-2">
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
                          await onResolve(complaint.id, selectedOfficer, resolutionPhotoUrl || undefined);
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
                  <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
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

      {/* Interactive Fullscreen Image Lightbox */}
      {lightbox && (
        <ImageLightbox
          isOpen={lightbox.isOpen}
          src={lightbox.src}
          title={lightbox.title}
          subtitle={lightbox.subtitle}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};
