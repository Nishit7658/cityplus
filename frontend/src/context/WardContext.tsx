'use client';

// Global Ward Filter Context for CityPulse / VMC Municipal Portal
// Allows the top header Ward selector to filter all dashboard views seamlessly.

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WardContextType {
  selectedWard: string; // 'all' | '1' | '2' ... | '10'
  setSelectedWard: (ward: string) => void;
}

const WardContext = createContext<WardContextType>({
  selectedWard: 'all',
  setSelectedWard: () => {},
});

export const useWard = () => useContext(WardContext);

export const WardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWard, setSelectedWardState] = useState<string>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vmc_selected_ward');
      if (saved) {
        setSelectedWardState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setSelectedWard = (ward: string) => {
    setSelectedWardState(ward);
    try {
      localStorage.setItem('vmc_selected_ward', ward);
    } catch {
      // ignore
    }
  };

  return (
    <WardContext.Provider value={{ selectedWard, setSelectedWard }}>
      {children}
    </WardContext.Provider>
  );
};
