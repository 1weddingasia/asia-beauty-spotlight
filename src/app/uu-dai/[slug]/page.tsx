import { notFound } from "next/navigation";
import { createStaticClient } from "@/utils/supabase/server";
import PromoClient from "./PromoClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: business } = await supabase.from('businesses').select('name').eq('slug', slug).single();

  if (!business) return { title: "Không tìm thấy - 1Beauty.Asia" };

  return {
    title: `Nhận Ưu Đãi Độc Quyền - ${business.name} | 1Beauty.Asia`,
    description: `Đăng ký nhận ngay mã giảm giá độc quyền tại ${business.name}. Số lượng có hạn!`,
  };
}

export default async function PromoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, address, page_content')
    .eq('slug', slug)
    .single();

  if (!business) {
    notFound();
  }

  // Lấy ảnh bìa hoặc avatar làm background
  const bannerImg = business.page_content?.banners?.[0] || business.page_content?.gallery?.[0] || "/images/fallback/spa_1.jpg";
  const avatar = business.page_content?.logo_url || "https://placehold.co/100x100/gold/white?text=SPA";

  return (
    <PromoClient business={business} bannerImg={bannerImg} avatar={avatar} />
  );
}
