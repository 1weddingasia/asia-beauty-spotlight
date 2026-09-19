import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminPlansPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from("plans").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gói Thành viên</h2>
          <p className="text-muted-foreground mt-2">Quản lý các gói dịch vụ (Free, VIP...).</p>
        </div>
        <Button className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Thêm gói mới
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Gói</TableHead>
              <TableHead>Giá Tháng</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!plans || plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Chưa có gói nào.</TableCell>
              </TableRow>
            ) : (
              plans.map((p) => (
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
