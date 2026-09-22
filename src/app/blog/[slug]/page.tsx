import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: blog, error } = await supabase.from("blogs").select("title, excerpt").eq("slug", slug).single();
  
  if (!blog) return { title: "Không tìm thấy bài viết" };
  
  return {
    title: `${blog.title} | 1Beauty.Asia Blog`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .limit(500).eq("slug", slug)
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

          <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center md:py-36 lg:py-40 flex flex-col justify-center min-h-[40vh]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 mb-8 self-center"
            >
              <ArrowLeft className="size-3" /> Trở lại Blog
            </Link>
            
            <div className="mb-4 flex items-center justify-center gap-3 text-sm text-gold">
              <span className="uppercase tracking-widest">{blog.category}</span>
              <span className="size-1 rounded-full bg-gold/50"></span>
              <time className="text-gray-300">
                {new Date(blog.published_at || blog.created_at).toLocaleDateString('vi-VN')}
              </time>
            </div>
            
            <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {blog.title}
            </h1>
            
            <p className="mt-6 text-lg text-gray-200">
              {blog.excerpt}
            </p>
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
