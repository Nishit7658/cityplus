'use client';

// E.2 / C.7 — Map View Component
// High-visibility civic badge markers visible at ALL zoom levels (zoomed in & zoomed out)
// CARTO Positron tiles + CSS warm filter sepia(8%) saturate(85%) hue-rotate(-6deg)
// Pixel-accurate iconAnchor prevents position drift during zoom in/out
// Auto fit-bounds frames all municipal areas and problem spots
// Stored XSS protection: Sanitized HTML strings and escapeHtml utility

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint } from '@/types';
import { getCategoryColor, getSeverityColor } from './CategoryIcon';

interface MapViewComponentProps {
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
}

/**
 * Escapes HTML entities to prevent Stored XSS in map popups
 */
function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildCustomMarkerHtml(complaint: Complaint): string {
  const catColor = getCategoryColor(complaint.category);
  const isCritical = complaint.confirmation_count >= 8 && complaint.status !== 'Resolved';
  const isResolved = complaint.status === 'Resolved';

  const borderColor = isResolved ? '#3E8E5B' : isCritical ? '#B33B2E' : catColor;
  const badgeBg = isResolved ? '#F0F9F4' : '#FFFFFF';

  // Crisp category icons centered at (16, 16)
  const iconSvgs: Record<string, string> = {
    pothole: `
      <ellipse cx="16" cy="16" rx="6" ry="4" stroke="${borderColor}" stroke-width="1.75" fill="none"/>
      <path d="M13 16 Q14.5 13.5 16 13 Q17.5 13.5 19 16" stroke="${borderColor}" stroke-width="1.75" fill="none"/>
    `,
    water_leak: `
      <path d="M16 8 Q19.5 13 19.5 16.5 A3.5 3.5 0 0 1 12.5 16.5 Q12.5 13 16 8Z" stroke="${borderColor}" stroke-width="1.75" fill="${borderColor}30"/>
    `,
    broken_streetlight: `
      <line x1="16" y1="23" x2="16" y2="10" stroke="${borderColor}" stroke-width="1.75"/>
      <path d="M16 10 Q16 7 20 7" stroke="${borderColor}" stroke-width="1.75" fill="none"/>
      <ellipse cx="20" cy="7" rx="2" ry="1.2" stroke="${borderColor}" stroke-width="1.5" fill="${borderColor}40"/>
    `,
    garbage_overflow: `
      <path d="M10 11 L11.5 21 H20.5 L22 11Z" stroke="${borderColor}" stroke-width="1.75" fill="${borderColor}25"/>
      <line x1="8.5" y1="11" x2="23.5" y2="11" stroke="${borderColor}" stroke-width="1.75"/>
      <path d="M13 11 V9.5 Q13 8.5 16 8.5 Q19 8.5 19 9.5 V11" stroke="${borderColor}" stroke-width="1.5"/>
    `,
    open_manhole: `
      <ellipse cx="16" cy="16" rx="7" ry="4" stroke="${borderColor}" stroke-width="1.75" fill="${borderColor}30"/>
      <ellipse cx="16" cy="14.5" rx="4" ry="2" stroke="${borderColor}" stroke-width="1.5" fill="none"/>
    `,
    exposed_wiring: `
      <path d="M10 21 L14 16" stroke="${borderColor}" stroke-width="1.75"/>
      <path d="M18 13 L22 9" stroke="${borderColor}" stroke-width="1.75"/>
      <circle cx="15" cy="15" r="1.5" stroke="${borderColor}" fill="${borderColor}40"/>
      <path d="M14 11 L17 8" stroke="${borderColor}" stroke-width="1.5"/>
    `,
    gas_leak: `
      <path d="M16 22 A5 5 0 0 1 11 17 C11 14 16 9 16 9 C16 9 21 14 21 17 A5 5 0 0 1 16 22Z" stroke="${borderColor}" stroke-width="1.75" fill="${borderColor}25"/>
    `,
    drainage: `
      <path d="M9 10 H23 V13 H9 Z" stroke="${borderColor}" stroke-width="1.5" fill="${borderColor}30"/>
      <line x1="12" y1="13" x2="12" y2="21" stroke="${borderColor}" stroke-width="1.75"/>
      <line x1="16" y1="13" x2="16" y2="21" stroke="${borderColor}" stroke-width="1.75"/>
      <line x1="20" y1="13" x2="20" y2="21" stroke="${borderColor}" stroke-width="1.75"/>
    `,
    road_damage: `
      <rect x="9" y="11" width="14" height="8" rx="1.5" stroke="${borderColor}" stroke-width="1.75" fill="${borderColor}25"/>
      <line x1="9" y1="15" x2="23" y2="15" stroke="${borderColor}" stroke-dasharray="2.5 1.5" stroke-width="1.2"/>
    `,
    traffic_signal: `
      <rect x="13" y="8" width="6" height="13" rx="1.5" stroke="${borderColor}" stroke-width="1.5" fill="${borderColor}25"/>
      <circle cx="16" cy="10.5" r="1.2" fill="#B33B2E"/>
      <circle cx="16" cy="14.5" r="1.2" fill="#D89A2C"/>
      <circle cx="16" cy="18.5" r="1.2" fill="#3E8E5B"/>
    `,
  };

  const normKey = (complaint.category || '').toLowerCase().replace(/\s+/g, '_');
  const iconInner = iconSvgs[normKey] || iconSvgs['pothole'];

  // Sonar pulse halo around badge for critical complaints
  const pulseHtml = isCritical
    ? `<div style="position:absolute;top:-4px;left:-4px;width:40px;height:40px;border-radius:12px;border:2.5px solid #B33B2E;animation:pulse-dot 1800ms ease-in-out infinite;opacity:0.6;pointer-events:none;"></div>`
    : '';

  // Standalone SVG pin: Total dimensions 32px wide by 42px tall
  // Needle anchor tip is exactly at (16, 41)
  return `
    <div class="marker-inner-drop" style="position:relative;width:32px;height:42px;cursor:pointer;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.28));">
      ${pulseHtml}
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;">
        <!-- Downward triangle tail pointing to (16, 41) -->
        <path d="M10 27 L16 41 L22 27 Z" fill="${borderColor}"/>
        <!-- Rounded square badge -->
        <rect x="1.5" y="1.5" width="29" height="28" rx="8" fill="${badgeBg}" stroke="${borderColor}" stroke-width="2.5"/>
        <!-- Inner Category Icon -->
        ${iconInner}
      </svg>
    </div>
  `;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  complaints = [],
  onSelectComplaint,
  center = [22.3072, 73.1812],
  zoom = 13,
  showHeatmap = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatmapLayerRef = useRef<L.Layer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite'>('streets');

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix default marker asset paths in Next.js bundle
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    // High-readability CARTO Positron Light Cartography
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control
      .attribution({
        position: 'bottomleft',
        prefix: '<span style="font-size:10px;color:#888;">© VMC GIS • CARTO</span>',
      })
      .addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapRef.current = map;

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  // 2. Render Markers & Fit Bounds
  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    // Clear previous timeouts & markers
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    group.clearLayers();

    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    // Optional Heatmap layer for hotspots view
    if (showHeatmap && safeComplaints.length > 0 && typeof (L as unknown as { heatLayer?: unknown }).heatLayer === 'function') {
      const heatPoints = safeComplaints
        .filter((c) => c && typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude))
        .map((c) => [c.latitude, c.longitude, (c.severity_score || 50) / 100]);

      if (heatPoints.length > 0) {
        const heat = (L as unknown as { heatLayer: (pts: (number | number[])[], opts: unknown) => L.Layer }).heatLayer(
          heatPoints,
          {
            radius: 35,
            blur: 25,
            maxZoom: 16,
            gradient: { 0.2: '#0B4A40', 0.5: '#D97D53', 0.8: '#C05B32', 1.0: '#B33B2E' },
          }
        );
        heat.addTo(map);
        heatmapLayerRef.current = heat;
      }
    }

    const validCoordinates: [number, number][] = [];

    safeComplaints.forEach((c, i) => {
      if (!c || typeof c.latitude !== 'number' || typeof c.longitude !== 'number' || isNaN(c.latitude) || isNaN(c.longitude)) return;

      validCoordinates.push([c.latitude, c.longitude]);

      // Pixel-perfect anchor: tip is at x: 16 (half width), y: 41 (bottom point)
      const customIcon = L.divIcon({
        html: buildCustomMarkerHtml(c),
        className: 'leaflet-custom-marker',
        iconSize: [32, 42],
        iconAnchor: [16, 41],
        popupAnchor: [0, -41],
      });

      const marker = L.marker([c.latitude, c.longitude], {
        icon: customIcon,
        zIndexOffset: c.confirmation_count >= 8 ? 1000 : 500,
        title: `${c.category || 'Issue'} #${c.id}`,
      });

      const safeCategory = escapeHtml((c.category || '').replace(/_/g, ' '));
      const safeDescription = escapeHtml(c.description || 'Civic infrastructure report.');
      const safeStatus = escapeHtml(c.status);

      const popupHtml = `
        <div style="padding:14px;min-width:220px;font-family:'Public Sans',sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:700;text-transform:capitalize;color:#22221F;">
              ${safeCategory} #${c.id}
            </span>
            <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${
              c.status === 'Resolved' ? '#EDF3EE' : '#EAF0F4'
            };color:${c.status === 'Resolved' ? '#3E8E5B' : '#5C7A94'};">
              ${safeStatus}
            </span>
          </div>
          <div style="font-size:12px;color:#6B6659;line-height:1.45;margin-bottom:10px;">
            ${safeDescription}
          </div>
          ${
            c.is_recurring
              ? `<div style="font-size:11px;font-weight:600;color:#C05B32;background:#F7E3D8;border-radius:6px;padding:5px 8px;margin-bottom:10px;">
              ⚠️ Recurring spot — ${Number(c.total_cycles) || 2}× in ${Number(c.months_span) || 6} months
            </div>`
              : ''
          }
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B6659;font-family:'IBM Plex Mono',monospace;border-top:1px solid #E8E2D6;padding-top:8px;">
            <span>👥 ${Number(c.confirmation_count) || 1} confirmed</span>
            <span>⚡ Score: ${Number(c.severity_score) || 0}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      if (onSelectComplaint) {
        marker.on('click', () => onSelectComplaint(c));
      }

      if (i < 40) {
        const t = setTimeout(() => {
          if (mapRef.current) {
            marker.addTo(mapRef.current);
          }
        }, i * 12);
        timeoutsRef.current.push(t);
      } else {
        marker.addTo(map);
      }
    });

    // Auto fit map viewport to encompass ALL complaints across the city
    if (validCoordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(validCoordinates);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (err) {
        console.warn('[MapView] Fit bounds error:', err);
      }
    }
  }, [safeComplaints, onSelectComplaint, showHeatmap]);

  const toggleLayer = () => {
    if (!mapRef.current) return;
    const next = activeLayer === 'streets' ? 'satellite' : 'streets';
    setActiveLayer(next);
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          filter: 'sepia(8%) saturate(85%) hue-rotate(-6deg)',
          background: '#F3EEE4',
        }}
      />
      <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-md border border-slate-200 shadow-xs">
        <button
          onClick={toggleLayer}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          {activeLayer === 'streets' ? '🛰️ Satellite' : '🗺️ Map'}
        </button>
      </div>
    </div>
  );
};
