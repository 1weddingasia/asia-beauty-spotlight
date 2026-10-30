'use client';

// ❗ BẮT BUỘC THEO CHỈ DẪN KỸ THUẬT: Import CSS MapLibre đầu file để tránh vỡ layout map
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { BeautyVenue } from '@/types/beauty';
import { createBeautyPinElement } from './BeautyPin';

if (typeof window !== 'undefined') {
  try {
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch (err) {
    console.warn('[BeautyMapView] Lỗi khởi tạo workerUrl:', err);
  }
}

interface BeautyMapViewProps {
  venues: BeautyVenue[];
  filteredVenueIds: Set<string>;
  selectedVenue: BeautyVenue | null;
  onSelectVenue: (venue: BeautyVenue) => void;
  userLocation?: { lat: number; lng: number } | null;
  flyToCenter?: [number, number] | null;
  initialCenter?: [number, number] | null;
}

export default function BeautyMapView({
  venues,
  filteredVenueIds,
  selectedVenue,
  onSelectVenue,
  userLocation,
  flyToCenter,
  initialCenter,
}: BeautyMapViewProps) {
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
      (userLocation ? [userLocation.lng, userLocation.lat] : [106.69, 10.78]);

    // Bản đồ OpenFreeMap Bright: Sáng, rõ ràng, thanh lịch cho ngành Làm Đẹp & Thẩm Mỹ
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: startCenter,
      zoom: userLocation ? (isMobile ? 14 : 14.5) : (isMobile ? 12.8 : 13.2),
      pitch: isMobile ? 15 : 30,
      bearing: 0,
      attributionControl: false,
      maxTileCacheSize: 50,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

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
      try {
        if (map.getLayer('background')) {
          map.setPaintProperty('background', 'background-color', '#fffaf7');
        }
      } catch (err) {
        console.warn('[BeautyMapView] Tone layer adjust error:', err);
      }

      // 3D buildings cho máy tính
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
                  'fill-extrusion-color': '#f2ece4',
                  'fill-extrusion-height': ['get', 'height'],
                  'fill-extrusion-base': ['get', 'min_height'],
                  'fill-extrusion-opacity': 0.65,
                },
              },
              labelLayerId
            );
          } catch {
            // Safe fallback
          }
        }
      }
    });

    mapRef.current = map;

    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Đồng bộ Markers khi danh sách địa điểm thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentVenueIds = new Set(venues.map((v) => v.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentVenueIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    venues.forEach((venue) => {
      const coords = venue.map_coordinates;
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return;
      }

      const lngLat: [number, number] = [Number(coords.lng), Number(coords.lat)];
      const isDimmed = !filteredVenueIds.has(venue.id);

      const existingMarker = markersRef.current[venue.id];
      if (existingMarker) {
        const el = existingMarker.getElement();
        const pinInner = el.querySelector('.beauty-pin-inner');
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
        const el = createBeautyPinElement(venue, isDimmed, () => {
          onSelectVenue(venue);
          map.flyTo({
            center: lngLat,
            zoom: 15.5,
            duration: 1200,
            essential: true,
          });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(lngLat)
          .addTo(map);

        markersRef.current[venue.id] = marker;
      }
    });
  }, [venues, filteredVenueIds, onSelectVenue]);

  // 3. Highlight marker khi selectedVenue thay đổi
  useEffect(() => {
    if (!selectedVenue) return;
    const marker = markersRef.current[selectedVenue.id];
    if (marker) {
      const coords = selectedVenue.map_coordinates;
      if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && mapRef.current) {
        mapRef.current.flyTo({
          center: [Number(coords.lng), Number(coords.lat)],
          zoom: 15.5,
          duration: 1000,
        });
      }
    }
  }, [selectedVenue]);

  // 4. FlyTo trung tâm khi chọn quận huyện hoặc định vị
  useEffect(() => {
    if (!flyToCenter || !mapRef.current) return;
    mapRef.current.flyTo({
      center: flyToCenter,
      zoom: 14,
      duration: 1000,
    });
  }, [flyToCenter]);

  // 5. Marker vị trí người dùng
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-400 opacity-75"></span>
            <div class="relative w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        `;
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
