"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { use } from "react";

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    status: "draft",
    excerpt: "",
    content: "",
    cover_image: "",
    category_id: "",
  });
  
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch data
  useState(() => {
    supabase.from("blog_categories").select("*").then(({ data, error }) => {
      if (!error && data) setCategories(data);
    });

    if (!isNew) {
      supabase.from("blogs").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setFormData({
          title: data.title || "",
          slug: data.slug || "",
          status: data.status || "draft",
          excerpt: data.excerpt || "",
          content: data.content || "",
          cover_image: data.cover_image || "",
          category_id: data.category_id || "",
        });
      });
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (payload.category_id === "") {
        payload.category_id = null;
      }

      if (formData.status === 'published' && isNew) {
        payload.published_at = new Date().toISOString();
      }

      let error;
      if (!isNew) {
        const res = await supabase.from("blogs").update(payload).eq("id", id);
        error = res.error;
      } else {
        const res = await supabase.from("blogs").insert(payload);
        error = res.error;
      }

      if (error) throw error;
      toast.success("Đã lưu bài viết thành công");
      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/blogs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            {isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90">
          <Save className="mr-2 size-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
              placeholder="Nhập tiêu đề bài viết..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Đường dẫn (Slug)</Label>
              <Input 
                value={formData.slug} 
                onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} 
                placeholder="url-bai-viet"
              />
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(v) => setFormData(p => ({ ...p, category_id: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Không phân loại --</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Đã đăng (Published)</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Link Ảnh Bìa (Cover Image URL)</Label>
            <Input 
              value={formData.cover_image} 
              onChange={(e) => setFormData(p => ({ ...p, cover_image: e.target.value }))} 
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Đoạn trích (Mô tả SEO)</Label>
            <Textarea 
              value={formData.excerpt} 
              onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))} 
              placeholder="Tóm tắt ngắn gọn..."
              className="h-20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Nội dung (HTML Rich Text)</Label>
              <span className="text-xs text-muted-foreground">Bạn có thể copy paste HTML từ Google Docs vào đây.</span>
            </div>
            <Textarea 
              value={formData.content} 
              onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
              className="h-96 font-mono text-sm"
              placeholder="<p>Bắt đầu viết...</p>"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
