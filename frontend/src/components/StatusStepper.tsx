'use client';

// C.9 — Status Stepper (Complaint Detail Drawer)
// Vertical layout, pulse-dot on current step, timestamps in mono font

import React from 'react';

const STEPS = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

interface StatusStepperProps {
  currentStatus: string;
  logs?: { new_status: string; changed_at: string; officer_name?: string }[];
}

const CheckGlyph = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1 4L3 6L7 2" stroke="#FAF7F2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, logs = [] }) => {
  const currentIndex = STEPS.findIndex(s =>
    s.toLowerCase() === (currentStatus || '').toLowerCase()
  );

  const getLogForStep = (step: string) =>
    logs.find(l => l.new_status?.toLowerCase() === step.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent  = i === currentIndex;
        const isFuture   = i > currentIndex;
        const log = getLogForStep(step);

        return (
          <div key={step} style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              {/* Node */}
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                {isCompleted && (
                  <div style={{
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: 'var(--color-teal-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckGlyph />
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: '50%',
                      background: 'var(--color-teal-700)',
                      border: '3px solid var(--color-teal-200)',
                    }} />
                    <div
                      className="pulse-dot-ring"
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        background: 'var(--color-teal-500)',
                      }}
                    />
                  </div>
                )}
                {isFuture && (
                  <div style={{
                    width: 12, height: 12,
                    borderRadius: '50%',
                    border: '2px solid var(--color-border-strong)',
                    background: 'transparent',
                  }} />
                )}
              </div>

              {/* Connecting line below (except last) */}
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  width: 2,
                  minHeight: 32,
                  background: isCompleted ? 'var(--color-teal-700)' : 'var(--color-border)',
                  borderStyle: isCurrent ? 'dashed' : 'solid',
                  borderWidth: isCurrent ? '0 0 0 2px' : 0,
                  borderColor: 'var(--color-border)',
                  marginTop: 2,
                }} />
              )}
            </div>

            {/* Step content */}
            <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0, flex: 1 }}>
              <div style={{
                fontSize: 'var(--fs-body-md)',
                fontWeight: isCurrent ? 600 : 500,
                color: isFuture ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                fontFamily: 'var(--font-body)',
                marginTop: isCurrent ? -2 : isFuture ? 0 : -2,
              }}>
                {step}
              </div>
              {(log || isCompleted || isCurrent) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                  {log?.changed_at && (
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                      {new Date(log.changed_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                  {log?.officer_name && (
                    <span style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
                      · {log.officer_name}
                    </span>
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
