'use client';

// C.2 — Official Municipal Navigation Tabs
// Vadodara Municipal Corporation (VMC)
// Dignified Navy & Saffron GovTech navigation bar

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Live GIS Map',
    href: '/map',
    icon: (color) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    label: 'Grievance Queue',
    href: '/queue',
    icon: (color) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    label: 'Failure Hotspots',
    href: '/hotspots',
    icon: (color) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    label: 'Field Officers',
    href: '/officers',
    icon: (color) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Public Transparency',
    href: '/transparency',
    icon: (color) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'System Settings',
    href: '/settings',
    icon: (color) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <nav className="bg-white border-b border-slate-200 sticky top-[67px] z-[1090] shadow-2xs">
      <div className="max-w-[1520px] mx-auto px-6 h-[48px] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const badge = tab.href === '/queue' ? pendingCount : undefined;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="no-underline shrink-0"
            >
              <div
                className={`h-[34px] px-3.5 rounded-md flex items-center gap-2 text-xs font-semibold tracking-tight transition-colors ${
                  isActive
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon(isActive ? '#FFFFFF' : '#64748B')}
                <span>{tab.label}</span>

                {badge !== undefined && badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                      isActive ? 'bg-[#C25E00] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
