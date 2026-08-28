'use client';

// C.1 — Top Identity Strip (Official Government of Gujarat / VMC Header)
// Official Indian National Flag Tricolor Trim, State Emblem of India, Trilingual i18n, WardContext & Citizen Intake

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NationalEmblem } from './NationalEmblem';
import { CitizenReportModal } from './CitizenReportModal';
import { useSocket } from './SocketProvider';
import { useLanguage, Language } from '@/context/LanguageContext';
import { useWard } from '@/context/WardContext';
import { useAuth } from '@/context/AuthContext';
import { MOCK_COMPLAINTS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LANGUAGE_OPTIONS: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export const TopIdentityStrip: React.FC = () => {
  const router = useRouter();
  const { lastEvent } = useSocket();
  const { language, setLanguage, t } = useLanguage();
  const { selectedWard, setSelectedWard } = useWard();
  const { user, isAuthenticated, logout } = useAuth();
  const [todayCount, setTodayCount] = useState<number>(MOCK_COMPLAINTS.length);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };
  
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
    if (lastEvent?.type === 'new_complaint' || lastEvent?.type === 'complaint:created') {
      setTodayCount((prev) => prev + 1);
    }
  }, [lastEvent]);

  return (
    <>
      <header className="sticky top-0 z-[1100] bg-white border-b border-slate-200 shadow-xs flex-shrink-0">
        {/* Official Indian National Flag Tricolor Banner Strip */}
        <div className="w-full flex h-[3.5px]">
          <div className="flex-1 bg-[#FF671F]" /> {/* India Saffron */}
          <div className="flex-1 bg-[#FFFFFF] border-y border-slate-200/50" /> {/* White */}
          <div className="flex-1 bg-[#046A38]" /> {/* India Green */}
        </div>

        <div className="max-w-[1520px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left Branding: Official National Emblem of India + State & Department Hierarchy */}
          <div className="flex items-center gap-3">
            {/* State Emblem of India (Ashoka Lion Capital) */}
            <div className="shrink-0 flex items-center justify-center">
              <NationalEmblem size={42} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-none">
                  {t('vmc.state_label', 'Government of Gujarat')}
                </span>
                <span className="text-slate-300 text-xs leading-none">•</span>
                <span className="text-[11px] font-bold text-[#C25E00] uppercase tracking-wider leading-none">
                  {t('vmc.dept_label', 'Urban Development & Urban Housing')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-extrabold text-[#0B2545] tracking-tight leading-tight">
                  {t('vmc.title')}
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-slate-300">|</span>
                <span className="hidden sm:inline text-xs font-semibold text-slate-600">
                  {t('vmc.subtitle')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Report Issue CTA + Trilingual Dropdown + CRMS Badge + Ward Selector + Officer */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Primary Action: Public Citizen Grievance Modal Trigger */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="h-8 px-3.5 rounded-md bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Report Civic Grievance"
            >
              <span>📢</span>
              <span className="hidden sm:inline">
                {language === 'gu'
                  ? 'ફરિયાદ નોંધાવો'
                  : language === 'hi'
                  ? 'शिकायत दर्ज करें'
                  : 'Report Issue'}
              </span>
            </button>

            {/* Trilingual Language Dropdown Selector (English / ગુજરાતી / हिन्दी) */}
            <div className="relative flex items-center bg-white rounded-md border border-slate-300 shadow-2xs hover:border-slate-400 transition-colors">
              <span className="pl-2.5 pr-1 text-slate-400 text-xs">🌐</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Select Language"
                className="h-8 pl-1 pr-7 bg-transparent text-xs font-bold text-[#0B2545] focus:outline-none cursor-pointer appearance-none"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="text-slate-800 font-semibold">
                    {opt.native} ({opt.label})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Portal Live Telemetry Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#1E40AF]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span>{t('vmc.crms_active')}</span>
              <span className="font-mono font-bold text-[#0B2545]">({todayCount} {t('vmc.active_issues')})</span>
            </div>

            {/* Ward Selector (Connected to WardContext) */}
            <div className="hidden lg:block">
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                aria-label="Select Ward"
                className="h-8 px-3 pr-8 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#133E87] cursor-pointer"
              >
                {wards.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duty Officer Profile / Sign Out */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user.name.slice(0, 2)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0B2545] leading-tight truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#133E87] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium leading-none truncate max-w-[120px]">
                    {user.department || 'Vadodara Central'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out of VMC Portal"
                  className="h-8 px-2.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center pl-3 border-l border-slate-200">
                <Link
                  href="/login"
                  className="h-8 px-3 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 no-underline shrink-0"
                >
                  <span>🔑</span>
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Public Citizen Grievance Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};
