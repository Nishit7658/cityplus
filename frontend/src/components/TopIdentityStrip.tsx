'use client';

// C.1 — Top Identity Strip
// 60px fixed, warm background, custom pulse-ring logo, live status pill, ward selector, officer avatar

import React, { useEffect, useState } from 'react';
import { useSocket } from './SocketProvider';
import Link from 'next/link';
import { MOCK_COMPLAINTS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="14" cy="14" r="5" fill="#0F6B5C" />
    <path
      d="M 6 20 A 10 10 0 0 1 20 6"
      stroke="#0F6B5C"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M 3 23 A 14 14 0 0 1 23 3"
      stroke="#2E8C7B"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.35"
    />
  </svg>
);

const PulseDot = () => (
  <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, flexShrink: 0 }}>
    <span
      className="pulse-dot-ring"
      style={{
        position: 'absolute',
        inset: -2,
        borderRadius: '50%',
        background: 'var(--color-teal-700)',
      }}
    />
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-teal-700)', flexShrink: 0 }} />
  </span>
);

export const TopIdentityStrip: React.FC = () => {
  const { isConnected, lastEvent } = useSocket();
  const [todayCount, setTodayCount] = useState<number>(MOCK_COMPLAINTS.length);
  const [ward, setWard] = useState('All Wards');
  
  const wards = [
    'All Wards (Vadodara)',
    'Ward 1 — Sayajigunj',
    'Ward 2 — Akota',
    'Ward 3 — Raopura',
    'Ward 4 — Karelibaug',
    'Ward 5 — Fatehgunj',
    'Ward 6 — Manjalpur',
    'Ward 7 — Gotri',
    'Ward 8 — Makarpura',
    'Ward 9 — Gorwa',
    'Ward 10 — Nizampura',
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/complaints`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTodayCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (lastEvent?.type === 'new_complaint') {
      setTodayCount((prev) => prev + 1);
    }
  }, [lastEvent]);

  return (
    <header
      style={{
        height: 60,
        background: 'var(--color-bg-app)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Logo mark + wordmark */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <LogoMark />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
          }}
        >
          CityPulse
        </span>
      </Link>

      <div className="hidden sm:block" style={{ width: 1, height: 20, background: 'var(--color-border-strong)', flexShrink: 0 }} />

      <span
        className="hidden sm:inline-block"
        style={{
          fontSize: 'var(--fs-body-sm)',
          color: 'var(--color-ink-muted)',
          fontFamily: 'var(--font-body)',
          flexShrink: 0,
          fontWeight: 500,
        }}
      >
        VMC · Vadodara
      </span>

      <div style={{ flex: 1 }} />

      {/* Live status pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 32,
          padding: '0 14px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-teal-100)',
          color: 'var(--color-teal-900)',
          fontSize: 'var(--fs-body-sm)',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <PulseDot />
        <span>{todayCount} active today</span>
      </div>

      <div className="hidden md:block" style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Ward selector dropdown */}
      <div className="hidden md:block" style={{ position: 'relative', flexShrink: 0 }}>
        <select
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          style={{
            height: 32,
            padding: '0 28px 0 12px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border-strong)',
            background: 'var(--color-surface)',
            color: 'var(--color-ink)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B6659' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {wards.map((w) => (
            <option key={w} value={w} style={{ background: '#FFFFFF', color: '#22221F' }}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Officer avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-terracotta-100)',
            color: 'var(--color-terracotta-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
            border: '1px solid var(--color-terracotta-500)',
          }}
        >
          VM
        </div>
        <span
          className="hidden sm:inline-block"
          style={{
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
          }}
        >
          VMC Control
        </span>
      </div>
    </header>
  );
};
