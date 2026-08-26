'use client';
/* eslint-disable @next/next/no-img-element */

// Citizen Grievance Intake Modal
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Full Trilingual i18n, Live GPS Geolocation, Manual Coordinate Picker & Photo Upload

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Complaint } from '@/types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted?: (complaint: Complaint) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { key: 'pothole', icon: '🕳️', labelKey: 'cat.pothole', defaultLabel: 'Road Pothole' },
  { key: 'water_leak', icon: '💧', labelKey: 'cat.water_leak', defaultLabel: 'Water Leakage' },
  { key: 'broken_streetlight', icon: '💡', labelKey: 'cat.broken_streetlight', defaultLabel: 'Broken Streetlight' },
  { key: 'garbage_overflow', icon: '🗑️', labelKey: 'cat.garbage_overflow', defaultLabel: 'Garbage Overflow' },
  { key: 'open_manhole', icon: '⚠️', labelKey: 'cat.open_manhole', defaultLabel: 'Open Manhole' },
  { key: 'exposed_wiring', icon: '⚡', labelKey: 'cat.exposed_wiring', defaultLabel: 'Exposed Wiring' },
  { key: 'gas_leak', icon: '🔥', labelKey: 'cat.gas_leak', defaultLabel: 'Gas Pipeline Leak' },
  { key: 'drainage', icon: '🌊', labelKey: 'cat.drainage', defaultLabel: 'Drainage Overflow' },
  { key: 'traffic_signal', icon: '🚦', labelKey: 'cat.traffic_signal', defaultLabel: 'Traffic Signal' },
];

const WARDS = [
  { id: 1, name: 'Ward 1 — Sayajigunj (MSU, Railway Station, Kala Ghoda)', lat: 22.3112, lng: 73.1878 },
  { id: 2, name: 'Ward 2 — Akota (Alkapuri, RC Dutt Road, Old Padra Road)', lat: 22.2981, lng: 73.1642 },
  { id: 3, name: 'Ward 3 — Raopura (Mandvi, Nyayamandir, Panigate, Jubilee Baug)', lat: 22.3025, lng: 73.2054 },
  { id: 4, name: 'Ward 4 — Karelibaug (Harni, Vadodara Airport, Amit Nagar, VIP Road)', lat: 22.3214, lng: 73.1989 },
  { id: 5, name: 'Ward 5 — Fatehgunj (Sama, Chhani, Sama-Savli Road, Nizampura)', lat: 22.3168, lng: 73.1895 },
  { id: 6, name: 'Ward 6 — Manjalpur (Tarsali, Lalbaug, Darbar Chowkdi, Susen)', lat: 22.2684, lng: 73.1956 },
  { id: 7, name: 'Ward 7 — Makarpura (Maneja, GIDC, Jambuva, Vadsar, ONGC)', lat: 22.2512, lng: 73.1923 },
  { id: 8, name: 'Ward 8 — Gotri (Sevasi, Bhayli, Vasna Road, Laxmipura, Bil)', lat: 22.3125, lng: 73.1412 },
  { id: 9, name: 'Ward 9 — Gorwa (Subhanpura, Panchvati, Ellora Park, Undera)', lat: 22.3341, lng: 73.1624 },
  { id: 10, name: 'Ward 10 — Waghodia Road (Ajwa Road, Kapurai, Soma Talav, Golden Chowkdi)', lat: 22.2987, lng: 73.2341 },
];

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onComplaintSubmitted,
}) => {
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('pothole');
  const [wardId, setWardId] = useState(1);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successComplaint, setSuccessComplaint] = useState<Complaint | null>(null);

  // Advanced Location Mode (Ward Preset, Live Browser GPS, or Manual Coordinates)
  const [locationMode, setLocationMode] = useState<'ward' | 'gps' | 'custom'>('ward');
  const [customLat, setCustomLat] = useState<string>('22.3112');
  const [customLng, setCustomLng] = useState<string>('73.1878');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Live Browser GPS Geolocation
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('locating');
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setCustomLat(String(lat));
        setCustomLng(String(lng));

        // Auto-match nearest VMC Ward
        let nearestWard = WARDS[0];
        let minDistance = Infinity;
        WARDS.forEach((w) => {
          const dist = Math.hypot(w.lat - lat, w.lng - lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestWard = w;
          }
        });

        setWardId(nearestWard.id);
        setLocationMode('gps');
        setGpsStatus('success');
        setGpsMessage(`Live GPS locked: ${lat}, ${lng} (Matched ${nearestWard.name})`);
      },
      (err) => {
        setGpsStatus('error');
        setGpsMessage(err.message || 'Unable to retrieve GPS coordinates. Please select a Ward.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setPhotoUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the issue.');
      return;
    }

    const selectedWard = WARDS.find((w) => w.id === wardId) || WARDS[0];
    
    // Choose coordinate source based on location mode
    let targetLat = selectedWard.lat;
    let targetLng = selectedWard.lng;

    if (locationMode === 'gps' || locationMode === 'custom') {
      const pLat = parseFloat(customLat);
      const pLng = parseFloat(customLng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        targetLat = pLat;
        targetLng = pLng;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: description.trim(),
          reporter_phone: phone.trim() || '+91 98250 00000',
          latitude: targetLat,
          longitude: targetLng,
          ward_id: selectedWard.id,
          photo_url: photoUrl || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }

      const data = await res.json();
      const created = data.complaint as Complaint;
      setSuccessComplaint(created);

      if (onComplaintSubmitted) {
        onComplaintSubmitted(created);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register complaint.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory('pothole');
    setWardId(1);
    setDescription('');
    setPhone('');
    setPhotoUrl(null);
    setLocationMode('ward');
    setGpsStatus('idle');
    setGpsMessage(null);
    setErrorMessage(null);
    setSuccessComplaint(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Strip with Government Colors */}
        <div className="bg-[#0B2545] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📢</span>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {language === 'gu'
                  ? 'નાગરિક ફરિયાદ નોંધણી પોર્ટલ'
                  : language === 'hi'
                  ? 'नागरिक शिकायत पंजीकरण पोर्टल'
                  : 'Public Citizen Grievance Portal'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {t('vmc.title')} • {t('vmc.state_label')}
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successComplaint ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-200">
                ✓
              </div>
              <h3 className="text-lg font-bold text-[#0B2545]">
                {language === 'gu'
                  ? 'ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે!'
                  : language === 'hi'
                  ? 'शिकायत सफलतापूर्वक दर्ज हो गई है!'
                  : 'Grievance Registered Successfully!'}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-600 mt-1">
                Ticket ID: #{successComplaint.id} • {t(`cat.${successComplaint.category}`, successComplaint.category)}
              </p>
              <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
                <div>
                  <strong>{t('queue.th_ward')}:</strong> {t(`ward.${successComplaint.ward_id}`, `Ward ${successComplaint.ward_id}`)}
                </div>
                <div>
                  <strong>Coordinates:</strong> <span className="font-mono text-slate-900">{successComplaint.latitude?.toFixed(4)}, {successComplaint.longitude?.toFixed(4)}</span>
                </div>
                <div>
                  <strong>{t('queue.th_score')}:</strong> {successComplaint.severity_score || 50} (Auto-calculated GIS index)
                </div>
                <div>
                  <strong>Status:</strong> <span className="text-blue-700 font-bold">Pending Assignment</span>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="mt-6 w-full h-11 rounded-lg bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {language === 'gu' ? 'પૂર્ણ કરો / બંધ કરો' : language === 'hi' ? 'पूर्ण / बंद करें' : 'Done / Return to Dashboard'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* 1. Category Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  {language === 'gu' ? '૧. સમસ્યાનો પ્રકાર પસંદ કરો *' : language === 'hi' ? '१. समस्या का प्रकार चुनें *' : '1. Issue Category *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        category === cat.key
                          ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-[11px] font-bold text-center leading-tight">
                        {t(cat.labelKey, cat.defaultLabel)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Enhanced Location Mode & Picker */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block">
                    {language === 'gu' ? '૨. ઘટના સ્થળ અને લોકેશન *' : language === 'hi' ? '२. घटना स्थल और स्थान *' : '2. Incident Spot & Location *'}
                  </label>
                  
                  {/* Mode Pills */}
                  <div className="flex bg-white rounded border border-slate-300 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLocationMode('ward')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${locationMode === 'ward' ? 'bg-[#0B2545] text-white' : 'text-slate-600'}`}
                    >
                      Ward
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationMode('custom')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${locationMode === 'custom' ? 'bg-[#0B2545] text-white' : 'text-slate-600'}`}
                    >
                      Coords
                    </button>
                  </div>
                </div>

                {/* Live GPS Geolocation CTA Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleGetLiveLocation}
                    disabled={gpsStatus === 'locating'}
                    className="w-full py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📍</span>
                    <span>{gpsStatus === 'locating' ? 'Locating via GPS...' : 'Auto-Detect My Current GPS Location'}</span>
                  </button>
                  {gpsMessage && (
                    <p className={`text-[11px] font-semibold mt-1.5 ${gpsStatus === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                      {gpsStatus === 'error' ? '⚠️ ' : '✓ '}{gpsMessage}
                    </p>
                  )}
                </div>

                {/* Location Selection UI based on Mode */}
                {locationMode === 'custom' ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Latitude</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={customLat}
                        onChange={(e) => setCustomLat(e.target.value)}
                        className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Longitude</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={customLng}
                        onChange={(e) => setCustomLng(e.target.value)}
                        className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <select
                      value={wardId}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setWardId(id);
                        const match = WARDS.find((w) => w.id === id);
                        if (match) {
                          setCustomLat(String(match.lat));
                          setCustomLng(String(match.lng));
                        }
                      }}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#133E87]"
                    >
                      {WARDS.map((w) => (
                        <option key={w.id} value={w.id}>
                          📍 {t(`ward.${w.id}`, w.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  {language === 'gu' ? '૩. ખામીનું વિગતવાર વર્ણન *' : language === 'hi' ? '३. खराबी का विस्तृत विवरण *' : '3. Defect Description & Landmark *'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    language === 'gu'
                      ? 'દા.ત. સયાજીગંજ મુખ્ય માર્ગ પર મોટો ખાડો, ટ્રાફિકમાં અવરોધ...'
                      : language === 'hi'
                      ? 'उदा. सयाजीगंज मुख्य मार्ग पर गहरा गड्ढा, यातायात बाधित...'
                      : 'e.g. Deep pothole near Sayajigunj junction causing severe traffic slowdown...'
                  }
                  className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#133E87]"
                />
              </div>

              {/* 4. Phone Number */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  {language === 'gu' ? '૪. નાગરિક મોબાઈલ નંબર (ચકાસણી માટે)' : language === 'hi' ? '४. नागरिक मोबाइल नंबर (सत्यापन हेतु)' : '4. Citizen Phone Number (For Verification)'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-[#133E87]"
                />
              </div>

              {/* 5. Photo Evidence Upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  {language === 'gu' ? '૫. ફોટો પુરાવો (વૈકલ્પિક)' : language === 'hi' ? '५. फोटो प्रमाण (વૈકલ્પિક)' : '5. Photo Evidence (Optional)'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="citizen-modal-photo-upload"
                />

                {photoUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <img
                      src={photoUrl}
                      alt="Uploaded evidence"
                      className="w-14 h-14 rounded object-cover border border-emerald-300"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-emerald-800 block">📸 Photo Evidence Attached</span>
                      <span className="text-[11px] text-slate-500 font-mono">100% Free Local Storage</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="citizen-modal-photo-upload"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#133E87] hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="text-2xl mb-1">📤</span>
                    <span className="text-xs font-bold text-[#0B2545]">
                      {isUploading ? 'Uploading...' : 'Click to Upload Defect Photo'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 10MB</span>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 h-11 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 h-11 rounded-lg bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Registering...' : 'Submit Grievance →'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
