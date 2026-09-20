"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BlogsClient({ initialBlogs }: { initialBlogs: any[] }) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa bài viết!");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bài viết (Blog)</h2>
          <p className="text-muted-foreground mt-2">Quản lý nội dung SEO, tin tức.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/blogs/categories">
              Danh mục
            </Link>
          </Button>
          <Button asChild className="bg-gold text-ink hover:bg-gold/90">
            <Link href="/admin/blogs/new">
              <Plus className="mr-2 size-4" /> Viết bài mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!initialBlogs || initialBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Chưa có bài viết nào.</TableCell>
              </TableRow>
            ) : (
              initialBlogs.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title || 'Không có tiêu đề'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      b.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {b.status === 'published' ? 'Đã xuất bản' : (b.status === 'draft' ? 'Bản nháp' : 'Lưu trữ')}
                    </span>
                  </TableCell>
                  <TableCell>{b.published_at ? new Date(b.published_at).toLocaleDateString("vi-VN") : '---'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/blogs/${b.id}`}>
                          <Edit className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
