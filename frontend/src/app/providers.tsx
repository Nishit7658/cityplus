'use client';

import React from 'react';
import { SocketProvider } from '@/components/SocketProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { WardProvider } from '@/context/WardContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WardProvider>
        <SocketProvider>{children}</SocketProvider>
      </WardProvider>
    </LanguageProvider>
  );
}
