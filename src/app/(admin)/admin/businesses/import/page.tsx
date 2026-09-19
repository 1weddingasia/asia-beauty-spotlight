"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BulkImportPage() {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleImport = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(jsonText);
      const businesses = Array.isArray(data) ? data : [data];

      if (businesses.length === 0) {
        toast.error("Không có dữ liệu hợp lệ");
        return;
      }

      // Map JSON properties to DB columns
      const payloads = businesses.map(b => ({
        name: b.name,
        slug: b.slug,
        status: b.status || 'draft',
        category: b.category,
        location: b.location,
        is_featured: b.is_featured || false,
        page_content: b.page_content || b,
      }));

      const { error } = await supabase.from("businesses").insert(payloads);
      
      if (error) throw error;
      
      toast.success(`Đã nạp thành công ${payloads.length} doanh nghiệp!`);
      setJsonText("");
      router.push("/admin/businesses");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi cú pháp JSON");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/businesses">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nạp dữ liệu hàng loạt (Bulk Import)</h2>
          <p className="text-muted-foreground mt-2">Dán mảng JSON chứa các doanh nghiệp để tự động tạo danh bạ.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Textarea 
          placeholder="Paste JSON here..."
          className="font-mono text-sm h-96 mb-4"
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
        />
        <Button onClick={handleImport} disabled={loading || !jsonText} className="w-full bg-gold text-ink hover:bg-gold/90">
          <Upload className="mr-2 size-4" />
          {loading ? "Đang xử lý..." : "Tiến hành Import"}
        </Button>
      </div>
    </div>
  );
}
