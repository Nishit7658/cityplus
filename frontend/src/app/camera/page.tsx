'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CameraPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (typeof window !== 'undefined' && (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void } } }).Telegram?.WebApp) {
      const tg = (window as unknown as { Telegram: { WebApp: { ready: () => void; expand: () => void } } }).Telegram.WebApp;
      tg.ready();
      tg.expand();
    }

    // Auto-open camera on initial view
    const timer = setTimeout(() => {
      fileInputRef.current?.click();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadAndSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      setIsUploaded(true);

      const tg = (window as unknown as { Telegram?: { WebApp?: { sendData: (d: string) => void; close: () => void } } }).Telegram?.WebApp;
      if (tg && tg.sendData) {
        tg.sendData(JSON.stringify({ photo_url: data.url }));
        tg.close();
      }
    } catch (err) {
      alert('Upload error: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B2545] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#133E87] border border-[#1E51A4] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="text-4xl mb-2">📸</div>
        <h1 className="text-xl font-bold mb-1">VMC Photo Capture</h1>
        <p className="text-xs text-slate-300 mb-5">Snap a clear photo of the civic issue</p>

        {/* Hidden Native Camera Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />

        {/* Preview Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-56 bg-[#081B33] border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center overflow-hidden mb-4 cursor-pointer relative"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">📷</span>
              <span className="text-xs font-semibold text-blue-200">Tap here to Open Camera</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!previewUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <span>📷 Open Camera Now</span>
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleUploadAndSubmit}
              disabled={isUploading || isUploaded}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <span>{isUploading ? 'Uploading...' : isUploaded ? '✓ Submitted!' : '✅ Use Photo & Register Ticket'}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-xs text-slate-200 cursor-pointer"
            >
              <span>🔄 Retake Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
