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
  userLocation?: { lat: number; lng: number } | null;
  flyToCenter?: [number, number] | null;
  initialCenter?: [number, number] | null;
}

export default function MapView({
  venues,
  filteredVenueIds,
  selectedVenue,
  onSelectVenue,
  userLocation,
  flyToCenter,
  initialCenter,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // 1. Khởi tạo MapLibre một lần duy nhất
  useEffect(() => {
    if (!mapContainer.current) return;

    const startCenter: [number, number] =
      initialCenter ||
      flyToCenter ||
      (userLocation ? [userLocation.lng, userLocation.lat] : [106.67, 10.77]);

    // Nguồn bản đồ OpenFreeMap Dark: Miễn phí 100%, không cần API key, sạch bóng watermark, hiển thị trọn vẹn đường phố Sài Gòn
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: startCenter, // [lng, lat]
      zoom: initialCenter || userLocation ? 14.5 : 13,
      pitch: 60, // Góc nhìn 2.5D sang trọng
      bearing: -15,
      attributionControl: false,
    });

    // Thêm điều khiển zoom / la bàn ở góc phải trên
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    // 🔍 CHỐNG ĐÈ GHIM KHI NHIỀU QUÁN: Cập nhật class map-zoom-far tự động theo mức zoom
    const handleZoom = () => {
      if (!mapContainer.current) return;
      const zoom = map.getZoom();
      if (zoom < 14.2) {
        mapContainer.current.classList.add('map-zoom-far');
      } else {
        mapContainer.current.classList.remove('map-zoom-far');
      }
    };
    map.on('zoom', handleZoom);
    handleZoom();

    map.on('load', () => {
      // 🌟 Tinh chỉnh tone Midnight Slate (Xanh than tiệc đêm sang trọng)
      try {
        if (map.getLayer('background')) {
          map.setPaintProperty('background', 'background-color', '#0b1326');
        }
        if (map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', '#122644');
        }
        if (map.getLayer('waterway')) {
          map.setPaintProperty('waterway', 'line-color', '#1a3a66');
        }
        if (map.getLayer('highway_minor')) {
          map.setPaintProperty('highway_minor', 'line-color', '#22334e');
        }
        if (map.getLayer('highway_major_inner')) {
          map.setPaintProperty('highway_major_inner', 'line-color', '#33486c');
        }
        if (map.getLayer('highway_name_other')) {
          map.setPaintProperty('highway_name_other', 'text-color', '#94a3b8');
        }
      } catch (err) {
        console.warn('[MapView] Tone layer adjust error:', err);
      }

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
                'fill-extrusion-color': '#162238',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.6,
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

  // 3. Khi selectedVenue thay đổi -> Fly camera & làm nổi bật marker quán đó
  useEffect(() => {
    // Cập nhật class is-selected cho marker được chọn
    Object.keys(markersRef.current).forEach((id) => {
      const el = markersRef.current[id].getElement();
      if (selectedVenue && id === selectedVenue.id) {
        el.classList.add('is-selected');
      } else {
        el.classList.remove('is-selected');
      }
    });

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

  // 4. Khi flyToCenter thay đổi (chọn Quận / Huyện)
  useEffect(() => {
    if (!flyToCenter || !mapRef.current) return;
    mapRef.current.flyTo({
      center: flyToCenter,
      zoom: 14.5,
      pitch: 55,
      duration: 1000,
      essential: true,
    });
  }, [flyToCenter]);

  // 5. Khi userLocation thay đổi ("📍 Gần tôi")
  useEffect(() => {
    if (!userLocation || !mapRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userEl = document.createElement('div');
    userEl.className = 'relative flex items-center justify-center pointer-events-none';
    userEl.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute"></div>
      <div class="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-xl shadow-blue-500/80 relative z-10 flex items-center justify-center text-[10px]">📍</div>
    `;

    const userMarker = new maplibregl.Marker({ element: userEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current);

    userMarkerRef.current = userMarker;

    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      pitch: 50,
      duration: 1100,
      essential: true,
    });
  }, [userLocation]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <div ref={mapContainer} className="w-full h-full" />
      {/* Lớp phủ gradient viền tinh tế */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}
