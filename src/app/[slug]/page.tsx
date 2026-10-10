import { notFound } from "next/navigation";
import { createStaticClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { getSiteConfig } from "@/config/site-config";
import PromoClient from "./PromoClient";

export const revalidate = 60; // Cache trang 60 giây để tăng tốc độ tải cực nhanh

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = await headers();
  const host = h.get('host') || '';
  const siteConfig = getSiteConfig(host);
  const supabase = createStaticClient();
  try {
    const { data: business } = await supabase.from('businesses').select('name, page_content').eq('slug', slug).single();
    if (!business) return { title: `Không tìm thấy - ${siteConfig.brand}` };

    const firstGalleryItem = business.page_content?.gallery?.[0];
    const galleryUrl = typeof firstGalleryItem === 'string' ? firstGalleryItem : firstGalleryItem?.url;
    const ogImage = business.page_content?.banners?.[0] || galleryUrl || `https://${siteConfig.domain}/og-image.jpg`;

    return {
      title: `Nhận Ưu Đãi Đặc Biệt - ${business.name} | ${siteConfig.brand}`,
      description: `Đăng ký nhận ngay mã giảm giá đặc biệt tại ${business.name}. Số lượng có hạn!`,
      openGraph: {
        images: [ogImage],
      },
      alternates: {
        canonical: `https://1booking.asia/${slug}`
      }
    };
  } catch (error) {
    return { title: `Không tìm thấy - ${siteConfig.brand}` };
  }
}

export default async function PromoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  
  let business;
  try {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, slug, address, phone, description, status, page_content, short_description, email, website, socials, zalo, plan_tier, is_featured')
      .eq('slug', slug)
      .single();
    business = data;
  } catch (error) {
    business = null;
  }

  if (!business) {
    notFound();
  }

  // Hiển thị trang bảo trì khi tiệm bị tạm ngưng (hết hạn dùng thử / chưa gia hạn)
  if (business.status === 'suspended') {
    const h = await headers();
    const siteConfig = getSiteConfig(h.get('host') || '');
    const hotline = business.page_content?.phone || business.phone || '';
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
          <div className="text-6xl mb-6">🛠️</div>
          <h1 className="text-2xl font-black text-slate-800 mb-3">{business.name}</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Chương trình ưu đãi của tiệm đang tạm thời bảo trì.<br />
            Vui lòng liên hệ trực tiếp với tiệm để được hỗ trợ.
          </p>
          {hotline && (
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform text-lg"
            >
              📞 {hotline}
            </a>
          )}
          <p className="mt-8 text-xs text-slate-400">Powered by {siteConfig.brand}</p>
        </div>
      </div>
    );
  }

  // Lấy ảnh bìa hoặc avatar làm background an toàn
  const firstGalleryItem = business.page_content?.gallery?.[0];
  const galleryUrl = typeof firstGalleryItem === 'string' ? firstGalleryItem : firstGalleryItem?.url;
  const bannerImg = business.page_content?.banners?.[0] || galleryUrl || null;
  const fallbackLetter = (business.name || "A").charAt(0).toUpperCase();
  const avatar = business.page_content?.logo_url || `https://placehold.co/100x100/gold/white?text=${encodeURIComponent(fallbackLetter)}`;

  return (
    <PromoClient business={business} bannerImg={bannerImg} avatar={avatar} />
  );
}
