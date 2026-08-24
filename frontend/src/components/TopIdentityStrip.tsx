'use client';

// C.1 — Official Government Top Identity Strip
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// National tricolor civic accent line, bilingual VMC seal, formal portal identification

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSocket } from './SocketProvider';
import { MOCK_COMPLAINTS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const TopIdentityStrip: React.FC = () => {
  const { lastEvent } = useSocket();
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
    <header className="sticky top-0 z-[1100] bg-white border-b border-slate-200 shadow-xs flex-shrink-0">
      {/* Subtle National / State Government Accent Bar */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-[1520px] mx-auto px-6 h-[64px] flex items-center justify-between gap-4">
        {/* Official VMC Emblem & Identity */}
        <div className="flex items-center gap-3.5 shrink-0">
          {/* Government Official Emblem Shield */}
          <div className="w-10 h-10 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>

          <Link href="/" className="no-underline">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#0B2545] tracking-tight font-body">
                  Vadodara Municipal Corporation
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                  | વડોદરા મહાનગરપાલિકા
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                CityPulse • Civic Infrastructure & Public Grievance Redressal Control Room
              </span>
            </div>
          </Link>
        </div>

        {/* Right Controls & Official Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Portal Live Telemetry Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#1E40AF]">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
            <span>CRMS Portal Active</span>
            <span className="font-mono font-bold text-[#0B2545]">({todayCount} Active Issues)</span>
          </div>

          {/* Ward Selector */}
          <div className="hidden lg:block">
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="h-8 px-3 pr-8 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#133E87] cursor-pointer"
            >
              {wards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Official Officer Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0B2545] text-white flex items-center justify-center font-mono font-bold text-xs border border-slate-400 shadow-2xs">
              VMC
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">Control Officer</span>
              <span className="text-[10px] font-mono text-slate-500">Vadodara Central</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
