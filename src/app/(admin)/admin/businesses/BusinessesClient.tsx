"use client";

import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Upload } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BusinessesClient({ initialBusinesses }: { initialBusinesses: any[] }) {
  const supabase = createClient();
  const router = useRouter();

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
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      b.status === 'published' ? 'bg-green-100 text-green-800' : 
                      b.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {b.status}
                    </span>
                    {b.is_featured && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        Featured
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{b.category || "---"}</TableCell>
                  <TableCell>{b.location || "---"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="Xem trên web">
                        <Link href={`/doanh-nghiep/${b.slug}`} target="_blank">
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Chỉnh sửa">
                        <Link href={`/admin/businesses/${b.id}`}>
                          <Pencil className="size-4" />
                        </Link>
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
