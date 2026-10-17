'use client';

// ❗ BẮT BUỘC THEO CHỈ DẪN KỸ THUẬT: Import CSS MapLibre đầu file để tránh vỡ layout map
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { PartyVenue } from '@/types/party';
import { createPinElement } from './VenuePin';

// ❗ KHẮC PHỤC TRIỆT ĐỂ BẪY WEBPACK / NEXT.JS:
// Next.js chunks làm sai đường dẫn worker (404), dẫn đến lỗi "Worker failed to load".
// Bắt buộc trỏ thẳng về file worker tĩnh nội bộ được lưu tại /maplibre-gl-worker.mjs
if (typeof window !== 'undefined') {
  try {
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch (err) {
    console.warn('[MapView] Lỗi khởi tạo workerUrl:', err);
  }
}

interface MapViewProps {
  venues: PartyVenue[];
  filteredVenueIds: Set<string>;
  selectedVenue: PartyVenue | null;
  onSelectVenue: (venue: PartyVenue) => void;
}

export default function MapView({
  venues,
  filteredVenueIds,
  selectedVenue,
  onSelectVenue,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

  // 1. Khởi tạo MapLibre một lần duy nhất
  useEffect(() => {
    if (!mapContainer.current) return;

    // Nguồn bản đồ OpenFreeMap Dark: Miễn phí 100%, không cần API key, sạch bóng watermark, hiển thị trọn vẹn đường phố Sài Gòn
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [106.67, 10.77], // [lng, lat] TP.HCM
      zoom: 13,
      pitch: 60, // Góc nhìn 2.5D sang trọng
      bearing: -15,
      attributionControl: false,
    });

    // Thêm điều khiển zoom / la bàn ở góc phải trên
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      // Bật hiệu ứng 3D buildings nếu source openmaptiles có sẵn
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (l: any) => l.type === 'symbol' && l.layout && 'text-field' in l.layout
      )?.id;

      if (!map.getLayer('3d-buildings') && map.getSource('openmaptiles')) {
        try {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#1a2234',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.5,
              },
            },
            labelLayerId
          );
        } catch {
          // Fallback an toàn
        }
      }
    });

    mapRef.current = map;

    // 🧹 DỌN DẸP BẮT BUỘC: Clean-up Memory Leak & React 19 / Next.js 16 Strict Mode
    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Đồng bộ Markers khi danh sách quán hoặc bộ lọc thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Xóa markers cũ không còn trong venues
    const currentVenueIds = new Set(venues.map((v) => v.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentVenueIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Tạo hoặc cập nhật markers
    venues.forEach((venue) => {
      const coords = venue.map_coordinates;
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return; // Bỏ qua quán thiếu tọa độ
      }

      // ⚠️ ĐẢO TỌA ĐỘ CHUẨN GEOJSON: [lng, lat]
      const lngLat: [number, number] = [Number(coords.lng), Number(coords.lat)];
      const isDimmed = !filteredVenueIds.has(venue.id);

      // Nếu đã có marker -> xóa đi dựng lại element mới cập nhật trạng thái
      if (markersRef.current[venue.id]) {
        markersRef.current[venue.id].remove();
      }

      const el = createPinElement(venue, isDimmed, () => {
        onSelectVenue(venue);
        map.flyTo({
          center: lngLat,
          zoom: 15.5,
          pitch: 55,
          duration: 1000,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map);

      markersRef.current[venue.id] = marker;
    });
  }, [venues, filteredVenueIds, onSelectVenue]);

  // 3. Khi selectedVenue thay đổi từ bên ngoài -> Fly camera đến quán đó
  useEffect(() => {
    if (!selectedVenue || !mapRef.current) return;
    const coords = selectedVenue.map_coordinates;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      const lngLat: [number, number] = [Number(coords.lng), Number(coords.lat)];
      mapRef.current.flyTo({
        center: lngLat,
        zoom: 15.8,
        pitch: 58,
        duration: 900,
        essential: true,
      });
    }
  }, [selectedVenue]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <div ref={mapContainer} className="w-full h-full" />
      {/* Lớp phủ gradient viền tinh tế */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}
