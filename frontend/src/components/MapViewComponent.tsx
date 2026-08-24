'use client';

// E.2 / C.7 — Map View Component
// High-visibility civic badge markers visible at ALL zoom levels (zoomed in & zoomed out)
// CARTO Positron tiles + CSS warm filter sepia(8%) saturate(85%) hue-rotate(-6deg)
// Ground anchor beacons + High-contrast SVG badges + Critical pulse halos

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

function buildCustomMarkerHtml(complaint: Complaint): string {
  const catColor = getCategoryColor(complaint.category);
  const sevColor = getSeverityColor(complaint.confirmation_count, complaint.status);
  const isCritical = complaint.confirmation_count >= 8 && complaint.status !== 'Resolved';
  const isResolved = complaint.status === 'Resolved';

  const borderColor = isResolved ? '#3E8E5B' : isCritical ? '#B33B2E' : catColor;
  const badgeBg = isResolved ? '#F0F9F4' : '#FFFFFF';

  const iconSvgs: Record<string, string> = {
    pothole: `<circle cx="12" cy="13" r="5" stroke="${borderColor}" stroke-width="2" fill="none"/><path d="M9 13 Q10 10 12 9 Q14 10 15 13" stroke="${borderColor}" stroke-width="2" fill="none"/>`,
    water_leak: `<path d="M12 3 Q16 8 16 12 A4 4 0 0 1 8 12 Q8 8 12 3Z" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}30"/>`,
    broken_streetlight: `<line x1="12" y1="21" x2="12" y2="7" stroke="${borderColor}" stroke-width="2"/><ellipse cx="17" cy="4" rx="2.5" ry="1.5" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}40"/>`,
    garbage_overflow: `<path d="M5 8 L6.5 20 H17.5 L19 8Z" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}25"/><line x1="3" y1="8" x2="21" y2="8" stroke="${borderColor}" stroke-width="2"/>`,
    open_manhole: `<ellipse cx="12" cy="12" rx="8" ry="4.5" stroke="${borderColor}" stroke-width="2" fill="${borderColor}30"/>`,
    exposed_wiring: `<path d="M4 18 L10 12 Q12 10 14 8 L20 4" stroke="${borderColor}" stroke-width="2" stroke-dasharray="3 2"/>`,
    gas_leak: `<path d="M12 20 A6 6 0 0 1 6 14 C6 10 12 4 12 4 C12 4 18 10 18 14 A6 6 0 0 1 12 20Z" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}25"/>`,
    drainage: `<path d="M4 6 H20 V10 H4 Z" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}30"/><line x1="8" y1="10" x2="8" y2="18" stroke="${borderColor}" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="18" stroke="${borderColor}" stroke-width="2"/>`,
    road_damage: `<rect x="3" y="8" width="18" height="8" rx="1" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}25"/><line x1="3" y1="12" x2="21" y2="12" stroke="${borderColor}" stroke-dasharray="3 2" stroke-width="1.5"/>`,
    traffic_signal: `<rect x="8" y="3" width="8" height="14" rx="2" stroke="${borderColor}" stroke-width="1.8" fill="${borderColor}25"/><circle cx="12" cy="7" r="1.5" fill="#B33B2E"/><circle cx="12" cy="11" r="1.5" fill="#D89A2C"/><circle cx="12" cy="15" r="1.5" fill="#3E8E5B"/>`,
  };

  const normKey = (complaint.category || '').toLowerCase().replace(/\s+/g, '_');
  const iconInner = iconSvgs[normKey] || iconSvgs['pothole'];

  // Critical pulse sonar aura
  const pulseHtml = isCritical
    ? `<div style="position:absolute;inset:-10px;border-radius:12px;border:3px solid #B33B2E;animation:pulse-dot 1800ms ease-in-out infinite;opacity:0.6;pointer-events:none;"></div>`
    : '';

  // Ground beacon dot below the marker tail for high visibility when zoomed out
  const groundBeacon = `
    <div style="
      position:absolute;
      bottom:-14px;
      left:50%;
      transform:translateX(-50%);
      width:10px;
      height:10px;
      border-radius:50%;
      background:${borderColor};
      border:2px solid #FFFFFF;
      box-shadow:0 0 8px ${borderColor};
    "></div>
  `;

  return `
    <div style="
      position:relative;
      width:32px;
      height:32px;
      border-radius:10px;
      background:${badgeBg};
      border:2.5px solid ${borderColor};
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 4px 14px rgba(0,0,0,0.3), 0 2px 5px rgba(0,0,0,0.15);
      cursor:pointer;
      transition:transform 150ms ease;
    ">
      ${pulseHtml}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
        ${iconInner}
      </svg>
      <!-- Downward pointing badge tail -->
      <div style="
        position:absolute;
        bottom:-8px;
        left:50%;
        transform:translateX(-50%);
        width:0;
        height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${borderColor};
      "></div>
      ${groundBeacon}
    </div>
  `;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  complaints = [],
  onSelectComplaint,
  center = [22.3072, 73.1812],
  zoom = 12.5,
  showHeatmap = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  // Initialize map safely
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 10,
        maxZoom: 19,
      }).setView(center, zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
      }).addTo(map);

      // Auto fit bounds to encompass all Vadodara complaint markers
      if (safeComplaints.length > 0) {
        const validCoords = safeComplaints
          .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
          .map((c) => [c.latitude, c.longitude] as [number, number]);

        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }

      mapRef.current = map;
      setIsMapReady(true);
    } catch (err) {
      console.warn('[MapView] Leaflet init error:', err);
    }

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapReady(false);
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker || (layer as any)._heat) {
        map.removeLayer(layer);
      }
    });

    safeComplaints.forEach((c, i) => {
      if (!c || typeof c.latitude !== 'number' || typeof c.longitude !== 'number') return;

      const customIcon = L.divIcon({
        html: buildCustomMarkerHtml(c),
        className: 'leaflet-custom-marker',
        iconSize: [32, 44],
        iconAnchor: [16, 44],
        popupAnchor: [0, -44],
      });

      const marker = L.marker([c.latitude, c.longitude], {
        icon: customIcon,
        zIndexOffset: c.confirmation_count >= 8 ? 1000 : 500,
      });

      const popupHtml = `
        <div style="padding:14px;min-width:220px;font-family:'Public Sans',sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:700;text-transform:capitalize;color:#22221F;">
              ${(c.category || '').replace(/_/g, ' ')} #${c.id}
            </span>
            <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${
              c.status === 'Resolved' ? '#EDF3EE' : '#EAF0F4'
            };color:${c.status === 'Resolved' ? '#3E8E5B' : '#5C7A94'};">
              ${c.status}
            </span>
          </div>
          <div style="font-size:12px;color:#6B6659;line-height:1.45;margin-bottom:10px;">
            ${c.description || 'Civic infrastructure report.'}
          </div>
          ${
            c.is_recurring
              ? `<div style="font-size:11px;font-weight:600;color:#C05B32;background:#F7E3D8;border-radius:6px;padding:5px 8px;margin-bottom:10px;">
              ⚠️ Recurring spot — ${c.total_cycles || 2}× in ${c.months_span || 6} months
            </div>`
              : ''
          }
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B6659;font-family:'IBM Plex Mono',monospace;border-top:1px solid #E8E2D6;padding-top:8px;">
            <span>👥 ${c.confirmation_count || 1} confirmed</span>
            <span>⚡ Score: ${c.severity_score || 0}</span>
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
        }, i * 15);
        timeoutsRef.current.push(t);
      } else {
        marker.addTo(map);
      }
    });

    // Heatmap layer
    if (showHeatmap && safeComplaints.length > 0) {
      import('leaflet.heat')
        .then(() => {
          if (!mapRef.current) return;
          const pts = safeComplaints.map((c) => [
            c.latitude,
            c.longitude,
            Math.min(1, (c.confirmation_count || 1) * 0.15),
          ]);
          const heat = (L as any).heatLayer(pts, {
            radius: 28,
            blur: 18,
            maxZoom: 17,
            gradient: { 0.3: '#6B9E7A', 0.6: '#D89A2C', 0.9: '#B33B2E' },
          });
          heat.addTo(mapRef.current);
        })
        .catch(() => {});
    }
  }, [isMapReady, safeComplaints, showHeatmap, onSelectComplaint]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 400,
          borderRadius: 'inherit',
        }}
      />
    </div>
  );
};
