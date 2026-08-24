'use client';

// Settings Page — re-skinned to new design tokens
// WhatsApp simulator + backend config

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const [phone, setPhone]           = useState('+919876543210');
  const [message, setMessage]       = useState('');
  const [simStatus, setSimStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [simResponse, setSimResponse] = useState<string>('');

  const simulate = async () => {
    setSimStatus('loading');
    setSimResponse('');
    try {
      const res = await fetch(`${API_URL}/api/webhook/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      });
      const data = await res.json();
      setSimResponse(JSON.stringify(data, null, 2));
      setSimStatus('success');
    } catch (err) {
      setSimResponse(String(err));
      setSimStatus('error');
    }
  };

  const scenarios = [
    { label: 'Start new complaint', value: 'Hi' },
    { label: 'Select Pothole',      value: '1' },
    { label: 'Confirm Yes',         value: 'Yes' },
    { label: 'Reject (No)',         value: 'No' },
    { label: 'Send location',       value: 'loc:22.3072,73.1812' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 800, margin: '0 auto', padding: '32px 40px' }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 'var(--fs-eyebrow)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-muted)', fontWeight: 600, marginBottom: 8 }}>
          DEVELOPER TOOLS
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display-md)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.2 }}>
          Settings
        </h1>
      </div>

      {/* WhatsApp Simulator */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-rest)',
        marginBottom: 28,
      }}>
        {/* Left accent bar — terracotta for dev/danger feel */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--color-terracotta-700)' }} />
        </div>

        <div style={{ padding: '24px 28px' }}>
          <p style={{ fontSize: 'var(--fs-eyebrow)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-terracotta-700)', fontWeight: 600, marginBottom: 4 }}>
            DEV ONLY
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
            WhatsApp Chatbot Simulator
          </h2>
          <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 24, lineHeight: 1.55 }}>
            Simulates an incoming WhatsApp message, runs it through the session state machine, and returns the bot's reply — without needing the real Meta API.
          </p>

          {/* Scenario quick-fills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {scenarios.map(s => (
              <button
                key={s.label}
                onClick={() => setMessage(s.value)}
                style={{
                  height: 32, padding: '0 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-sunken)',
                  color: 'var(--color-ink-muted)',
                  fontSize: 12, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 'var(--fs-eyebrow)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+919876543210"
              style={{
                width: '100%',
                height: 44,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-strong)',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-ink)',
                fontSize: 'var(--fs-body-md)',
                fontFamily: 'var(--font-mono)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Message input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 'var(--fs-eyebrow)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Message
            </label>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && simulate()}
              placeholder='e.g. "Hi" or "1" or "Yes"'
              style={{
                width: '100%',
                height: 44,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-strong)',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-ink)',
                fontSize: 'var(--fs-body-md)',
                fontFamily: 'var(--font-body)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={simulate}
            disabled={simStatus === 'loading' || !message.trim()}
            style={{
              height: 44, padding: '0 24px',
              borderRadius: 'var(--radius-md)',
              background: simStatus === 'loading' ? 'var(--color-border)' : 'var(--color-teal-700)',
              color: 'var(--color-ink-inverse)',
              border: 'none',
              cursor: simStatus === 'loading' || !message.trim() ? 'not-allowed' : 'pointer',
              fontSize: 'var(--fs-body-md)', fontWeight: 600,
              fontFamily: 'var(--font-body)',
              transition: 'background 200ms ease',
            }}
          >
            {simStatus === 'loading' ? 'Sending…' : '↗ Send Simulated Message'}
          </button>

          {/* Response output */}
          {simResponse && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20,
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: simStatus === 'error' ? 'var(--color-tint-critical)' : 'var(--color-surface-sunken)',
                border: `1px solid ${simStatus === 'error' ? 'var(--color-severity-critical)' : 'var(--color-border)'}`,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                {simStatus === 'error' ? 'Error' : 'Response'}
              </p>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: simStatus === 'error' ? 'var(--color-severity-critical)' : 'var(--color-ink)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
              }}>
                {simResponse}
              </pre>
            </motion.div>
          )}
        </div>
      </div>

      {/* Environment info */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-rest)',
      }}>
        <p style={{ fontSize: 'var(--fs-eyebrow)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-muted)', fontWeight: 600, marginBottom: 16 }}>
          ENVIRONMENT
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'API URL',    value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000 (default)' },
            { key: 'Socket URL', value: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000 (default)' },
            { key: 'Version',    value: 'CityPulse v0.1.0 — Hackathon Build' },
          ].map(({ key, value }) => (
            <div key={key} style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              <span style={{ minWidth: 100, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-body)' }}>{key}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', fontSize: 12 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
