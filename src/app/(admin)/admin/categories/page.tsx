"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function DirectoryCategoriesClient() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCategories = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("directory_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(500);
    if (error) {
      toast.error("Lỗi tải danh mục: " + error.message);
    } else {
      setCategories(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName(""); setSlug(""); setDescription(""); setIcon(""); setHeroImage(""); setSortOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setHeroImage(cat.hero_image || "");
    setSortOrder(cat.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name,
      slug,
      description: description || null,
      icon: icon || null,
      hero_image: heroImage || null,
      sort_order: sortOrder,
    };
    try {
      let error;
      if (editingId) {
        const res = await supabase.from("directory_categories").update(payload).eq("id", editingId);
        error = res.error;
      } else {
        const res = await supabase.from("directory_categories").insert(payload);
        error = res.error;
      }
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(editingId ? "Cập nhật thành công!" : "Tạo danh mục thành công!");
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Xóa danh mục "${catName}"? Các liên kết doanh nghiệp sẽ bị xóa theo.`)) return;
    const { error } = await supabase.from("directory_categories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d").replace(/Đ/g, "D")
          .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      );
    }
  };

  return (
    <div className="space-y-6 relative max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/businesses"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Danh Mục Ngành</h2>
            <p className="text-muted-foreground mt-2">
              Quản lý danh mục — các trang công khai sẽ tự động tạo tại <code>/danh-muc/[slug]</code>
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Tên Danh Mục</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Đang tải...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Chưa có danh mục nào.</TableCell></TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-2xl">{c.icon || "🏪"}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{c.slug}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{c.description || "—"}</TableCell>
                  <TableCell className="text-center">{c.sort_order || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Xem trang công khai">
                        <Link href={`/danh-muc/${c.slug}`} target="_blank">
                          <ExternalLink className="size-4 text-gold" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(c)} className="text-blue-500 hover:bg-blue-50">
                        Sửa
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted">
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">{editingId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên danh mục *</Label>
                  <Input required value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="vd: Spa & Làm Đẹp" />
                </div>
                <div className="space-y-2">
                  <Label>Icon (emoji)</Label>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="vd: 🧖 💅 🏥" className="text-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="spa-lam-dep" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">URL trang: <code>/danh-muc/{slug || "..."}</code></p>
              </div>
              <div className="space-y-2">
                <Label>Mô tả ngắn</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả về ngành này..." />
              </div>
              <div className="space-y-2">
                <Label>Ảnh Hero (URL)</Label>
                <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." type="url" />
                <p className="text-xs text-muted-foreground">Ảnh nền hero section trên trang /danh-muc/[slug]</p>
                {heroImage && (
                  <img src={heroImage} alt="preview" className="h-20 w-full object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Thứ tự hiển thị</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} />
                <p className="text-xs text-muted-foreground">Số nhỏ hơn = hiển thị trước</p>
              </div>
              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang lưu..." : (editingId ? "Lưu thay đổi" : "Tạo danh mục")}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
