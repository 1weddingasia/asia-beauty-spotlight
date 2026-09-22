"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function BlogCategoriesClient() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  const fetchCategories = async () => {
    setFetching(true);
    const { data, error } = await supabase.from('blog_categories').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) {
      if (error.message.includes("relation \"public.blog_categories\" does not exist")) {
        toast.error("Vui lòng chạy file SQL để tạo bảng blog_categories trong Supabase!");
      } else {
        toast.error("Lỗi tải danh mục: " + error.message);
      }
    } else {
      setCategories(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('blog_categories').insert({
        name,
        slug
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Tạo danh mục thành công!");
        setIsModalOpen(false);
        setName("");
        setSlug("");
        fetchCategories();
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Xóa danh mục "${catName}"?`)) return;
    
    const { error } = await supabase.from('blog_categories').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    }
  };

  // Auto-generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <div className="space-y-6 relative max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/blogs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Danh mục Bài viết</h2>
            <p className="text-muted-foreground mt-2">Phân loại nội dung Blog.</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Danh Mục</TableHead>
              <TableHead>Đường dẫn (Slug)</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Đang tải...</TableCell>
              </TableRow>
            ) : !categories || categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Chưa có danh mục nào.</TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Thêm Danh Mục Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên danh mục</Label>
                <Input type="text" required value={name} onChange={e => handleNameChange(e.target.value)} placeholder="vd: Kiến thức làm đẹp" />
              </div>
              <div className="space-y-2">
                <Label>Slug (Tạo tự động)</Label>
                <Input type="text" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="kien-thuc-lam-dep" />
              </div>

              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu danh mục"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
