'use client';

// Interactive High-Resolution Image Lightbox Modal
// Supports Zoom in/out, pan, reset, download, and accessible keyboard dismissal (Esc)

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  src,
  alt = 'Civic Evidence Photo',
  title = 'Civic Evidence Inspection',
  subtitle,
  onClose,
}) => {
  const [scale, setScale] = useState(1);

  // Reset scale when image changes or opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen, src]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(s + 0.25, 3));
      } else if (e.key === '-' || e.key === '_') {
        setScale((s) => Math.max(s - 0.25, 0.5));
      } else if (e.key === '0') {
        setScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Lightbox Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-[92vw] max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Lightbox Header Bar */}
            <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 text-white">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>📸</span> {title}
                </span>
                {subtitle && (
                  <span className="text-xs text-slate-400 font-mono mt-0.5">
                    {subtitle}
                  </span>
                )}
              </div>

              {/* Control Toolbar */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5 text-xs">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out (-)"
                    className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  >
                    🔍−
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="Reset Zoom (0)"
                    className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                    className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  >
                    🔍+
                  </button>
                </div>

                <a
                  href={src}
                  download
                  target="_blank"
                  rel="noreferrer"
                  title="Download full resolution photo"
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <span>⬇️</span> Download
                </a>

                <button
                  onClick={onClose}
                  aria-label="Close Lightbox"
                  className="w-8 h-8 rounded-md bg-slate-800 hover:bg-red-900/60 hover:text-red-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[calc(92vh-70px)] bg-black/50 select-none">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="max-h-[75vh] w-auto object-contain rounded shadow-lg border border-slate-800"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
