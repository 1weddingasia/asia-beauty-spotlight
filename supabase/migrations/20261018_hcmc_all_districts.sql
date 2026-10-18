-- ========================================================
-- Migration: Add all 22 HCMC districts to directory_locations
-- Date: 2026-10-18
-- ========================================================

-- 1. Thêm các cột tọa độ và keywords phục vụ tìm kiếm & hiển thị bản đồ
ALTER TABLE public.directory_locations
  ADD COLUMN IF NOT EXISTS map_coordinates JSONB,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS parent_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_directory_locations_parent_slug ON public.directory_locations(parent_slug);

-- 1.0. Xóa các bản ghi trùng lặp slug (nếu có) trước khi tạo UNIQUE constraint
DELETE FROM public.directory_locations a
USING public.directory_locations b
WHERE a.ctid > b.ctid AND a.slug = b.slug;

-- 1.1. Đảm bảo ràng buộc UNIQUE trên slug để hỗ trợ ON CONFLICT
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'directory_locations_slug_key'
  ) THEN 
    ALTER TABLE public.directory_locations ADD CONSTRAINT directory_locations_slug_key UNIQUE (slug); 
  END IF; 
END $$;

-- 1.2. Đảm bảo bản ghi gốc 'toan-quoc' tồn tại
INSERT INTO public.directory_locations (name, slug, description, sort_order, parent_slug)
VALUES ('Toàn Quốc', 'toan-quoc', 'Toàn quốc', 0, NULL)
ON CONFLICT (slug) DO NOTHING;

-- 2. Cập nhật thông tin TP. Hồ Chí Minh gốc
INSERT INTO public.directory_locations (name, slug, description, hero_image, sort_order, map_coordinates, keywords, parent_slug)
VALUES (
  'Hồ Chí Minh',
  'ho-chi-minh',
  'Thành phố Hồ Chí Minh',
  '/images/locations/ho-chi-minh-saigon.jpg',
  1,
  '[106.6700, 10.7700]'::jsonb,
  ARRAY['hồ chí minh', 'tphcm', 'tp.hcm', 'sài gòn', 'saigon', 'hcm'],
  'toan-quoc'
)
ON CONFLICT (slug) DO UPDATE SET
  map_coordinates = EXCLUDED.map_coordinates,
  keywords = EXCLUDED.keywords,
  parent_slug = EXCLUDED.parent_slug,
  sort_order = EXCLUDED.sort_order;

-- 3. Nạp đầy đủ 22 Quận / Huyện / Thành phố của TP. Hồ Chí Minh
INSERT INTO public.directory_locations (name, slug, description, hero_image, sort_order, map_coordinates, keywords, parent_slug)
VALUES
  -- 16 Quận trung tâm & nội thành
  (
    'Quận 1',
    'quan-1',
    'Quận 1, TP. Hồ Chí Minh - Trung tâm ẩm thực & tiệc cao cấp',
    '/images/locations/ho-chi-minh-saigon.jpg',
    2,
    '[106.6983, 10.7756]'::jsonb,
    ARRAY['quận 1', 'q.1', 'q1', 'quận 01', 'bến nghé', 'bến thành', 'đa kao', 'nguyễn huệ', 'lê lợi', 'bùi viện'],
    'ho-chi-minh'
  ),
  (
    'Quận 3',
    'quan-3',
    'Quận 3, TP. Hồ Chí Minh - Biệt thự cổ & sảnh tiệc sân vườn sang trọng',
    '/images/locations/ho-chi-minh-saigon.jpg',
    3,
    '[106.6844, 10.7845]'::jsonb,
    ARRAY['quận 3', 'q.3', 'q3', 'quận 03', 'võ thị sáu', 'phạm ngọc thạch', 'bà huyện thanh quan', 'tú xương', 'nguyễn đình chiểu'],
    'ho-chi-minh'
  ),
  (
    'Quận 4',
    'quan-4',
    'Quận 4, TP. Hồ Chí Minh - Phố ẩm thực bờ sông bến Vân Đồn',
    '/images/locations/ho-chi-minh-saigon.jpg',
    4,
    '[106.7042, 10.7617]'::jsonb,
    ARRAY['quận 4', 'q.4', 'q4', 'quận 04', 'hoàng diệu', 'bến vân đồn', 'khánh hội', 'đoàn văn bơ'],
    'ho-chi-minh'
  ),
  (
    'Quận 5',
    'quan-5',
    'Quận 5, TP. Hồ Chí Minh - Thủ phủ ẩm thực Trung Hoa & tiệc người Hoa',
    '/images/locations/ho-chi-minh-saigon.jpg',
    5,
    '[106.6669, 10.7554]'::jsonb,
    ARRAY['quận 5', 'q.5', 'q5', 'quận 05', 'chợ lớn', 'an đông', 'hải thượng lãn ông', 'trần hưng đạo', 'nguyễn trãi'],
    'ho-chi-minh'
  ),
  (
    'Quận 6',
    'quan-6',
    'Quận 6, TP. Hồ Chí Minh - Chợ Bình Tây & ẩm thực Chợ Lớn mở rộng',
    '/images/locations/ho-chi-minh-saigon.jpg',
    6,
    '[106.6352, 10.7472]'::jsonb,
    ARRAY['quận 6', 'q.6', 'q6', 'quận 06', 'bình tây', 'hậu giang', 'minh phụng', 'kinh dương vương'],
    'ho-chi-minh'
  ),
  (
    'Quận 7',
    'quan-7',
    'Quận 7, TP. Hồ Chí Minh - Đô thị Phú Mỹ Hưng & tiệc quốc tế cao cấp',
    '/images/locations/ho-chi-minh-saigon.jpg',
    7,
    '[106.7218, 10.7340]'::jsonb,
    ARRAY['quận 7', 'q.7', 'q7', 'quận 07', 'phú mỹ hưng', 'nguyễn thị thập', 'huỳnh tấn phát', 'nguyễn văn linh', 'tân phong'],
    'ho-chi-minh'
  ),
  (
    'Quận 8',
    'quan-8',
    'Quận 8, TP. Hồ Chí Minh - Dọc bờ kênh Tàu Hủ & khu ẩm thực cầu Chữ Y',
    '/images/locations/ho-chi-minh-saigon.jpg',
    8,
    '[106.6660, 10.7240]'::jsonb,
    ARRAY['quận 8', 'q.8', 'q8', 'quận 08', 'phạm thế hiển', 'dương bá trạc', 'tạ quang bửu', 'dạ nam'],
    'ho-chi-minh'
  ),
  (
    'Quận 10',
    'quan-10',
    'Quận 10, TP. Hồ Chí Minh - Sư Vạn Hạnh & Thành Thái phố tiệc sầm uất',
    '/images/locations/ho-chi-minh-saigon.jpg',
    9,
    '[106.6668, 10.7715]'::jsonb,
    ARRAY['quận 10', 'q.10', 'q10', 'thành thái', 'sư vạn hạnh', 'ba tháng hai', '3/2', 'lý thường kiệt', 'tô hiến thành'],
    'ho-chi-minh'
  ),
  (
    'Quận 11',
    'quan-11',
    'Quận 11, TP. Hồ Chí Minh - Công viên Đầm Sen & ẩm thực đa dạng',
    '/images/locations/ho-chi-minh-saigon.jpg',
    10,
    '[106.6517, 10.7654]'::jsonb,
    ARRAY['quận 11', 'q.11', 'q11', 'đầm sen', 'lãnh binh thăng', 'lê đại hành', 'ông ích khiêm'],
    'ho-chi-minh'
  ),
  (
    'Quận 12',
    'quan-12',
    'Quận 12, TP. Hồ Chí Minh - Không gian tiệc rộng thoáng & nhà hàng sinh thái',
    '/images/locations/ho-chi-minh-saigon.jpg',
    11,
    '[106.6543, 10.8672]'::jsonb,
    ARRAY['quận 12', 'q.12', 'q12', 'tô ký', 'quốc lộ 1a', 'lê văn khương', 'an phú đông', 'hà huy giáp'],
    'ho-chi-minh'
  ),
  (
    'Bình Thạnh',
    'binh-thanh',
    'Quận Bình Thạnh, TP. Hồ Chí Minh - Bờ sông Thanh Đa & phố tiệc Phan Xích Long',
    '/images/locations/ho-chi-minh-saigon.jpg',
    12,
    '[106.7093, 10.8033]'::jsonb,
    ARRAY['bình thạnh', 'binh thanh', 'thanh đa', 'phạm văn đồng', 'hàng xanh', 'bạch đằng', 'điện biên phủ', 'nguyễn xí'],
    'ho-chi-minh'
  ),
  (
    'Gò Vấp',
    'go-vap',
    'Quận Gò Vấp, TP. Hồ Chí Minh - CityLand & trục Phan Văn Trị đông đúc',
    '/images/locations/ho-chi-minh-saigon.jpg',
    13,
    '[106.6653, 10.8388]'::jsonb,
    ARRAY['gò vấp', 'go vap', 'quang trung', 'phan văn trị', 'nguyễn oanh', 'cityland', 'lê đức thọ', 'nguyễn văn lượng'],
    'ho-chi-minh'
  ),
  (
    'Phú Nhuận',
    'phu-nhuan',
    'Quận Phú Nhuận, TP. Hồ Chí Minh - Phố ẩm thực Phan Xích Long cao cấp',
    '/images/locations/ho-chi-minh-saigon.jpg',
    14,
    '[106.6806, 10.7992]'::jsonb,
    ARRAY['phú nhuận', 'phu nhuan', 'phan xích long', 'nguyễn văn trỗi', 'hoàng văn thụ', 'phan đình phùng', 'hoa sứ', 'hoa lan'],
    'ho-chi-minh'
  ),
  (
    'Tân Bình',
    'tan-binh',
    'Quận Tân Bình, TP. Hồ Chí Minh - Sảnh tiệc sân bay & khu ẩm thực Bàu Cát',
    '/images/locations/ho-chi-minh-saigon.jpg',
    15,
    '[106.6558, 10.8015]'::jsonb,
    ARRAY['tân bình', 'tan binh', 'sân bay', 'tân sơn nhất', 'nguyễn thái bình', 'cộng hòa', 'bàu cát', 'trường chinh', 'phổ quang'],
    'ho-chi-minh'
  ),
  (
    'Tân Phú',
    'tan-phu',
    'Quận Tân Phú, TP. Hồ Chí Minh - Lũy Bán Bích & đại tiệc gia đình sầm uất',
    '/images/locations/ho-chi-minh-saigon.jpg',
    16,
    '[106.6291, 10.7901]'::jsonb,
    ARRAY['tân phú', 'tan phu', 'lũy bán bích', 'tân sơn nhì', 'hòa bình', 'thoại ngọc hầu', 'aeon mall tân phú'],
    'ho-chi-minh'
  ),
  (
    'Bình Tân',
    'binh-tan',
    'Quận Bình Tân, TP. Hồ Chí Minh - Phố ẩm thực Tên Lửa & Aeon Mall',
    '/images/locations/ho-chi-minh-saigon.jpg',
    17,
    '[106.6087, 10.7653]'::jsonb,
    ARRAY['bình tân', 'binh tan', 'tên lửa', 'vành đai trong', 'kinh dương vương', 'an lạc', 'aeon mall bình tân'],
    'ho-chi-minh'
  ),

  -- 1 Thành phố trực thuộc
  (
    'Thành phố Thủ Đức',
    'thanh-pho-thu-duc',
    'TP. Thủ Đức, TP. Hồ Chí Minh - Biệt thự ven sông Thảo Điền & khu đô thị mới',
    '/images/locations/ho-chi-minh-saigon.jpg',
    18,
    '[106.7537, 10.8494]'::jsonb,
    ARRAY['thủ đức', 'thu duc', 'thành phố thủ đức', 'quận 2', 'q.2', 'q2', 'quận 9', 'q.9', 'q9', 'thảo điền', 'an phú', 'xa lộ hà nội'],
    'ho-chi-minh'
  ),

  -- 5 Huyện ngoại thành
  (
    'Huyện Bình Chánh',
    'binh-chanh',
    'Huyện Bình Chánh, TP. Hồ Chí Minh - Không gian tiệc sinh thái & sân vườn lớn',
    '/images/locations/ho-chi-minh-saigon.jpg',
    19,
    '[106.5898, 10.6875]'::jsonb,
    ARRAY['bình chánh', 'binh chanh', 'quốc lộ 1a', 'nguyễn văn linh', 'quốc lộ 50', 'tân túc'],
    'ho-chi-minh'
  ),
  (
    'Huyện Hóc Môn',
    'hoc-mon',
    'Huyện Hóc Môn, TP. Hồ Chí Minh - Không gian ẩm thực sân vườn xanh mát',
    '/images/locations/ho-chi-minh-saigon.jpg',
    20,
    '[106.5925, 10.8844]'::jsonb,
    ARRAY['hóc môn', 'hoc mon', 'bà điểm', 'ngã tư an sương', 'quang trung kéo dài'],
    'ho-chi-minh'
  ),
  (
    'Huyện Củ Chi',
    'cu-chi',
    'Huyện Củ Chi, TP. Hồ Chí Minh - Ẩm thực đồng quê & bò tơ Củ Chi trứ danh',
    '/images/locations/ho-chi-minh-saigon.jpg',
    21,
    '[106.4950, 11.0067]'::jsonb,
    ARRAY['củ chi', 'cu chi', 'bến dược', 'tỉnh lộ 8', 'bò tơ củ chi'],
    'ho-chi-minh'
  ),
  (
    'Huyện Nhà Bè',
    'nha-be',
    'Huyện Nhà Bè, TP. Hồ Chí Minh - Nhà hàng hải sản ven sông thoáng đãng',
    '/images/locations/ho-chi-minh-saigon.jpg',
    22,
    '[106.7297, 10.6953]'::jsonb,
    ARRAY['nhà bè', 'nha be', 'huỳnh tấn phát', 'lê văn lương', 'phước kiển'],
    'ho-chi-minh'
  ),
  (
    'Huyện Cần Giờ',
    'can-gio',
    'Huyện Cần Giờ, TP. Hồ Chí Minh - Hải sản tươi sống & sinh thái biển',
    '/images/locations/ho-chi-minh-saigon.jpg',
    23,
    '[106.8639, 10.4114]'::jsonb,
    ARRAY['cần giờ', 'can gio', 'cần thạnh', 'long hòa', 'du lịch cần giờ'],
    'ho-chi-minh'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  sort_order = EXCLUDED.sort_order,
  map_coordinates = EXCLUDED.map_coordinates,
  keywords = EXCLUDED.keywords,
  parent_slug = EXCLUDED.parent_slug;



