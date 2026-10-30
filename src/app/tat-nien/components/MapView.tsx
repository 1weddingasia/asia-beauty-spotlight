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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const startCenter: [number, number] =
      initialCenter ||
      flyToCenter ||
      (userLocation ? [userLocation.lng, userLocation.lat] : [106.67, 10.77]);

    // Nguồn bản đồ OpenFreeMap Bright: Miễn phí 100%, không cần API key, sạch bóng watermark, hiển thị trọn vẹn đường phố Sài Gòn sáng rõ và tươi sáng
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: startCenter, // [lng, lat]
      zoom: userLocation ? (isMobile ? 14 : 14.5) : (isMobile ? 12.8 : 13.2),
      pitch: isMobile ? 15 : 30, // Góc nghiêng vừa phải giúp ghim phân bổ thoáng đãng
      bearing: 0,
      attributionControl: false,
      maxTileCacheSize: 50,
    });

    // Thêm điều khiển zoom / la bàn ở góc phải trên
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    // 🔍 CHỐNG ĐÈ GHIM KHI NHIỀU QUÁN: Cập nhật class map-zoom-far tự động theo mức zoom
    const handleZoom = () => {
      if (!mapContainer.current) return;
      const zoom = map.getZoom();
      if (zoom < 14.0) {
        mapContainer.current.classList.add('map-zoom-far');
      } else {
        mapContainer.current.classList.remove('map-zoom-far');
      }
    };
    map.on('zoom', handleZoom);
    handleZoom();

    map.on('load', () => {
      // 🌟 Tinh chỉnh tone Warm Luxury Light (Sáng sang trọng ấm cúng)
      try {
        if (map.getLayer('background')) {
          map.setPaintProperty('background', 'background-color', '#fbf8f3');
        }
      } catch (err) {
        console.warn('[MapView] Tone layer adjust error:', err);
      }

      // Bật hiệu ứng 3D buildings trên máy tính (bỏ qua trên di động để giữ vững 60 FPS mượt mà)
      if (!isMobile) {
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
                  'fill-extrusion-color': '#e7e2d8',
                  'fill-extrusion-height': ['get', 'height'],
                  'fill-extrusion-base': ['get', 'min_height'],
                  'fill-extrusion-opacity': 0.65,
                },
              },
              labelLayerId
            );
          } catch {
            // Fallback an toàn
          }
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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Tạo hoặc cập nhật markers
    venues.forEach((venue) => {
      const coords = venue.map_coordinates;
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return; // Bỏ qua quán thiếu tọa độ
      }

      // ⚠️ ĐẢO TỌA ĐỘ CHUẨN GEOJSON: [lng, lat]
      const lngLat: [number, number] = [Number(coords.lng), Number(coords.lat)];
      const isDimmed = !filteredVenueIds.has(venue.id);

      const existingMarker = markersRef.current[venue.id];
      if (existingMarker) {
        // Tối ưu cực đại: Cập nhật DOM trực tiếp qua classList, không xóa dựng lại marker
        const el = existingMarker.getElement();
        const pinInner = el.querySelector('.venue-pin-inner');
        if (pinInner) {
          if (isDimmed) {
            pinInner.classList.add('opacity-30', 'scale-90');
            pinInner.classList.remove('opacity-100', 'scale-100', 'hover:scale-110');
          } else {
            pinInner.classList.remove('opacity-30', 'scale-90');
            pinInner.classList.add('opacity-100', 'scale-100', 'hover:scale-110');
          }
        }
      } else {
        // Chỉ tạo mới nếu marker chưa có trong bản đồ
        const el = createPinElement(venue, isDimmed, () => {
          onSelectVenue(venue);
          map.flyTo({
            center: lngLat,
            zoom: 15.5,
            pitch: isMobile ? 35 : 55,
            duration: 900,
            essential: true,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(lngLat)
          .addTo(map);

        markersRef.current[venue.id] = marker;
      }
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
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const lngLat: [number, number] = [Number(coords.lng), Number(coords.lat)];
      mapRef.current.flyTo({
        center: lngLat,
        zoom: isMobile ? 15.2 : 15.8,
        pitch: isMobile ? 30 : 55,
        offset: isMobile ? [0, -110] : [-80, 0], // Mobile: đẩy lên trên tránh BottomSheet; Desktop: căn giữa vùng trống ngoài Side Panel
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
    <div className="relative w-full h-full overflow-hidden bg-[#fbf8f3]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
