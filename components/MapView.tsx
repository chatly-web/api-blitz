'use client';
import { useEffect, useRef, useState } from 'react';
import type { Report } from '@/lib/types';
import { deliveryUrl } from '@/components/CloudImage';
export const statusColors = { open: '#b87527', acknowledged: '#597bc2', in_progress: '#8d65b0', resolved: '#2c865b' };
const emptyReports: Report[] = [];
let googlePromise: Promise<void> | null = null;
function loadGoogle() {
  if (window.google?.maps) return Promise.resolve();
  if (!googlePromise) googlePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!)}&v=weekly`;
    script.async = true; script.onload = () => resolve(); script.onerror = () => { googlePromise = null; reject(new Error('Map unavailable')); };
    document.head.append(script);
  });
  return googlePromise;
}
function popup(report: Report, demo: boolean) {
  const node = document.createElement('div'); node.className = 'map-popup';
  const img = document.createElement('img'); img.alt = report.category;
  img.src = demo ? `https://picsum.photos/seed/civic-${report.id}/300/180` : deliveryUrl(report.beforePublicId, 300);
  img.onerror = () => img.remove();
  const title = document.createElement('h3'); title.textContent = report.category;
  const description = document.createElement('p'); description.textContent = report.description.slice(0, 110);
  const link = document.createElement('a'); link.href = demo ? '/demo/report' : `/r/${report.id}`; link.textContent = 'View report →';
  node.append(img, title, description, link); return node;
}
export function MapView({ reports = emptyReports, value, onPick, demo = false }: { reports?: Report[]; value?: { lat: number; lng: number }; onPick?: (point: { lat: number; lng: number }) => void; demo?: boolean }) {
  const element = useRef<HTMLDivElement>(null);
  const pick = useRef(onPick); pick.current = onPick;
  const [fallback, setFallback] = useState(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY);
  const [error, setError] = useState('');
  const lat = value?.lat ?? reports[0]?.lat ?? 23.0225;
  const lng = value?.lng ?? reports[0]?.lng ?? 72.5714;
  const isPicker = Boolean(onPick);
  useEffect(() => {
    let stopped = false; let dispose = () => {};
    async function initialize() {
      if (!element.current) return;
      try {
        if (!fallback) {
          await loadGoogle(); if (stopped || !element.current) return;
          const map = new google.maps.Map(element.current, { center: { lat, lng }, zoom: isPicker ? 17 : 13, streetViewControl: false, mapTypeControl: false, fullscreenControl: false });
          const markers: google.maps.Marker[] = [];
          if (isPicker) {
            const marker = new google.maps.Marker({ map, position: { lat, lng }, draggable: true }); markers.push(marker);
            marker.addListener('dragend', () => { const point = marker.getPosition(); if (point) pick.current?.({ lat: point.lat(), lng: point.lng() }); });
            map.addListener('click', (event: google.maps.MapMouseEvent) => { if (event.latLng) pick.current?.({ lat: event.latLng.lat(), lng: event.latLng.lng() }); });
          } else {
            const bounds = new google.maps.LatLngBounds();
            reports.forEach(report => {
              const marker = new google.maps.Marker({ map, position: { lat: report.lat, lng: report.lng }, title: `${report.category}: ${report.status}`, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: statusColors[report.status], fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
              markers.push(marker); bounds.extend({ lat: report.lat, lng: report.lng });
              const info = new google.maps.InfoWindow({ content: popup(report, demo) }); marker.addListener('click', () => info.open({ map, anchor: marker }));
            });
            if (reports.length > 1) map.fitBounds(bounds, 45);
          }
          dispose = () => { markers.forEach(marker => marker.setMap(null)); google.maps.event.clearInstanceListeners(map); };
        } else {
          const L = await import('leaflet'); if (stopped || !element.current) return;
          const map = L.map(element.current, { zoomControl: true }).setView([lat, lng], isPicker ? 17 : 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19 }).addTo(map);
          const icon = (color: string) => L.divIcon({ html: `<div class="map-marker" style="background:${color}"></div>`, className: '', iconSize: [22,22], iconAnchor: [11,11] });
          if (isPicker) {
            const marker = L.marker([lat,lng], { draggable: true, icon: icon('#216c51') }).addTo(map);
            marker.on('dragend', () => { const point = marker.getLatLng(); pick.current?.({ lat: point.lat, lng: point.lng }); });
            map.on('click', (event: import('leaflet').LeafletMouseEvent) => pick.current?.({ lat: event.latlng.lat, lng: event.latlng.lng }));
          } else {
            reports.forEach(report => L.marker([report.lat,report.lng], { icon: icon(statusColors[report.status]), title: `${report.category}: ${report.status}` }).addTo(map).bindPopup(popup(report, demo)));
            if (reports.length > 1) map.fitBounds(reports.map(report => [report.lat,report.lng] as [number,number]), { padding: [35,35], maxZoom: 15 });
          }
          dispose = () => map.remove();
        }
      } catch {
        if (stopped) return;
        if (!fallback) setFallback(true); else setError('Map tiles could not load. Use the coordinate fields or the report links below.');
      }
    }
    initialize();
    return () => { stopped = true; dispose(); };
  }, [fallback, lat, lng, isPicker, reports, demo]);
  return <div className="map-shell"><div ref={element} className="map-canvas" aria-label={isPicker ? 'Draggable report location map' : 'Map of reported civic issues'} role="region" />{process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && !fallback && <button type="button" className="map-toolbar" onClick={() => setFallback(true)}>Use fallback map</button>}{fallback && <span className="map-fallback">OpenStreetMap fallback{isPicker ? ' · Click or drag the marker' : ''}</span>}{error && <div className="map-toolbar" role="status">{error}</div>}</div>;
}
