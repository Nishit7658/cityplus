'use client';

// E.2 / C.7 — Map View Component
// High-visibility civic badge markers, 10-Ward Geographic Polygons, 18m Spatial Clustering
// Clean Top-Right Unified GIS Toolbar with Zero Bottom-Right Control Overlaps

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Complaint } from '@/types';
import { getCategoryColor } from './CategoryIcon';
import { VADODARA_WARDS_GEOJSON, WardGeoJSONFeature } from '@/data/vadodaraWardsGeoJSON';

interface MapViewComponentProps {
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectWard?: (wardId: number | string) => void;
  selectedWard?: number | string;
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
  const isClustered = complaint.confirmation_count >= 4;

  const borderColor = isResolved ? '#15803D' : isCritical ? '#B91C1C' : catColor;
  const badgeBg = isResolved ? '#F0FDF4' : '#FFFFFF';

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
      <circle cx="16" cy="10.5" r="1.2" fill="#B91C1C"/>
      <circle cx="16" cy="14.5" r="1.2" fill="#D97706"/>
      <circle cx="16" cy="18.5" r="1.2" fill="#15803D"/>
    `,
  };

  const normKey = (complaint.category || '').toLowerCase().replace(/\s+/g, '_');
  const iconInner = iconSvgs[normKey] || iconSvgs['pothole'];

  const pulseHtml = isCritical
    ? `<div style="position:absolute;top:-4px;left:-4px;width:40px;height:40px;border-radius:10px;border:2px solid #B91C1C;animation:pulse-dot 1800ms ease-in-out infinite;opacity:0.6;pointer-events:none;"></div>`
    : '';

  const clusterPill = isClustered && !isResolved
    ? `<div style="position:absolute;top:-6px;right:-8px;background:#0B2545;color:#FFFFFF;border:1.5px solid #FFFFFF;border-radius:10px;font-size:9px;font-weight:800;font-family:'IBM Plex Mono',monospace;padding:1px 5px;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${complaint.confirmation_count}×</div>`
    : '';

  return `
    <div style="position:relative;width:32px;height:42px;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.22));">
      ${pulseHtml}
      ${clusterPill}
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;">
        <path d="M10 27 L16 41 L22 27 Z" fill="${borderColor}"/>
        <rect x="1.5" y="1.5" width="29" height="28" rx="6" fill="${badgeBg}" stroke="${borderColor}" stroke-width="2"/>
        ${iconInner}
      </svg>
    </div>
  `;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  complaints = [],
  onSelectComplaint,
  onSelectWard,
  selectedWard,
  center = [22.3072, 73.1812],
  zoom = 13,
  showHeatmap = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatmapLayerRef = useRef<L.Layer | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite'>('streets');
  const [showWards, setShowWards] = useState<boolean>(true);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(showHeatmap);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    setIsHeatmapActive(showHeatmap);
  }, [showHeatmap]);

  const safeComplaints = useMemo(() => {
    return Array.isArray(complaints) ? complaints : [];
  }, [complaints]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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
      fadeAnimation: false,
      zoomAnimation: true,
    });

    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = streetLayer;

    // Clean, unobstructed Bottom-Right Zoom Controls
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
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
        markersGroupRef.current = null;
      }
      if (wardsLayerRef.current) {
        wardsLayerRef.current.clearLayers();
        wardsLayerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  // 2. Render Geographic Ward Boundary Polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (wardsLayerRef.current) {
      map.removeLayer(wardsLayerRef.current);
      wardsLayerRef.current = null;
    }

    if (showWards) {
      const geoLayer = L.geoJSON(VADODARA_WARDS_GEOJSON as unknown as GeoJSON.FeatureCollection, {
        style: (feature) => {
          const feat = feature as unknown as WardGeoJSONFeature;
          const isSelected = selectedWard && String(selectedWard) === String(feat.properties.id);
          const color = feat.properties.color || '#0284C7';

          return {
            color: isSelected ? '#0B2545' : color,
            weight: isSelected ? 2.5 : 1.5,
            fillColor: color,
            fillOpacity: isSelected ? 0.22 : 0.08,
            dashArray: isSelected ? '4, 4' : 'none',
          };
        },
        onEachFeature: (feature, layer) => {
          const feat = feature as unknown as WardGeoJSONFeature;
          const props = feat.properties;

          // Count live complaints in this ward
          const wardTickets = safeComplaints.filter((c) => c.ward_id === props.id);
          const pendingCount = wardTickets.filter((c) => c.status !== 'Resolved').length;

          // Rich Ward Tooltip
          layer.bindTooltip(
            `
            <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:3px 2px;">
              <div style="font-size:12px;font-weight:700;color:#0B2545;">📍 ${props.name}</div>
              <div style="font-size:10px;font-family:'IBM Plex Mono',monospace;color:#64748B;margin-top:2px;">
                Zone: <strong>${props.zone}</strong> • Active: <strong style="color:${pendingCount > 0 ? '#B91C1C' : '#15803D'};">${pendingCount} tickets</strong>
              </div>
            </div>
            `,
            { sticky: true, opacity: 0.96 }
          );

          layer.on({
            mouseover: (e) => {
              const target = e.target as L.Path;
              target.setStyle({
                weight: 2.5,
                fillOpacity: 0.24,
              });
            },
            mouseout: (e) => {
              const target = e.target as L.Path;
              const isSelected = selectedWard && String(selectedWard) === String(props.id);
              target.setStyle({
                weight: isSelected ? 2.5 : 1.5,
                fillOpacity: isSelected ? 0.22 : 0.08,
              });
            },
            click: () => {
              if (onSelectWard) {
                onSelectWard(props.id);
              }
            },
          });
        },
      }).addTo(map);

      wardsLayerRef.current = geoLayer;
    }
  }, [showWards, selectedWard, safeComplaints, onSelectWard]);

  // 3. Render Markers & Synchronize Layers safely
  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (heatmapLayerRef.current) {
      if (map.hasLayer(heatmapLayerRef.current)) {
        map.removeLayer(heatmapLayerRef.current);
      }
      heatmapLayerRef.current = null;
    }

    if (isHeatmapActive && safeComplaints.length > 0 && typeof (L as unknown as { heatLayer?: unknown }).heatLayer === 'function') {
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
            gradient: { 0.2: '#0B2545', 0.5: '#1D4ED8', 0.8: '#B45309', 1.0: '#B91C1C' },
          }
        );
        heat.addTo(map);
        heatmapLayerRef.current = heat;
      }
    }

    const validCoordinates: [number, number][] = [];

    if (showPins) {
      safeComplaints.forEach((c) => {
        if (!c || typeof c.latitude !== 'number' || typeof c.longitude !== 'number' || isNaN(c.latitude) || isNaN(c.longitude)) return;

        validCoordinates.push([c.latitude, c.longitude]);

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
          <div style="padding:12px;min-width:210px;font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:13px;font-weight:700;text-transform:capitalize;color:#0B2545;">
                ${safeCategory} #${c.id}
              </span>
              <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;background:${
                c.status === 'Resolved' ? '#F0FDF4' : '#EFF6FF'
              };color:${c.status === 'Resolved' ? '#15803D' : '#1E40AF'};border:1px solid ${
                c.status === 'Resolved' ? '#BBF7D0' : '#BFDBFE'
              };">
                ${safeStatus}
              </span>
            </div>
            <div style="font-size:12px;color:#475569;line-height:1.45;margin-bottom:10px;">
              ${safeDescription}
            </div>
            ${
              c.confirmation_count >= 4
                ? `<div style="font-size:11px;font-weight:700;color:#0369A1;background:#F0F9FF;border:1px solid #BAE6FD;border-radius:4px;padding:4px 8px;margin-bottom:8px;">
                📍 18m Spatial Cluster (${c.confirmation_count} citizens merged)
              </div>`
                : ''
            }
            ${
              c.is_recurring
                ? `<div style="font-size:11px;font-weight:700;color:#B45309;background:#FFFBEB;border:1px solid #FDE68A;border-radius:4px;padding:4px 8px;margin-bottom:10px;">
                ⚠️ Recurring hotspot (${Number(c.total_cycles) || 2}× cycles)
              </div>`
                : ''
            }
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748B;font-family:'IBM Plex Mono',monospace;border-top:1px solid #E2E8F0;padding-top:8px;">
              <span>👥 ${Number(c.confirmation_count) || 1} verified</span>
              <span>⚡ Score: ${Number(c.severity_score) || 0}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 280 });

        if (onSelectComplaint) {
          marker.on('click', () => onSelectComplaint(c));
        }

        // Add to LayerGroup cleanly in single synchronous pass
        marker.addTo(group);
      });
    }

    // Auto fit map bounds if valid coordinates exist
    if (validCoordinates.length > 0 && mapContainerRef.current) {
      try {
        const bounds = L.latLngBounds(validCoordinates);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14, animate: false });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [safeComplaints, onSelectComplaint, isHeatmapActive, showPins]);

  const toggleLayer = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = activeLayer === 'streets' ? 'satellite' : 'streets';
    setActiveLayer(next);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (next === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          background: '#F1F5F9',
        }}
      />
      {/* Unified Docked Map GIS Toolbar (Top-Right: Zero Overlap with Bottom-Right Zoom Controls) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg border border-slate-200 shadow-sm flex-wrap">
        {/* 10 Wards Toggle */}
        <button
          type="button"
          onClick={() => setShowWards((v) => !v)}
          className={`text-xs font-bold px-2.5 py-1.5 rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
            showWards
              ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-2xs'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Toggle 10-Ward Polygons"
        >
          <span>🌐</span>
          <span>Wards {showWards ? '✓' : ''}</span>
        </button>

        {/* Incident Pins Toggle */}
        <button
          type="button"
          onClick={() => setShowPins((v) => !v)}
          className={`text-xs font-bold px-2.5 py-1.5 rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
            showPins
              ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-2xs'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Toggle Incident Pins"
        >
          <span>📍</span>
          <span>Pins {showPins ? '✓' : ''}</span>
        </button>

        {/* Heatmap Toggle */}
        <button
          type="button"
          onClick={() => setIsHeatmapActive((v) => !v)}
          className={`text-xs font-bold px-2.5 py-1.5 rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
            isHeatmapActive
              ? 'bg-[#B45309] text-white border-[#B45309] shadow-2xs'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Toggle Thermal Density Heatmap"
        >
          <span>🔥</span>
          <span>Heatmap {isHeatmapActive ? '✓' : ''}</span>
        </button>

        {/* Base Map Switcher */}
        <button
          type="button"
          onClick={toggleLayer}
          className="text-xs font-bold px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          title="Switch Map Tiles"
        >
          <span>{activeLayer === 'streets' ? '🛰️' : '🗺️'}</span>
          <span>{activeLayer === 'streets' ? 'Satellite' : 'Map'}</span>
        </button>
      </div>
    </div>
  );
};
