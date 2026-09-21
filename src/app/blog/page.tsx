import { createClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import Link from "next/link";
import Image from "next/image";

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, cover_image, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch blogs:", error);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow pt-16 pb-16">
        <section className="relative border-b border-border mb-12">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1920&q=80")' }}
          >
            <div className="absolute inset-0 bg-ink/70"></div>
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24 text-center">
            <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">Tin tức</p>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-md font-display tracking-tight">Góc Chia Sẻ</h1>
            <p className="mt-6 text-lg text-gray-200 drop-shadow-md max-w-2xl mx-auto">
              Những kiến thức làm đẹp, kinh nghiệm chăm sóc da và xu hướng thẩm mỹ mới nhất từ các chuyên gia.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6">

          {!blogs || blogs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border">
              <h3 className="text-xl font-medium">Nội dung đang được cập nhật</h3>
              <p className="text-muted-foreground mt-2">Vui lòng quay lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden border transition-all hover:shadow-md hover:border-gold/30">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {blog.cover_image ? (
                      <Image
                        src={blog.cover_image}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-champagne text-gold">
                        1Beauty.Asia
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
                      {blog.excerpt || "Đọc thêm..."}
                    </p>
                    <div className="text-xs text-muted-foreground pt-4 border-t">
                      {new Date(blog.published_at || blog.created_at).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
