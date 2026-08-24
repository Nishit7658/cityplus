'use client';

// F.4 / D.6 — Complaint Detail Drawer
// 420px right-side slide-in on desktop, 100% on mobile
// Backdrop blur+dim, cascade fade for inner content, vertical status stepper, officer assignment

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Complaint, Officer } from '@/types';
import { CategoryIcon, getCategoryColor, getSeverityColor } from './CategoryIcon';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';
import { StatusStepper } from './StatusStepper';

interface DrawerProps {
  complaint: Complaint | null;
  officers: Officer[];
  onClose: () => void;
  onUpdateStatus: (id: number, status: string, officerId?: number) => void;
  onResolve: (id: number, officerId?: number) => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending:    { bg: 'var(--color-tint-pending)',  color: 'var(--color-status-pending)' },
  Assigned:   { bg: 'var(--color-tint-medium)',   color: 'var(--color-status-progress)' },
  'In Progress': { bg: 'var(--color-tint-medium)', color: 'var(--color-status-progress)' },
  Resolved:   { bg: 'var(--color-tint-low)',      color: 'var(--color-status-resolved)' },
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

  useEffect(() => {
    if (complaint) {
      setSelectedOfficer(complaint.assigned_officer_id ?? undefined);
    }
  }, [complaint?.id, complaint?.assigned_officer_id]);

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

  return (
    <AnimatePresence>
      {complaint && (
        <>
          {/* Backdrop — dim + blur */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(34,34,31,0.25)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-cp-surface shadow-drawer flex flex-col overflow-y-auto"
            style={{
              zIndex: 100,
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: 'var(--color-ink-muted)',
                zIndex: 10,
              }}
              aria-label="Close"
            >
              ×
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

            <div style={{ padding: '28px 28px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* D.6 cascade — badges row fades in first at 80ms */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.2 }}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 28,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: `${accentColor}18`,
                    color: accentColor,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <CategoryIcon category={complaint.category} size={14} />
                  <span className="capitalize">{(complaint.category || '').replace(/_/g, ' ')}</span>
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 28,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: `${severityColor}18`,
                    color: severityColor,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${severityColor}40`,
                  }}
                >
                  {complaint.confirmation_count >= 8
                    ? 'Critical'
                    : complaint.confirmation_count >= 4
                    ? 'Medium'
                    : 'Low'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 28,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${statusStyle.color}50`,
                  }}
                >
                  {complaint.status}
                </span>
              </motion.div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  marginBottom: 6,
                  textTransform: 'capitalize',
                  lineHeight: 1.25,
                }}
              >
                {(complaint.category || '').replace(/_/g, ' ')} — #{complaint.id}
              </h2>

              {/* Meta line */}
              <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 2 }}>
                {complaint.ward_name || `Ward ${complaint.ward_id || 1}`} · Reported {new Date(complaint.created_at).toLocaleDateString('en-IN')}
              </p>
              {typeof complaint.latitude === 'number' && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-faint)', marginBottom: 14 }}>
                  {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                </p>
              )}
              <p style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.5, marginBottom: 16 }}>
                {complaint.description || 'Civic infrastructure report submitted by citizen.'}
              </p>

              {/* D.6 cascade — mini map / coordinate card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.14, duration: 0.2 }}
                style={{ marginBottom: 20 }}
              >
                {typeof complaint.latitude === 'number' && (
                  <div
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-sunken)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CategoryIcon category={complaint.category} size={22} color={accentColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Location Coordinates
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
                        {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Confirmed by */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 'var(--fs-eyebrow)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-ink-muted)',
                    marginBottom: 10,
                    fontWeight: 600,
                  }}
                >
                  Citizen Confirmations ({complaint.confirmation_count || 1})
                </div>
                <ConfirmationAvatarStack count={complaint.confirmation_count || 1} size={28} />
              </div>

              {/* D.6 cascade — status stepper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                style={{ marginBottom: 28 }}
              >
                <div
                  style={{
                    fontSize: 'var(--fs-eyebrow)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-ink-muted)',
                    marginBottom: 16,
                    fontWeight: 600,
                  }}
                >
                  Resolution Timeline
                </div>
                <StatusStepper currentStatus={complaint.status} />
              </motion.div>

              {/* Assign Officer */}
              {complaint.status !== 'Resolved' && (
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      fontSize: 'var(--fs-eyebrow)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-ink-muted)',
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    Assign Field Officer
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      value={selectedOfficer ?? ''}
                      onChange={(e) => setSelectedOfficer(e.target.value ? Number(e.target.value) : undefined)}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-strong)',
                        background: 'var(--color-surface-sunken)',
                        color: 'var(--color-ink)',
                        padding: '0 12px',
                        fontSize: 14,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <option value="">Choose officer…</option>
                      {safeOfficers.map((o) => (
                        <option key={o.id} value={o.id} style={{ background: '#FFFFFF', color: '#22221F' }}>
                          {o.name} ({o.department})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (selectedOfficer) {
                          setIsSubmitting(true);
                          await onUpdateStatus(complaint.id, 'Assigned', selectedOfficer);
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting || !selectedOfficer}
                      style={{
                        height: 42,
                        padding: '0 18px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-teal-700)',
                        color: '#FAF7F2',
                        border: 'none',
                        cursor: isSubmitting || !selectedOfficer ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        opacity: !selectedOfficer ? 0.6 : 1,
                      }}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {complaint.status !== 'Resolved' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 16 }}>
                  <button
                    onClick={async () => {
                      setIsSubmitting(true);
                      await onUpdateStatus(complaint.id, 'In Progress', selectedOfficer);
                      setIsSubmitting(false);
                    }}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-teal-700)',
                      background: 'transparent',
                      color: 'var(--color-teal-700)',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={async () => {
                      setIsSubmitting(true);
                      await onResolve(complaint.id, selectedOfficer);
                      setIsSubmitting(false);
                    }}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-teal-700)',
                      color: '#FAF7F2',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Mark Resolved
                  </button>
                </div>
              )}

              {complaint.reopened_count > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-terracotta-700)',
                    color: 'var(--color-terracotta-700)',
                    fontSize: 'var(--fs-body-sm)',
                    fontWeight: 500,
                  }}
                >
                  ↩ Reopened {complaint.reopened_count}× by citizen verification
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
