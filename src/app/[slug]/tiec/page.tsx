import { notFound, redirect } from "next/navigation";
import { createStaticClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { getSiteConfig } from "@/config/site-config";
import PartyVenueClient from "./PartyVenueClient";
import { BusinessPartyProfile } from "@/types/party";
import type { Metadata } from "next";

export const revalidate = 60; // Cache 60s để tốc độ siêu tốc

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const h = await headers();
  const host = h.get('host') || '';
  const siteConfig = getSiteConfig(host);
  const supabase = createStaticClient();

  try {
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, page_content, address')
      .eq('slug', slug)
      .single();

    if (!business) return { title: `Không tìm thấy - ${siteConfig.brand}` };

    const { data: partyProfile } = await supabase
      .from('business_party_profiles')
      .select('party_deal_highlight, min_guests, max_guests')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .maybeSingle();

    const firstGalleryItem = business.page_content?.gallery?.[0];
    const galleryUrl = typeof firstGalleryItem === 'string' ? firstGalleryItem : firstGalleryItem?.url;
    const ogImage = business.page_content?.banners?.[0] || galleryUrl || `https://${siteConfig.domain}/images/tat-nien-og.jpg`;

    const highlight = partyProfile?.party_deal_highlight
      ? ` | ${partyProfile.party_deal_highlight}`
      : ' | Sảnh Tiệc Sang Trọng, Đặt Bàn VIP';

    return {
      title: `Đặt Tiệc Tất Niên & Sự Kiện — ${business.name}${highlight} | ${siteConfig.brand}`,
      description: `Khám phá không gian tổ chức tiệc tất niên, liên hoan công ty tại ${business.name}. Sức chứa ${partyProfile?.min_guests || 20} - ${partyProfile?.max_guests || 200} khách, ưu đãi tặng bia & phòng VIP riêng.`,
      openGraph: {
        title: `Đặt Tiệc Tất Niên & Sự Kiện — ${business.name}`,
        description: `Xem sảnh tiệc, set menu đặc biệt và đặt giữ chỗ tại ${business.name}.`,
        images: [ogImage],
      },
      alternates: {
        canonical: `https://1booking.asia/${slug}/tiec`,
      },
    };
  } catch {
    return { title: `Đặt Tiệc Tất Niên - ${siteConfig.brand}` };
  }
}

export default async function PartyVenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();

  let business: any = null;
  try {
    const { data } = await supabase
      .from('businesses')
      .select(`
        id, name, slug, category_slug, address, phone, description, status, page_content,
        short_description, email, website, socials, zalo, plan_tier, is_featured,
        business_categories(directory_categories(id, name, slug, icon)),
        business_locations(directory_locations(id, name, slug))
      `)
      .eq('slug', slug)
      .single();

    if (data) {
      business = {
        ...data,
        categories_list: (data as any).business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
        locations_list: (data as any).business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
      };
    }
  } catch (error) {
    business = null;
  }

  if (!business) {
    notFound();
  }

  // Lấy hồ sơ tiệc tất niên
  let partyProfile: BusinessPartyProfile | null = null;
  try {
    const { data: pData } = await supabase
      .from('business_party_profiles')
      .select('*')
      .eq('business_id', business.id)
      .maybeSingle();

    partyProfile = (pData as BusinessPartyProfile | null) ?? null;
  } catch (err) {
    console.error('[PartyVenuePage] Lỗi lấy party profile:', err);
    partyProfile = null;
  }

  // Nếu quán chưa kích hoạt sảnh tiệc, chuyển hướng người dùng về trang ưu đãi chính của quán
  if (!partyProfile || !partyProfile.is_active) {
    redirect(`/${slug}`);
  }

  // Xác định banner và avatar
  const firstGalleryItem = business.page_content?.gallery?.[0];
  const galleryUrl = typeof firstGalleryItem === 'string' ? firstGalleryItem : firstGalleryItem?.url;
  const bannerImg = business.page_content?.banners?.[0] || galleryUrl || null;
  const fallbackLetter = (business.name || 'A').charAt(0).toUpperCase();
  const avatar = business.page_content?.logo_url || `https://placehold.co/100x100/gold/white?text=${encodeURIComponent(fallbackLetter)}`;

  return (
    <PartyVenueClient
      business={business}
      partyProfile={partyProfile}
      bannerImg={bannerImg}
      avatar={avatar}
    />
  );
}
