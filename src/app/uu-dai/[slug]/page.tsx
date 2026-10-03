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
    .select('id, name, slug, address, status, page_content')
    .eq('slug', slug)
    .single();

  if (!business) {
    notFound();
  }

  // Hiển thị trang bảo trì khi tiệm bị tạm ngưng (hết hạn dùng thử / chưa gia hạn)
  if (business.status === 'suspended') {
    const hotline = business.page_content?.phone || '';
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
          <p className="mt-8 text-xs text-slate-400">Powered by 1Beauty.Asia</p>
        </div>
      </div>
    );
  }

  // Lấy ảnh bìa hoặc avatar làm background
  const bannerImg = business.page_content?.banners?.[0] || business.page_content?.gallery?.[0] || "/images/fallback/spa_1.jpg";
  const avatar = business.page_content?.logo_url || "https://placehold.co/100x100/gold/white?text=SPA";

  return (
    <PromoClient business={business} bannerImg={bannerImg} avatar={avatar} />
  );
}
