'use client';

// C.10 — Official Government Filter Pill Row
// High-contrast, high-visibility status filter chips
// Crystal-clear visibility for both selected and unselected states

import React from 'react';
import { motion } from 'framer-motion';

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterPillRowProps {
  options: FilterOption[];
  active: string[];
  onToggle: (key: string) => void;
  className?: string;
}

export const FilterPillRow: React.FC<FilterPillRowProps> = ({ options, active, onToggle, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {options.map((opt) => {
        const isActive = active.includes(opt.key);
        return (
          <motion.button
            key={opt.key}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onToggle(opt.key)}
            className={`h-9 px-3.5 rounded-md text-xs font-bold tracking-tight inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs border ${
              isActive
                ? 'bg-[#0B2545] border-[#0B2545] text-white ring-2 ring-[#0B2545]/20 shadow-xs'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            {/* Status dot */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isActive
                  ? 'bg-amber-400'
                  : opt.key === 'Resolved'
                  ? 'bg-emerald-600'
                  : opt.key === 'In Progress'
                  ? 'bg-amber-500'
                  : opt.key === 'Assigned'
                  ? 'bg-blue-600'
                  : 'bg-slate-500'
              }`}
            />

            <span>{opt.label}</span>

            {/* Count Badge */}
            {opt.count !== undefined && (
              <span
                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {opt.count}
              </span>
            )}

            {/* Active Dismiss Indicator */}
            {isActive && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(opt.key);
                }}
                className="text-xs font-bold text-white/80 hover:text-white ml-0.5"
              >
                ✕
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
