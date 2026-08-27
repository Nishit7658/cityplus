'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { NationalEmblem } from '@/components/NationalEmblem';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      login(data.token, data.user);
      router.push('/');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoAccounts = [
    {
      label: '👑 VMC Control Officer (Admin)',
      email: 'admin@vmc.gov.in',
      desc: 'Full Central Command Access',
      badge: 'ADMIN',
    },
    {
      label: '📡 Sayajigunj Zonal Dispatcher',
      email: 'dispatcher@vmc.gov.in',
      desc: 'Ward 1 Zonal Redressal Cell',
      badge: 'DISPATCHER',
    },
    {
      label: '👷 Rajesh Patel (Field Engineer)',
      email: 'rajesh.patel@vmc.gov.in',
      desc: 'Road & Building Dept',
      badge: 'OFFICER',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-115px)] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Flag Banner */}
        <div className="w-full flex h-1">
          <div className="flex-1 bg-[#FF671F]" />
          <div className="flex-1 bg-[#FFFFFF] border-y border-slate-200/50" />
          <div className="flex-1 bg-[#046A38]" />
        </div>

        <div className="p-8">
          {/* Official Emblem & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-2">
              <NationalEmblem size={52} />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('vmc.state_label', 'Government of Gujarat')}
            </span>
            <h1 className="text-xl font-extrabold text-[#0B2545] mt-0.5">
              {t('vmc.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Municipal Operations & Staff Access Portal
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@vmc.gov.in"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#133E87] focus:ring-1 focus:ring-[#133E87]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#133E87] focus:ring-1 focus:ring-[#133E87]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Sign In to VMC Command</span>
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Access */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3 text-center">
              ⚡ Quick Demo Authentication
            </span>
            <div className="flex flex-col gap-2">
              {quickDemoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('VmcGov2026!');
                    handleLogin(acc.email, 'VmcGov2026!');
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{acc.label}</span>
                    <span className="text-[10px] text-slate-500">{acc.desc}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-white text-[#133E87] px-2 py-0.5 rounded border border-slate-200">
                    {acc.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
