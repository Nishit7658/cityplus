'use client';

import React from 'react';
import { SocketProvider } from '@/components/SocketProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { WardProvider } from '@/context/WardContext';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WardProvider>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </WardProvider>
    </LanguageProvider>
  );
}
