// Các đường dẫn riêng tư của chủ tiệm cần loại trừ khỏi sitemap và chặn bot
const TENANT_ADMIN_PATHS = [
  '/*/dashboard',
  '/*/dashboard/*',
  '/*/customers',
  '/*/customers/*',
  '/*/leads',
  '/*/leads/*',
  '/*/deals',
  '/*/deals/*',
  '/*/profile',
  '/*/profile/*',
  '/*/settings',
  '/*/settings/*',
  '/*/upgrade',
  '/*/upgrade/*',
];

const GLOBAL_EXCLUDE_PATHS = [
  '/admin',
  '/admin/*',
  '/login',
  '/auth',
  '/auth/*',
  '/api',
  '/api/*',
  '/dashboard',
  '/dashboard/*',
  ...TENANT_ADMIN_PATHS,
  '/icon.png',
];

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://1beauty.asia',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,

  // Loại bỏ các trang admin, auth, api, và dashboard quản trị của chủ tiệm
  exclude: GLOBAL_EXCLUDE_PATHS,

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: GLOBAL_EXCLUDE_PATHS.filter((p) => p !== '/icon.png'),
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://1beauty.asia'}/sitemap.xml`,
    ],
  },

  // Thêm priority cao cho các trang thực tế
  transform: async (config, path) => {
    // Trang chủ — priority cao nhất
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang cổng ưu đãi & Bản đồ Phố Tiệc Tất Niên (Core B2C)
    if (path === '/uu-dai' || path.startsWith('/uu-dai/') || path === '/tat-nien' || path.startsWith('/tat-nien/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.95,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang danh mục & Địa điểm
    if (path === '/danh-muc' || path.startsWith('/danh-muc/') || path === '/dia-diem' || path.startsWith('/dia-diem/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.85,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang đặt tiệc chi tiết của quán (/[slug]/tiec)
    if (/^\/[^/]+\/tiec$/.test(path)) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.85,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang blog
    if (path === '/blog' || path.startsWith('/blog/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang Bảng giá & Dành cho doanh nghiệp
    if (path === '/bang-gia' || path.startsWith('/bang-gia/') || path === '/danh-cho-doanh-nghiep' || path.startsWith('/danh-cho-doanh-nghiep/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Danh sách các trang tĩnh 1 cấp để không nhận nhầm là slug doanh nghiệp
    const STATIC_SINGLE_SEGMENTS = new Set([
      '/gioi-thieu',
      '/gioi-thieu-booking',
      '/lien-he',
      '/lien-he-booking',
      '/home-beauty',
      '/home-booking',
      '/claim',
    ]);

    // Trang Doanh nghiệp / Tiệm cụ thể (/[slug])
    // Định dạng: /slug-cua-tiem (chỉ 1 cấp /slug và không phải các trang tĩnh đã biết)
    const isSingleSlug = /^\/[a-zA-Z0-9_-]+$/.test(path);
    if (isSingleSlug && !STATIC_SINGLE_SEGMENTS.has(path)) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Các trang còn lại
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
