import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { notFound } from "next/navigation";
import Image from "next/image";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: blog } = await supabase.from("blogs").select("title, excerpt").eq("slug", slug).single();
  
  if (!blog) return { title: "Không tìm thấy bài viết" };
  
  return {
    title: `${blog.title} | 1Beauty.Asia Blog`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!blog) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow pt-16 pb-16">
        <section className="relative border-b border-border mb-12">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${blog.cover_image || 'https://images.pexels.com/photos/398532/pexels-photo-398532.jpeg?auto=compress&cs=tinysrgb&w=1920'}")` }}
          >
            <div className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-6 text-white drop-shadow-md">
              {blog.title}
            </h1>
            <div className="text-gray-200 drop-shadow-md">
              {new Date(blog.published_at || blog.created_at).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </div>
          </div>
        </section>

        <article className="container mx-auto px-4 md:px-6 max-w-4xl">

          {blog.cover_image && (
            <div className="relative aspect-video w-full mb-12 rounded-2xl overflow-hidden bg-muted">
              <Image
                src={blog.cover_image}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none prose-img:rounded-xl prose-a:text-gold hover:prose-a:text-gold/80"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
