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

export default function DirectoryLocationsClient() {
  const [locations, setLocations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchLocations = async () => {
    setFetching(true);
    const { data, error } = await supabase.from('directory_locations').select('*').order('created_at', { ascending: false }).limit(500);
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
    setName("");
    setSlug("");
    setIsModalOpen(true);
  };

  const openEditModal = (loc: any) => {
    setEditingId(loc.id);
    setName(loc.name);
    setSlug(loc.slug);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      if (editingId) {
        const res = await supabase.from('directory_locations').update({ name, slug }).eq('id', editingId);
        error = res.error;
      } else {
        const res = await supabase.from('directory_locations').insert({ name, slug });
        error = res.error;
      }

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(editingId ? "Cập nhật thành công!" : "Tạo địa điểm thành công!");
        setIsModalOpen(false);
        setName("");
        setSlug("");
        setEditingId(null);
        fetchLocations();
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, locName: string) => {
    if (!confirm(`Xóa địa điểm "${locName}"?`)) return;
    const { error } = await supabase.from('directory_locations').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa địa điểm!");
      fetchLocations();
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <div className="space-y-6 relative max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/businesses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Khu vực (Địa điểm)</h2>
            <p className="text-muted-foreground mt-2">Quản lý các địa điểm hoạt động (vd: TP.HCM, Hà Nội).</p>
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
              <TableHead>Đường dẫn (Slug)</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center">Đang tải...</TableCell></TableRow>
            ) : locations.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center">Chưa có địa điểm nào.</TableCell></TableRow>
            ) : (
              locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell className="text-muted-foreground">{loc.slug}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(loc)} className="text-blue-500 hover:bg-blue-50">
                      Sửa
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id, loc.name)} className="text-red-500 hover:bg-red-50">
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
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted">
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingId ? "Sửa Địa Điểm" : "Thêm Địa Điểm Mới"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên địa điểm</Label>
                <Input type="text" required value={name} onChange={e => handleNameChange(e.target.value)} placeholder="vd: TP.HCM" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input type="text" required value={slug} onChange={e => setSlug(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang lưu..." : (editingId ? "Lưu thay đổi" : "Lưu địa điểm")}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
