"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Upload, Link as LinkIcon, Sparkles, ToggleLeft, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BusinessesClient({ initialBusinesses }: { initialBusinesses: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  const handleQuickPromo = async (id: string, name: string) => {
    if (!confirm(`Tạo nhanh trang ưu đãi & tài khoản doanh nghiệp cho "${name}"?`)) return;

    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/quick-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: id })
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
        return;
      }

      const { email, password } = data.account;
      const accountInfo = `Email: ${email}\nPass: ${password}\n\nLink: ${window.location.origin}${data.promoLink}`;
      
      navigator.clipboard.writeText(accountInfo);
      toast.success("Đã tạo thành công! Thông tin tài khoản đã được copy vào clipboard.", { duration: 8000 });
      router.refresh();
    } catch (err: any) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa doanh nghiệp "${name}"? Hành động này không thể hoàn tác.`)) return;

    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa doanh nghiệp!");
      router.refresh();
    }
  };

  // Cycle: trial → published → suspended → trial
  const cycleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'trial' ? 'published'
      : currentStatus === 'published' ? 'suspended'
      : currentStatus === 'active' ? 'suspended'
      : 'published'; // suspended → published (gia hạn)

    const label = nextStatus === 'published' ? 'Kích hoạt' : nextStatus === 'suspended' ? 'Tạm ngưng' : 'Dùng thử';
    if (!confirm(`Đổi trạng thái sang "${label}"?`)) return;

    setLoadingStatusId(id);
    const { error } = await supabase.from('businesses').update({ status: nextStatus }).eq('id', id);
    if (error) {
      toast.error('Lỗi: ' + error.message);
    } else {
      toast.success(`Đã đổi trạng thái → ${label}`);
      router.refresh();
    }
    setLoadingStatusId(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Doanh nghiệp</h2>
          <p className="text-muted-foreground mt-2">
            Danh sách tất cả các doanh nghiệp trên hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/categories">Danh mục</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/locations">Địa điểm</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/businesses/import">
              <Upload className="mr-2 size-4" />
              Nạp dữ liệu
            </Link>
          </Button>
          <Button asChild className="bg-gold text-ink hover:bg-gold/90">
            <Link href="/admin/businesses/new">
              <Plus className="mr-2 size-4" />
              Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!initialBusinesses || initialBusinesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              initialBusinesses.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{b.name}</span>
                      <span className="text-xs text-muted-foreground">{b.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        (b.status === 'published' || b.status === 'active') ? 'bg-green-100 text-green-800' : 
                        b.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status === 'trial' ? '🕑 Thử nghiệm' 
                          : b.status === 'suspended' ? '🚫 Tạm ngưng'
                          : (b.status === 'published' || b.status === 'active') ? '✅ Hoạt động'
                          : b.status}
                      </span>
                      {b.is_featured && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {b.business_categories && b.business_categories.length > 0 
                      ? b.business_categories.map((c: any) => c.directory_categories?.name).filter(Boolean).join(", ") 
                      : (b.category || "---")}
                  </TableCell>
                  <TableCell>
                    {b.business_locations && b.business_locations.length > 0
                      ? b.business_locations.map((l: any) => l.directory_locations?.name).filter(Boolean).join(", ")
                      : (b.location || "---")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Xem trang ưu đãi */}
                      <Button variant="ghost" size="icon" asChild title="Xem trang ưu đãi">
                        <Link href={`/uu-dai/${b.slug}`} target="_blank">
                          <Eye className="size-4 text-gold" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Chỉnh sửa">
                        <Link href={`/admin/businesses/${b.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      {/* Nút đổi trạng thái: trial/published/suspended */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title={`Đổi trạng thái (hiện: ${b.status})`}
                        disabled={loadingStatusId === b.id}
                        onClick={() => cycleStatus(b.id, b.status)}
                        className={b.status === 'suspended' ? 'text-red-500' : b.status === 'trial' ? 'text-blue-500' : 'text-green-600'}
                      >
                        <ToggleLeft className={`size-4 ${loadingStatusId === b.id ? 'animate-spin' : ''}`} />
                      </Button>
                      {!b.owner_id && b.claim_token && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Copy Link Bàn Giao"
                          onClick={() => {
                            const link = `${window.location.origin}/claim/${b.claim_token}`;
                            navigator.clipboard.writeText(link);
                            toast.success("Đã copy link bàn giao!");
                          }}
                        >
                          <LinkIcon className="size-4 text-green-600" />
                        </Button>
                      )}
                      {!b.owner_id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Tạo Nhanh Trang Ưu Đãi & TK Doanh Nghiệp"
                          disabled={loadingId === b.id}
                          onClick={() => handleQuickPromo(b.id, b.name)}
                        >
                          <Sparkles className={`size-4 text-amber-500 ${loadingId === b.id ? 'animate-pulse' : ''}`} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(b.id, b.name)} 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Xóa"
                      >
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
    </div>
  );
}
