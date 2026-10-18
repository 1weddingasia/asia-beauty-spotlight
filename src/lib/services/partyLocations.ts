import { SupabaseClient } from '@supabase/supabase-js';
import { PartyDistrictItem } from '@/types/party';

interface DbDirectoryLocation {
  id: string;
  name: string;
  slug: string;
  keywords: string[] | null;
  map_coordinates: unknown;
  sort_order: number | null;
  parent_slug: string | null;
}

/**
 * 📍 Truy vấn toàn bộ danh sách quận/huyện TP.HCM từ bảng `directory_locations` thật trong database.
 * Đảm bảo 100% dữ liệu động chuẩn Production, không hardcode.
 * Hỗ trợ cả 2 định dạng tọa độ JSONB: mảng [lng, lat] hoặc object { lat, lng }.
 */
export async function getHcmcPartyDistricts(supabase: SupabaseClient): Promise<PartyDistrictItem[]> {
  const { data, error } = await supabase
    .from('directory_locations')
    .select('id, name, slug, keywords, map_coordinates, sort_order, parent_slug')
    .eq('parent_slug', 'ho-chi-minh')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('[getHcmcPartyDistricts] Lỗi truy vấn directory_locations từ database:', error);
    return [];
  }

  const rows = (data || []) as DbDirectoryLocation[];

  return rows.map((row): PartyDistrictItem => {
    let coords: [number, number] | null = null;
    const rawCoords = row.map_coordinates;

    if (
      Array.isArray(rawCoords) &&
      rawCoords.length === 2 &&
      typeof rawCoords[0] === 'number' &&
      typeof rawCoords[1] === 'number'
    ) {
      coords = [rawCoords[0], rawCoords[1]];
    } else if (
      rawCoords &&
      typeof rawCoords === 'object' &&
      'lng' in rawCoords &&
      'lat' in rawCoords &&
      typeof (rawCoords as Record<string, unknown>).lng === 'number' &&
      typeof (rawCoords as Record<string, unknown>).lat === 'number'
    ) {
      const obj = rawCoords as { lng: number; lat: number };
      coords = [obj.lng, obj.lat];
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      keywords: Array.isArray(row.keywords) ? row.keywords : [],
      map_coordinates: coords,
      sort_order: typeof row.sort_order === 'number' ? row.sort_order : 0,
      parent_slug: row.parent_slug,
    };
  });
}
