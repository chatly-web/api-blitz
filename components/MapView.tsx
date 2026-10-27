'use client';
import { useEffect, useRef, useState } from 'react';
import type { Report } from '@/lib/types';
import { deliveryUrl } from '@/components/CloudImage';
import { getMapTileConfig } from '@/lib/geoapify';

export const statusColors = { open: '#b87527', acknowledged: '#597bc2', in_progress: '#8d65b0', resolved: '#2c865b' };
const emptyReports: Report[] = [];

function popup(report: Report, demo: boolean) {
  const node = document.createElement('div');
  node.className = 'map-popup';
  const img = document.createElement('img');
  img.alt = report.category;
  img.src = demo ? `https://picsum.photos/seed/civic-${report.id}/300/180` : deliveryUrl(report.beforePublicId, 300);
  img.onerror = () => img.remove();
  const title = document.createElement('h3');
  title.textContent = report.category;
  const description = document.createElement('p');
  description.textContent = report.description.slice(0, 110);
  const link = document.createElement('a');
  link.href = demo ? '/demo/report' : `/r/${report.id}`;
  link.textContent = 'View report →';
  node.append(img, title, description, link);
  return node;
}

export function MapView({
  reports = emptyReports,
  value,
  onPick,
  demo = false,
}: {
  reports?: Report[];
  value?: { lat: number; lng: number };
  onPick?: (point: { lat: number; lng: number }) => void;
  demo?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const pick = useRef(onPick);
  pick.current = onPick;
  const [error, setError] = useState('');
  const tileConfig = getMapTileConfig();
  const lat = value?.lat ?? reports[0]?.lat ?? 23.0225;
  const lng = value?.lng ?? reports[0]?.lng ?? 72.5714;
  const isPicker = Boolean(onPick);

  useEffect(() => {
    let stopped = false;
    let dispose = () => {};

    async function initialize() {
      if (!element.current) return;
      try {
        const L = await import('leaflet');
        if (stopped || !element.current) return;

        const map = L.map(element.current, { zoomControl: true }).setView([lat, lng], isPicker ? 17 : 13);
        L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          maxZoom: tileConfig.maxZoom,
        }).addTo(map);

        const icon = (color: string) =>
          L.divIcon({
            html: `<div class="map-marker" style="background:${color}"></div>`,
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

        if (isPicker) {
          const marker = L.marker([lat, lng], { draggable: true, icon: icon('#216c51') }).addTo(map);
          marker.on('dragend', () => {
            const point = marker.getLatLng();
            pick.current?.({ lat: point.lat, lng: point.lng });
          });
          map.on('click', (event: import('leaflet').LeafletMouseEvent) => {
            pick.current?.({ lat: event.latlng.lat, lng: event.latlng.lng });
          });
        } else {
          reports.forEach(report => {
            L.marker([report.lat, report.lng], {
              icon: icon(statusColors[report.status]),
              title: `${report.category}: ${report.status}`,
            })
              .addTo(map)
              .bindPopup(popup(report, demo));
          });
          if (reports.length > 1) {
            map.fitBounds(reports.map(report => [report.lat, report.lng] as [number, number]), {
              padding: [35, 35],
              maxZoom: 15,
            });
          }
        }
        dispose = () => map.remove();
      } catch {
        if (stopped) return;
        setError('Map tiles could not load. Use the coordinate fields or the report links below.');
      }
    }

    initialize();
    return () => {
      stopped = true;
      dispose();
    };
  }, [lat, lng, isPicker, reports, demo, tileConfig.url, tileConfig.attribution, tileConfig.maxZoom]);

  return (
    <div className="map-shell">
      <div
        ref={element}
        className="map-canvas"
        aria-label={isPicker ? 'Draggable report location map' : 'Map of reported civic issues'}
        role="region"
      />
      <span className="map-fallback">
        {tileConfig.provider}
        {isPicker ? ' · Click or drag the marker' : ''}
      </span>
      {error && (
        <div className="map-toolbar" role="status">
          {error}
        </div>
      )}
    </div>
  );
}
