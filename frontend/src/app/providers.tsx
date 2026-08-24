'use client';

import React from 'react';
import { SocketProvider } from '@/components/SocketProvider';
import { LanguageProvider } from '@/context/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SocketProvider>{children}</SocketProvider>
    </LanguageProvider>
  );
}
