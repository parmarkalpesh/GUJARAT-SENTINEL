import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Camera } from '../../types';

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  cameraId: string;
  cameraName?: string;
  location: string;
  district?: string;
  confidence?: number;
}

interface GISMapProps {
  cameras?: Camera[];
  selectedCamera?: Camera | null;
  onSelectCamera?: (cam: Camera) => void;
  routePoints?: RoutePoint[];
  center?: [number, number];
  zoom?: number;
  alertCameraIds?: string[];
  height?: string;
  showHeatmap?: boolean;
}

export default function GISMap({
  cameras = [],
  selectedCamera = null,
  onSelectCamera,
  routePoints = [],
  center = [23.2156, 72.6369], // Gandhinagar / Gujarat center
  zoom = 8,
  alertCameraIds = [],
  height = '100%',
}: GISMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Clean Executive Tactical GIS map (Esri World Light Gray Canvas)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Esri, HERE, Garmin',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center/zoom if changed
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Render Camera Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    cameras.forEach((cam) => {
      const isCritical = alertCameraIds.includes(cam.camera_id) || cam.status === 'OFFLINE';
      const isOnline = cam.status === 'ONLINE';

      const color = isCritical ? '#ef4444' : isOnline ? '#10b981' : '#f59e0b';
      const pulseClass = isCritical ? 'camera-marker-alert' : isOnline ? 'camera-marker-online' : '';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div class="${pulseClass}" style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${color};
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px ${color};
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([cam.latitude, cam.longitude], { icon: customIcon });

      const popupContent = `
        <div style="padding: 4px 6px; font-family: 'Inter', sans-serif; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #00d4ff;">${cam.camera_id}</span>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${isOnline ? '#10b981' : '#ef4444'};">
              ${cam.status}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">${cam.name}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px;">${cam.location}, ${cam.district}</div>
          <div style="font-size: 10px; color: #cbd5e1; border-top: 1px solid #2a3a4a; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div>Dept: <b>${cam.department}</b></div>
            <div>Vendor: <b>${cam.vendor}</b></div>
            <div>VMS: <b>${cam.vms}</b></div>
            <div>Res: <b>${cam.resolution}</b></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onSelectCamera) {
        marker.on('click', () => onSelectCamera(cam));
      }

      marker.addTo(markersLayerRef.current!);
    });
  }, [cameras, alertCameraIds]);

  // Render Vehicle Route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    if (routePoints.length === 0) return;

    const latLngs: L.LatLngExpression[] = routePoints.map((p) => [p.latitude, p.longitude]);

    // Outer glowing track line
    const glowLine = L.polyline(latLngs, {
      color: '#00d4ff',
      weight: 6,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    });
    glowLine.addTo(routeLayerRef.current);

    // Inner bright dashed line
    const routeLine = L.polyline(latLngs, {
      color: '#00d4ff',
      weight: 3,
      opacity: 0.9,
      dashArray: '8, 8',
      className: 'route-animated',
    });
    routeLine.addTo(routeLayerRef.current);

    // Add numbered sequential stops along the route
    routePoints.forEach((point, index) => {
      const isStart = index === 0;
      const isEnd = index === routePoints.length - 1;

      const stopIcon = L.divIcon({
        className: 'custom-route-stop',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${isEnd ? '#ef4444' : isStart ? '#10b981' : '#00d4ff'};
            border: 2px solid #ffffff;
            color: #000000;
            font-weight: 900;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 14px ${isEnd ? '#ef4444' : '#00d4ff'};
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const stopMarker = L.marker([point.latitude, point.longitude], { icon: stopIcon });

      const timeFormatted = point.timestamp.includes('T')
        ? point.timestamp.split('T')[1].substring(0, 8)
        : point.timestamp;

      stopMarker.bindPopup(`
        <div style="padding: 4px 6px; font-family: 'Inter', sans-serif;">
          <div style="font-size: 10px; font-weight: 800; color: #00d4ff; text-transform: uppercase;">
            Stop #${index + 1} ${isStart ? '(First Sighting)' : isEnd ? '(Latest Sighting)' : ''}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #ffffff; margin-top: 2px;">${point.location}</div>
          <div style="font-size: 11px; color: #f59e0b; font-weight: 700; margin-top: 2px;">🕒 ${timeFormatted}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Camera: <b>${point.cameraId}</b> (${point.cameraName || ''})</div>
          ${point.confidence ? `<div style="font-size: 10px; color: #10b981;">Confidence: <b>${point.confidence.toFixed(1)}%</b></div>` : ''}
        </div>
      `);

      stopMarker.addTo(routeLayerRef.current!);
    });

    // Auto fit bounds to show entire route
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [routePoints]);

  return (
    <div style={{ width: '100%', height, minHeight: '300px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
