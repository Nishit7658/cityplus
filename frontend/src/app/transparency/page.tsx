'use client';

// F.7 — Transparency Page (Official Municipal Citizen Charter & Audit Record) with Trilingual i18n
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean subtle borders, zero side stripes, solid government color hierarchy

import React, { useEffect, useState } from 'react';
import { TransparencyStats } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MOCK_TRANSPARENCY } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TransparencyPage() {
  const [stats, setStats] = useState<TransparencyStats>(MOCK_TRANSPARENCY);
  const { language, t } = useLanguage();

  const WORKFLOW_STEPS = [
    {
      step: language === 'gu' ? 'તબક્કો ૧' : language === 'hi' ? 'चरण १' : 'STAGE 1',
      title: t('transparency.stage1_title'),
      desc: t('transparency.stage1_desc'),
    },
    {
      step: language === 'gu' ? 'તબક્કો ૨' : language === 'hi' ? 'चरण २' : 'STAGE 2',
      title: t('transparency.stage2_title'),
      desc: t('transparency.stage2_desc'),
    },
    {
      step: language === 'gu' ? 'તબક્કો ૩' : language === 'hi' ? 'चरण ૩' : 'STAGE 3',
      title: t('transparency.stage3_title'),
      desc: t('transparency.stage3_desc'),
    },
    {
      step: language === 'gu' ? 'તબક્કો ૪' : language === 'hi' ? 'चरण ४' : 'STAGE 4',
      title: t('transparency.stage4_title'),
      desc: t('transparency.stage4_desc'),
    },
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/transparency`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.total_complaints > 0) setStats(d);
      })
      .catch(() => {});
  }, []);

  const safeStats = stats || MOCK_TRANSPARENCY;
  const resolutionRate = Math.round(
    (safeStats.resolved_complaints / Math.max(1, safeStats.total_complaints)) * 100
  );

  return (
    <div className="max-w-[1520px] mx-auto px-6 py-6 bg-slate-50 min-h-[calc(100vh-115px)]">
      {/* Official Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{t('vmc.title')}</span>
            <span>•</span>
            <span>{t('transparency.title')}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2545] tracking-tight mt-1">
            {t('transparency.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('transparency.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
          <span>
            {language === 'gu'
              ? 'સત્તાવાર જાહેર રેકોર્ડ: '
              : language === 'hi'
              ? 'आधिकारिक सार्वजनिक रिकॉर्ड: '
              : 'Official Public Record: '}
          </span>
          <span className="font-mono text-emerald-700">{t('transparency.open_access')}</span>
        </div>
      </div>

      {/* 4 Official Civic Metrics (Clean Subtle Borders, Zero Side Stripes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            {language === 'gu' ? 'કુલ નોંધણી (બધા વોર્ડ)' : language === 'hi' ? 'कुल पंजीकरण (सभी वार्ड)' : 'Total Intake (All Wards)'}
          </div>
          <div className="text-3xl font-mono font-bold text-[#0B2545]">
            {safeStats.total_complaints}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {language === 'gu'
              ? 'તમામ ૧૦ VMC વોર્ડમાં નોંધાયેલ ફરિયાદો'
              : language === 'hi'
              ? 'सभी १० VMC वार्डों में दर्ज शिकायतें'
              : 'Complaints logged across all 10 VMC wards'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            {language === 'gu' ? 'ઉકેલાયેલ ફરિયાદો' : language === 'hi' ? 'निवारित शिकायतें' : 'Resolved Grievances'}
          </div>
          <div className="text-3xl font-mono font-bold text-[#15803D]">
            {safeStats.resolved_complaints}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {language === 'gu'
              ? 'નાગરિકો દ્વારા WhatsApp પર ચકાસાયેલ'
              : language === 'hi'
              ? 'नागरिकों द्वारा WhatsApp पर सत्यापित'
              : 'Verified by reporting citizens via WhatsApp'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            {language === 'gu' ? 'નિવારણ ક્ષમતા' : language === 'hi' ? 'निवारण दक्षता' : 'Resolution Efficiency'}
          </div>
          <div className="text-3xl font-mono font-bold text-[#133E87]">
            {resolutionRate}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {language === 'gu'
              ? 'વિભાગો વચ્ચે SLA પાલન દર'
              : language === 'hi'
              ? 'विभागों में SLA अनुपालन दर'
              : 'SLA compliance across municipal departments'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
            {language === 'gu' ? 'સરેરાશ નિવારણ સમય' : language === 'hi' ? 'औसत निवारण समय' : 'Average Turnaround Time'}
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900">
            {Math.round(safeStats.avg_resolution_hours)}{' '}
            <span className="text-base font-normal text-slate-500">
              {language === 'gu' ? 'કલાક' : language === 'hi' ? 'घंटे' : 'hours'}
            </span>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-2">
            {language === 'gu'
              ? 'લક્ષ્ય SLA: < ૨૪.૦ કલાક પ્રમાણભૂત'
              : language === 'hi'
              ? 'लक्ष्य SLA: < २४.० घंटे मानक'
              : 'Target SLA: < 24.0 hours standard'}
          </div>
        </div>
      </div>

      {/* Official 4-Stage Redressal Protocol */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0B2545]">
              {t('transparency.sop_title')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('transparency.sop_sub')}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
            {t('transparency.circular')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono font-bold text-[#133E87] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-2.5">
                  {step.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-400 font-mono">
                {language === 'gu' ? 'ઓટોમેટેડ સિસ્ટમ ચેક ✓' : language === 'hi' ? 'स्वचालित सिस्टम जांच ✓' : 'Automated System Check ✓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10-Ward Comparative SLA Resolution Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-[#0B2545]">
              {t('transparency.ward_ledger_title')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('transparency.ward_ledger_sub')}
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">{language === 'gu' ? 'વહીવટી વોર્ડ' : language === 'hi' ? 'પ્રશાસનિક વોર્ડ' : 'Administrative Ward'}</th>
              <th className="px-4 py-3.5">{language === 'gu' ? 'કુલ નોંધાયેલ' : language === 'hi' ? 'कुल दर्ज' : 'Total Logged'}</th>
              <th className="px-4 py-3.5">{language === 'gu' ? 'ઉકેલાયેલ' : language === 'hi' ? 'निवारित' : 'Resolved Fixed'}</th>
              <th className="px-6 py-3.5">{language === 'gu' ? 'SLA પ્રગતિ' : language === 'hi' ? 'SLA प्रगति' : 'Resolution SLA Progress'}</th>
              <th className="px-6 py-3.5 text-right">{language === 'gu' ? 'સ્થિતિ પાલન' : language === 'hi' ? 'स्थिति अनुपालन' : 'Status Compliance'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeStats.wards.map((ward, idx) => {
              const pct = ward.total > 0 ? Math.round((ward.resolved / ward.total) * 100) : 0;
              const isCompliant = pct >= 75;
              const wardLabel = t(`ward.${idx + 1}`, ward.ward_name);

              return (
                <tr key={ward.ward_name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {wardLabel}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    {ward.total} {language === 'gu' ? 'ફરિયાદો' : language === 'hi' ? 'शिकायतें' : 'tickets'}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[#15803D]">
                    {ward.resolved} {language === 'gu' ? 'પૂર્ણ' : language === 'hi' ? 'पूर्ण' : 'cleared'}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3 max-w-sm">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-[#15803D]' : pct >= 65 ? 'bg-[#133E87]' : 'bg-[#B45309]'
                          }`}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        isCompliant
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompliant ? t('transparency.sla_compliant') : t('transparency.under_review')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
