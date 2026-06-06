import { useEffect, useRef, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, STATUS_COLORS } from '../utils/constants';
import { truncate } from '../utils/helpers';
import { MapPin, Navigation } from 'lucide-react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    "><div style="transform:rotate(45deg);width:8px;height:8px;background:white;border-radius:50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export default function MapPage() {
  const { data: reports, isLoading } = useReports();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation(null)
    );
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = userLocation || MAP_DEFAULT_CENTER;
    const zoom = userLocation ? 13 : MAP_DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !reports) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapRef.current?.removeLayer(layer);
    });

    for (const report of reports) {
      if (!report.latitude || !report.longitude) continue;
      const color = STATUS_COLORS[report.status] || '#6B7280';
      const marker = L.marker([report.latitude, report.longitude], { icon: createIcon(color) }).addTo(mapRef.current);

      marker.bindPopup(
        `<div style="min-width:200px;max-width:280px;font-family:system-ui;">
          <div style="font-weight:600;margin-bottom:4px;font-size:14px;">${report.status}</div>
          <p style="font-size:12px;color:#475569;margin:0 0 4px 0;">${truncate(report.description, 100)}</p>
          <p style="font-size:11px;color:#94a3b8;margin:0;">${truncate(report.address, 60)}</p>
          <a href="/reports/${report.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#16a34a;font-weight:600;text-decoration:none;">View details</a>
        </div>`
      );
    }
  }, [reports]);

  const handleLocate = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 13);
    } else {
      navigator.geolocation?.getCurrentPosition((pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        mapRef.current?.setView(loc, 13);
      });
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl border border-slate-200 shadow-lg p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-slate-900">Report Map</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {status}
            </span>
          ))}
        </div>
        <button
          onClick={handleLocate}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-green-600 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          My location
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-slate-50/80">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-[calc(100vh-4rem)]" />
    </div>
  );
}
