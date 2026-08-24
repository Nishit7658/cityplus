'use client';

// Settings Page with Trilingual (English / ગુજરાતી / हिन्दी) Support
// WhatsApp simulator + backend configuration

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const [phone, setPhone]           = useState('+919876543210');
  const [message, setMessage]       = useState('');
  const [simStatus, setSimStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [simResponse, setSimResponse] = useState<string>('');
  const { language, t } = useLanguage();

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
    {
      label:
        language === 'gu'
          ? 'નવી ફરિયાદ શરૂ કરો'
          : language === 'hi'
          ? 'नई शिकायत शुरू करें'
          : 'Start new complaint',
      value: 'Hi',
    },
    {
      label:
        language === 'gu'
          ? 'ખાડા પસંદ કરો (૧)'
          : language === 'hi'
          ? 'गड्ढा चुनें (१)'
          : 'Select Pothole',
      value: '1',
    },
    {
      label:
        language === 'gu'
          ? 'પુષ્ટિ કરો (હા)'
          : language === 'hi'
          ? 'पुष्टि करें (हाँ)'
          : 'Confirm Yes',
      value: 'Yes',
    },
    {
      label:
        language === 'gu'
          ? 'અસ્વીકાર (ના)'
          : language === 'hi'
          ? 'अस्वीकार (नहीं)'
          : 'Reject (No)',
      value: 'No',
    },
    {
      label:
        language === 'gu'
          ? 'લોકેશન મોકલો'
          : language === 'hi'
          ? 'लोकेशन भेजें'
          : 'Send location',
      value: 'loc:22.3072,73.1812',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[900px] mx-auto px-6 py-8"
    >
      {/* Page header */}
      <div className="mb-8 pb-4 border-b border-slate-200">
        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
          {t('settings.dev_tools')}
        </p>
        <h1 className="text-2xl font-bold text-[#0B2545]">
          {t('settings.title')}
        </h1>
      </div>

      {/* WhatsApp Simulator */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs mb-6">
        <div className="p-6">
          <span className="text-[11px] font-mono font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-2">
            DEV ONLY
          </span>
          <h2 className="text-lg font-bold text-[#0B2545] mb-1">
            {t('settings.simulator_title')}
          </h2>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            {t('settings.simulator_desc')}
          </p>

          {/* Scenario quick-fills */}
          <div className="flex gap-2 flex-wrap mb-4">
            {scenarios.map((s) => (
              <button
                key={s.label}
                onClick={() => setMessage(s.value)}
                className="h-8 px-3 rounded-full border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Phone input */}
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-1.5">
              {t('settings.phone_label')}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full h-10 px-3.5 rounded border border-slate-300 bg-slate-50 text-slate-800 font-mono text-sm focus:outline-none focus:border-[#133E87]"
            />
          </div>

          {/* Message input */}
          <div className="mb-5">
            <label className="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-1.5">
              {t('settings.message_label')}
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && simulate()}
              placeholder='e.g. "Hi" or "1" or "Yes"'
              className="w-full h-10 px-3.5 rounded border border-slate-300 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:border-[#133E87]"
            />
          </div>

          {/* Send button */}
          <button
            onClick={simulate}
            disabled={simStatus === 'loading' || !message.trim()}
            className="h-10 px-5 rounded bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133E87] transition-colors cursor-pointer disabled:opacity-50"
          >
            {simStatus === 'loading' ? t('settings.sending') : t('settings.send_button')}
          </button>

          {/* Response output */}
          {simResponse && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 rounded bg-slate-50 border border-slate-200"
            >
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t('settings.response')}
              </p>
              <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap break-all m-0">
                {simResponse}
              </pre>
            </motion.div>
          )}
        </div>
      </div>

      {/* Environment info */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <p className="text-xs font-bold uppercase text-[#0B2545] tracking-wider mb-3">
          {t('settings.environment')}
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { key: 'API URL',    value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000 (default)' },
            { key: 'Socket URL', value: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000 (default)' },
            { key: 'System Build', value: 'CityPulse v1.0.0 — VMC Production' },
          ].map(({ key, value }) => (
            <div key={key} className="flex justify-between py-1 border-b border-slate-100 last:border-b-0">
              <span className="text-slate-500 font-semibold">{key}</span>
              <span className="font-mono font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
