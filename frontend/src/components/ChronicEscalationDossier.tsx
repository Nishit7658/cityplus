'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Complaint, Officer } from '@/types';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DossierProps {
  complaint: Complaint | null;
  officers: Officer[];
  onClose: () => void;
  onActionComplete?: () => void;
}

export const ChronicEscalationDossier: React.FC<DossierProps> = ({
  complaint,
  officers,
  onClose,
  onActionComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [selectedNewOfficer, setSelectedNewOfficer] = useState<number | undefined>();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const { language, t } = useLanguage();

  if (!complaint) return null;

  const daysOverdue = complaint.days_unresolved ?? Math.floor((Date.now() - new Date(complaint.created_at).getTime()) / 86400000);
  const monthsOverdue = (daysOverdue / 30).toFixed(1);
  const photos = complaint.evidence_photos && complaint.evidence_photos.length > 0 
    ? complaint.evidence_photos 
    : (complaint.photo_url ? [complaint.photo_url] : []);

  const formatPhotoUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleEscalationAction = async (actionType: string) => {
    setIsSubmitting(true);
    setActionSuccessMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/complaints/${complaint.id}/escalate-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          newOfficerId: selectedNewOfficer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setActionSuccessMsg(data.message || 'Action executed successfully.');
      if (onActionComplete) onActionComplete();
    } catch (err: unknown) {
      setActionSuccessMsg(err instanceof Error ? err.message : 'Action failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden z-10 my-8"
        >
          {/* Official VMC Command Header Strip */}
          <div className="bg-[#0B2545] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0">
                ⚖️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-500/90 text-white px-2 py-0.2 rounded uppercase">
                    CHRONIC GRIEVANCE REVIEW (&gt;60 DAYS)
                  </span>
                  <span className="text-slate-300 text-xs font-mono">
                    CASE RECORD #{complaint.id}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5 text-white">
                  Executive Supervisory Accountability Dossier
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            {/* Action Feedback Banner */}
            {actionSuccessMsg && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                <span>✓ {actionSuccessMsg}</span>
                <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
              </div>
            )}

            {/* Overdue Metric Telemetry Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309]">Duration Overdue</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {daysOverdue} <span className="text-xs font-semibold text-slate-500">days ({monthsOverdue} mo)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Standard Turnaround: &lt;24h</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Citizen Markings</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {complaint.confirmation_count || 1} <span className="text-xs font-semibold text-slate-500">citizens</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Reopened {complaint.reopened_count || 0}× times</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Recurrence Span</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {complaint.months_span || 2} <span className="text-xs font-semibold text-slate-500">months</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">{complaint.total_cycles || 2} continuous cycles</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Hazard Severity</span>
                <span className="text-2xl font-black text-[#0B2545] font-mono mt-0.5">
                  {complaint.severity_score || 95} <span className="text-xs font-semibold text-slate-500">/ 100</span>
                </span>
                <span className="text-[10px] text-amber-700 font-bold mt-0.5">PRIORITY WORK ORDER</span>
              </div>
            </div>

            {/* Problem Details & Ward Jurisdiction */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-3">
                <CategoryIcon category={complaint.category} size={28} color={getCategoryColor(complaint.category)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                      {complaint.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-700">
                      📍 {complaint.ward_name || `Ward ${complaint.ward_id || 1}`}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      GPS: {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    &quot;{complaint.description || 'Chronic municipal infrastructure failure reported repeatedly by citizens.'}&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Multi-Photo Citizen Evidence Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span>📸</span> Citizen Photo Evidence Record ({photos.length} photos captured)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Captured via Telegram & WhatsApp Citizen Bots
                </span>
              </div>

              {photos.length > 0 ? (
                <div className="space-y-2">
                  <div className="aspect-video max-h-64 rounded-lg overflow-hidden bg-slate-900 border border-slate-300 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formatPhotoUrl(photos[activePhotoIdx])}
                      alt={`Citizen photo evidence ${activePhotoIdx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      Evidence #{activePhotoIdx + 1} of {photos.length}
                    </div>
                  </div>

                  {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photos.map((p, idx) => (
                        <button
                          key={p}
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`w-16 h-12 rounded border overflow-hidden shrink-0 cursor-pointer ${
                            activePhotoIdx === idx ? 'ring-2 ring-red-500 border-red-500' : 'opacity-70 hover:opacity-100 border-slate-300'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formatPhotoUrl(p)} alt="Thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-400 font-medium bg-slate-50">
                  No camera photos attached. Citizen provided verified GPS coordinates & detailed notes.
                </div>
              )}
            </div>

            {/* Side-by-Side Accountability Breakdown */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2.5">
                🏛️ Administrative Chain of Responsibility
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Assigned Worker Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-3">
                    <span>👷</span> Assigned Field Worker / Junior Engineer
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Worker Name:</span>
                      <strong className="text-slate-900">{complaint.officer_name || 'Rajesh Patel'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Department:</span>
                      <span className="font-semibold text-[#133E87]">{complaint.officer_department || 'Road & Building Dept'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Official Contact:</span>
                      <span className="font-mono text-slate-800">{complaint.officer_phone || '+91 98250 12345'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Current Status:</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                        {complaint.status} (Overdue)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Intermediate Supervisor Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-3">
                    <span>📡</span> Intermediate Assigner / Zonal Supervisor
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Supervisor Name:</span>
                      <strong className="text-slate-900">{complaint.assigned_by_supervisor_name || 'Sayajigunj Zonal Dispatcher'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Administrative Cell:</span>
                      <span className="font-semibold text-slate-800">Zonal Redressal Cell (Ward 1)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Assignment Date:</span>
                      <span className="font-mono text-slate-700">{new Date(complaint.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Accountability Level:</span>
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-0.2 rounded border border-red-200">
                        Zonal Supervisor Escalation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Action Toolbar */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                ⚡ Executive Incharge Corrective Actions
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleEscalationAction('supervisor_notice')}
                  className="p-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 text-xs font-bold transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-base mb-1">🚨</span>
                  <span>Issue Disciplinary Notice</span>
                  <span className="text-[10px] text-red-600 font-normal mt-1">To Supervisor & Worker</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleEscalationAction('notify_citizens')}
                  className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-base mb-1">📢</span>
                  <span>Notify Citizens</span>
                  <span className="text-[10px] text-blue-600 font-normal mt-1">Broadcast progress to {complaint.confirmation_count || 1} people</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleEscalationAction('schedule_inspection')}
                  className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-base mb-1">📌</span>
                  <span>Joint Site Inspection</span>
                  <span className="text-[10px] text-amber-700 font-normal mt-1">Summon Zonal Squad</span>
                </button>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-300 flex flex-col justify-between">
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    🔄 Emergency Reassign
                  </label>
                  <select
                    value={selectedNewOfficer ?? ''}
                    onChange={(e) => setSelectedNewOfficer(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-8 text-[11px] font-semibold rounded border border-slate-300 bg-white mb-2"
                  >
                    <option value="">Choose New Officer</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>{o.name} ({o.department})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isSubmitting || !selectedNewOfficer}
                    onClick={() => handleEscalationAction('reassign_squad')}
                    className="w-full py-1 rounded bg-[#0B2545] text-white text-[10px] font-bold hover:bg-[#133E87] disabled:opacity-50 cursor-pointer"
                  >
                    Confirm Reassign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
