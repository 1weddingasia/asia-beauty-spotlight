import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bài viết (Blog)</h2>
          <p className="text-muted-foreground mt-2">Quản lý nội dung SEO, tin tức.</p>
        </div>
        <Button asChild className="bg-gold text-ink hover:bg-gold/90">
          <Link href="/admin/blogs/new">
            <Plus className="mr-2 size-4" /> Viết bài mới
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!blogs || blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Chưa có bài viết nào.</TableCell>
              </TableRow>
            ) : (
              blogs.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      b.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {b.status}
                    </span>
                  </TableCell>
                  <TableCell>{b.published_at ? new Date(b.published_at).toLocaleDateString("vi-VN") : '---'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
