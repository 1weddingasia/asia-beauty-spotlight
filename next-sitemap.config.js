/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://1beauty.asia',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,

  // Loại bỏ các trang admin, auth, api, dashboard
  exclude: [
    '/admin',
    '/admin/*',
    '/login',
    '/auth/*',
    '/api/*',
    '/dashboard',
    '/dashboard/*',
    '/icon.png',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/api', '/auth', '/dashboard'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://1beauty.asia'}/sitemap.xml`,
    ],
  },

  // Thêm priority cao hơn cho các trang quan trọng
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

    // Trang doanh nghiệp cụ thể
    if (path.startsWith('/doanh-nghiep/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang danh mục
    if (path.startsWith('/danh-muc/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Trang blog
    if (path.startsWith('/blog')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.7,
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
