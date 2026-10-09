import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { BackToTop } from '@/components/site/BackToTop';
import { Toaster } from '@/components/ui/sonner';

import { headers } from 'next/headers';
import { getSiteConfig } from '@/config/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get('host') || '';
  const siteConfig = getSiteConfig(host);
  
  const SITE_URL = `https://${siteConfig.domain}`;
  const SITE_NAME = siteConfig.brand;
  const SITE_DESCRIPTION = siteConfig.description;
  const SITE_TITLE = `${SITE_NAME} — ${siteConfig.metaTitleSuffix}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: siteConfig.domain === '1booking.asia' 
      ? ['đặt lịch', 'booking online', 'dịch vụ', 'spa', 'nhà hàng', 'phòng khám', 'booking việt nam']
      : ['danh bạ làm đẹp', 'spa Việt Nam', 'thẩm mỹ viện', 'salon tóc', 'nail', 'học viện làm đẹp', 'beauty directory asia', '1beauty', 'làm đẹp việt nam'],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [`${SITE_URL}/og-image.jpg`],
    },
  };
}

import { GlobalPromoFAB } from '@/components/admin/GlobalPromoFAB';
import { DigitalBusinessCard } from '@/components/DigitalBusinessCard';

import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans-next',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-display-next',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${beVietnamPro.variable} ${playfairDisplay.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
        <Analytics />
        <BackToTop />
        <GlobalPromoFAB />
        <DigitalBusinessCard />
      </body>
    </html>
  );
}
