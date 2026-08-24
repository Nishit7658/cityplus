'use client';

// C.2 — Pill Tab Navigation
// Left-aligned pill row, D.4 sliding underline indicator using Framer Motion layoutId
// Dynamic badge counts on Complaint Queue, D.1 badge bounce on Socket.IO arrivals

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from './SocketProvider';
import { Complaint } from '@/types';
import { MOCK_COMPLAINTS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Tab {
  label: string;
  href: string;
  icon: (color: string) => React.ReactNode;
}

const TABS: Tab[] = [
  {
    label: 'Overview',
    href: '/',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Live Map',
    href: '/map',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    label: 'Complaint Queue',
    href: '/queue',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    label: 'Hotspots',
    href: '/hotspots',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    label: 'Officers',
    href: '/officers',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Transparency',
    href: '/transparency',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export const PillTabNav: React.FC = () => {
  const pathname = usePathname();
  const { lastEvent } = useSocket();
  const [pendingCount, setPendingCount] = useState<number>(
    MOCK_COMPLAINTS.filter((c) => c.status === 'Pending').length
  );

  useEffect(() => {
    fetch(`${API_URL}/api/complaints`)
      .then((r) => r.json())
      .then((data: Complaint[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const count = data.filter((c) => c.status === 'Pending').length;
          setPendingCount(count);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (lastEvent?.type === 'new_complaint') {
      setPendingCount((prev) => prev + 1);
    } else if (lastEvent?.type === 'complaint_status_changed') {
      fetch(`${API_URL}/api/complaints`)
        .then((r) => r.json())
        .then((data: Complaint[]) => {
          if (Array.isArray(data)) {
            setPendingCount(data.filter((c) => c.status === 'Pending').length);
          }
        })
        .catch(() => {});
    }
  }, [lastEvent]);

  return (
    <nav
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 40px',
        background: 'var(--color-bg-app)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 60,
        zIndex: 25,
        flexShrink: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
      aria-label="Main Navigation"
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        const badge = tab.href === '/queue' ? pendingCount : undefined;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              textDecoration: 'none',
              position: 'relative',
              flexShrink: 0,
              display: 'inline-block',
            }}
          >
            <div
              className={`pill-tab-item flex items-center gap-2 select-none ${
                isActive ? 'pill-tab-active' : 'pill-tab-inactive'
              }`}
              style={{
                height: 38,
                padding: '0 18px',
                borderRadius: 'var(--radius-pill)',
                border: isActive ? '1px solid var(--color-teal-700)' : '1px solid var(--color-border)',
                background: isActive ? 'var(--color-teal-700)' : 'transparent',
                color: isActive ? '#FAF7F2' : 'var(--color-ink-muted)',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1), border-color 150ms ease, color 150ms ease, transform 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon(isActive ? '#FAF7F2' : 'var(--color-ink-muted)')}
              <span>{tab.label}</span>

              {/* D.1 / C.2 Numeric badge */}
              {badge !== undefined && badge > 0 && (
                <motion.span
                  key={badge}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.24 }}
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-terracotta-700)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    marginLeft: 2,
                  }}
                >
                  {badge}
                </motion.span>
              )}
            </div>

            {/* Sliding underline indicator */}
            {isActive && (
              <motion.div
                layoutId="active-tab-underline"
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: 8,
                  right: 8,
                  height: 2,
                  background: 'var(--color-teal-700)',
                  borderRadius: 2,
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
