import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/site/Layout";
import { SiteFooter } from "@/components/site/Layout";
import { notFound } from "next/navigation";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: blog } = await supabase.from("blogs").select("title, excerpt").eq("slug", slug).single();
  
  if (!blog) return { title: "Không tìm thấy bài viết" };
  
  return {
    title: `${blog.title} | 1Beauty.Asia Blog`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow pt-24 pb-16">
        <article className="container mx-auto px-4 md:px-6 max-w-4xl">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
              {blog.title}
            </h1>
            <div className="text-muted-foreground">
              {new Date(blog.published_at || blog.created_at).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </div>
          </header>

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
