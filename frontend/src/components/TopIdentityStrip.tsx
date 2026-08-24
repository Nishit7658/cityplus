'use client';

// C.1 — Official Government Top Identity Strip
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Bilingual Language Switcher (English | ગુજરાતી) + National tricolor civic accent line

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSocket } from './SocketProvider';
import { useLanguage } from '@/context/LanguageContext';
import { MOCK_COMPLAINTS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const TopIdentityStrip: React.FC = () => {
  const { lastEvent } = useSocket();
  const { language, setLanguage, t } = useLanguage();
  const [todayCount, setTodayCount] = useState<number>(MOCK_COMPLAINTS.length);
  const [ward, setWard] = useState('all');
  
  const wards = [
    { key: 'all', label: t('vmc.all_wards') },
    { key: '1', label: t('ward.1') },
    { key: '2', label: t('ward.2') },
    { key: '3', label: t('ward.3') },
    { key: '4', label: t('ward.4') },
    { key: '5', label: t('ward.5') },
    { key: '6', label: t('ward.6') },
    { key: '7', label: t('ward.7') },
    { key: '8', label: t('ward.8') },
    { key: '9', label: t('ward.9') },
    { key: '10', label: t('ward.10') },
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
                  {t('vmc.title')}
                </span>
                {language === 'en' && (
                  <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                    | વડોદરા મહાનગરપાલિકા
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {t('vmc.subtitle')}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Controls: Language Switcher + CRMS Badge + Ward + Officer */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Bilingual Language Switcher (English | ગુજરાતી) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-300">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#0B2545] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('gu')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                language === 'gu'
                  ? 'bg-[#0B2545] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ગુજરાતી
            </button>
          </div>

          {/* Portal Live Telemetry Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#1E40AF]">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
            <span>{t('vmc.crms_active')}</span>
            <span className="font-mono font-bold text-[#0B2545]">({todayCount} {t('vmc.active_issues')})</span>
          </div>

          {/* Ward Selector */}
          <div className="hidden lg:block">
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="h-8 px-3 pr-8 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#133E87] cursor-pointer"
            >
              {wards.map((w) => (
                <option key={w.key} value={w.key}>
                  {w.label}
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
              <span className="text-xs font-bold text-slate-900 leading-tight">{t('vmc.control_officer')}</span>
              <span className="text-[10px] font-mono text-slate-500">{t('vmc.vadodara_central')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
