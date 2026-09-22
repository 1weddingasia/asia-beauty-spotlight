"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

export default function PlansAdminClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("0");
  const [priceYearly, setPriceYearly] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const supabase = createClient();

  const fetchPlans = async () => {
    setFetching(true);
    const { data, error } = await supabase.from('plans').select('*').order('created_at', { ascending: true }).limit(500);
    if (error) {
      toast.error("Lỗi tải gói: " + error.message);
    } else {
      setPlans(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPriceMonthly("0");
    setPriceYearly("0");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditingId(plan.id);
    setName(plan.name);
    setDescription(plan.description || "");
    setPriceMonthly(plan.price_monthly?.toString() || "0");
    setPriceYearly(plan.price_yearly?.toString() || "0");
    setIsActive(plan.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      description,
      price_monthly: parseFloat(priceMonthly),
      price_yearly: parseFloat(priceYearly),
      is_active: isActive
    };

    try {
      let error;
      if (editingId) {
        const res = await supabase.from('plans').update(payload).eq('id', editingId);
        error = res.error;
      } else {
        const res = await supabase.from('plans').insert(payload);
        error = res.error;
      }

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(editingId ? "Cập nhật thành công!" : "Tạo gói thành công!");
        setIsModalOpen(false);
        fetchPlans();
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, planName: string) => {
    if (!confirm(`Xóa gói "${planName}"?`)) return;
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa gói!");
      fetchPlans();
    }
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
            <h2 className="text-3xl font-bold tracking-tight">Gói Thành Viên</h2>
            <p className="text-muted-foreground mt-2">Quản lý các gói đăng ký VIP, Premium...</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Thêm gói mới
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Gói</TableHead>
              <TableHead>Giá Tháng</TableHead>
              <TableHead>Giá Năm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">Đang tải...</TableCell></TableRow>
            ) : plans.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">Chưa có gói nào.</TableCell></TableRow>
            ) : (
              plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{Number(p.price_monthly).toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell>{Number(p.price_yearly).toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.is_active ? 'Kích hoạt' : 'Đã ẩn'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(p)} className="text-blue-500 hover:bg-blue-50">
                      Sửa
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:bg-red-50">
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted">
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingId ? "Sửa Gói" : "Thêm Gói Mới"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên gói</Label>
                <Input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="vd: VIP" />
              </div>
              <div className="space-y-2">
                <Label>Mô tả ngắn</Label>
                <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="vd: Phù hợp cho Spa nhỏ" />
              </div>
              <div className="space-y-2">
                <Label>Giá theo tháng (VND)</Label>
                <Input type="number" required value={priceMonthly} onChange={e => setPriceMonthly(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Giá theo năm (VND)</Label>
                <Input type="number" required value={priceYearly} onChange={e => setPriceYearly(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-gold focus:ring-gold"
                />
                <Label htmlFor="isActive">Đang kích hoạt (hiển thị lên web)</Label>
              </div>
              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang lưu..." : (editingId ? "Lưu thay đổi" : "Tạo gói")}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
