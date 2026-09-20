"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('plans').insert({
        name,
        price_monthly: parseInt(price),
        is_active: isActive
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Tạo gói dịch vụ thành công!");
        setIsModalOpen(false);
        setName("");
        setPrice("");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Xóa gói này?")) return;
    
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa!");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gói Dịch Vụ</h2>
          <p className="text-muted-foreground mt-2">Quản lý các gói đăng ký kinh doanh (Free, VIP...).</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Thêm gói mới
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Gói</TableHead>
              <TableHead>Giá Tháng (VNĐ)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!initialPlans || initialPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Chưa có gói nào.</TableCell>
              </TableRow>
            ) : (
              initialPlans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.price_monthly.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>
                    {p.is_active ? (
                      <span className="text-green-600 font-semibold text-sm">Đang mở</span>
                    ) : (
                      <span className="text-gray-500 font-semibold text-sm">Đã đóng</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(p.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
            <h3 className="text-xl font-bold mb-4">Thêm Gói Dịch Vụ Mới</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên gói (vd: Gói Tiêu Chuẩn)</Label>
                <Input type="text" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Giá theo tháng (VNĐ)</Label>
                <Input type="number" required value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  value={isActive ? "true" : "false"} 
                  onChange={e => setIsActive(e.target.value === "true")}
                >
                  <option value="true">Đang mở bán</option>
                  <option value="false">Tạm đóng</option>
                </select>
              </div>

              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu gói dịch vụ"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
