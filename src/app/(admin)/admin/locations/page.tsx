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

export default function DirectoryLocationsClient() {
  const [locations, setLocations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchLocations = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("directory_locations")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(500);
    if (error) {
      toast.error("Lỗi tải địa điểm: " + error.message);
    } else {
      setLocations(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName(""); setSlug(""); setDescription(""); setHeroImage(""); setSortOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: any) => {
    setEditingId(loc.id);
    setName(loc.name || "");
    setSlug(loc.slug || "");
    setDescription(loc.description || "");
    setHeroImage(loc.hero_image || "");
    setSortOrder(loc.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name,
      slug,
      description: description || null,
      hero_image: heroImage || null,
      sort_order: sortOrder,
    };
    try {
      let error;
      if (editingId) {
        const res = await supabase.from("directory_locations").update(payload).eq("id", editingId);
        error = res.error;
      } else {
        const res = await supabase.from("directory_locations").insert(payload);
        error = res.error;
      }
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(editingId ? "Cập nhật thành công!" : "Tạo địa điểm thành công!");
        setIsModalOpen(false);
        fetchLocations();
      }
    } catch {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, locName: string) => {
    if (!confirm(`Xóa địa điểm "${locName}"? Các liên kết doanh nghiệp sẽ bị xóa theo.`)) return;
    const { error } = await supabase.from("directory_locations").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa địa điểm!");
      fetchLocations();
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
            <h2 className="text-3xl font-bold tracking-tight">Địa Điểm Khu Vực</h2>
            <p className="text-muted-foreground mt-2">
              Quản lý địa điểm — trang công khai tại <code>/dia-diem/[slug]</code>
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Thêm địa điểm
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Địa Điểm</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Ảnh Hero</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Đang tải...</TableCell></TableRow>
            ) : locations.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Chưa có địa điểm nào.</TableCell></TableRow>
            ) : (
              locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">📍 {loc.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{loc.slug}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{loc.description || "—"}</TableCell>
                  <TableCell>
                    {loc.hero_image ? (
                      <img src={loc.hero_image} alt="" className="h-8 w-14 object-cover rounded border" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{loc.sort_order || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Xem trang công khai">
                        <Link href={`/dia-diem/${loc.slug}`} target="_blank">
                          <ExternalLink className="size-4 text-gold" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(loc)} className="text-blue-500 hover:bg-blue-50">
                        Sửa
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id, loc.name)} className="text-red-500 hover:bg-red-50">
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
            <h3 className="text-xl font-bold mb-6">{editingId ? "Sửa Địa Điểm" : "Thêm Địa Điểm Mới"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên địa điểm *</Label>
                <Input required value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="vd: TP. Hồ Chí Minh" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tp-ho-chi-minh" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">URL trang: <code>/dia-diem/{slug || "..."}</code></p>
              </div>
              <div className="space-y-2">
                <Label>Mô tả ngắn</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả về khu vực này..." />
              </div>
              <div className="space-y-2">
                <Label>Ảnh Hero (URL)</Label>
                <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." type="url" />
                <p className="text-xs text-muted-foreground">Ảnh nền hero section trên trang /dia-diem/[slug]</p>
                {heroImage && (
                  <img src={heroImage} alt="preview" className="h-24 w-full object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Thứ tự hiển thị</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} />
              </div>
              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang lưu..." : (editingId ? "Lưu thay đổi" : "Tạo địa điểm")}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
