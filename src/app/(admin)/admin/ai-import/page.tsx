"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, RefreshCw, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LogEntry = {
  name: string;
  status: "running" | "success" | "error" | "skip";
  message: string;
};

export default function AiImportPage() {
  const supabase = createClient();
  const [bulkLinks, setBulkLinks] = useState("");
  const [suppLink, setSuppLink] = useState("");
  const [selectedBizId, setSelectedBizId] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    supabase.from("businesses").select("id, name, slug").order("name").then(({ data }) => {
      if (data) setBusinesses(data);
    });
  }, []);

  const addLog = (entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  };

  // ─── BULK MODE ────────────────────────────────────────────────────────────
  const handleBulkImport = async () => {
    const links = bulkLinks.split("\n").map((l) => l.trim()).filter(Boolean);
    if (links.length === 0) {
      toast.error("Vui lòng dán ít nhất 1 link!");
      return;
    }
    setLogs([]);
    setRunning(true);
    toast.info(`Bắt đầu xử lý ${links.length} link...`);

    for (const link of links) {
      addLog({ name: link, status: "running", message: "Đang xử lý..." });
      try {
        const res = await fetch("/api/admin/scrape-business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: link, mode: "bulk" }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          setLogs((prev) => prev.map((l) => l.name === link ? { ...l, status: "error", message: json.error || "Lỗi server" } : l));
        } else if (json.skipped) {
          setLogs((prev) => prev.map((l) => l.name === link ? { ...l, status: "skip", message: `Đã tồn tại: ${json.name}` } : l));
        } else {
          setLogs((prev) => prev.map((l) => l.name === link ? { ...l, name: json.name || link, status: "success", message: `✅ Nạp thành công: ${json.name}` } : l));
        }
      } catch (e: any) {
        setLogs((prev) => prev.map((l) => l.name === link ? { ...l, status: "error", message: e.message } : l));
      }
    }
    setRunning(false);
    toast.success("Hoàn tất xử lý!");
  };

  // ─── SUPPLEMENT MODE ──────────────────────────────────────────────────────
  const handleSupplement = async () => {
    if (!selectedBizId || !suppLink.trim()) {
      toast.error("Chọn doanh nghiệp và nhập link cần bổ sung!");
      return;
    }
    setLogs([]);
    setRunning(true);
    addLog({ name: suppLink, status: "running", message: "Đang bổ sung thông tin..." });

    try {
      const res = await fetch("/api/admin/scrape-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: suppLink.trim(), mode: "supplement", businessId: selectedBizId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setLogs([{ name: suppLink, status: "error", message: json.error || "Lỗi server" }]);
        toast.error("Bổ sung thất bại!");
      } else {
        setLogs([{ name: json.name || suppLink, status: "success", message: `✅ Đã bổ sung: Logo, Banner, Gallery, Địa chỉ` }]);
        toast.success("Bổ sung thành công!");
      }
    } catch (e: any) {
      setLogs([{ name: suppLink, status: "error", message: e.message }]);
    }
    setRunning(false);
  };

  const statusIcon = (status: LogEntry["status"]) => {
    if (status === "running") return <Loader2 className="size-4 animate-spin text-blue-500" />;
    if (status === "success") return <CheckCircle2 className="size-4 text-green-500" />;
    if (status === "error") return <XCircle className="size-4 text-red-500" />;
    return <Info className="size-4 text-yellow-500" />;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="size-6 text-gold" /> AI Importer
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Dán link Google Maps / Website — AI tự động cào thông tin, logo, banner và nạp vào hệ thống.
        </p>
      </div>

      <Tabs defaultValue="bulk" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="bulk">🚀 Hàng loạt (Bulk)</TabsTrigger>
          <TabsTrigger value="supplement">🔄 Bổ sung</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: BULK ────────────────────────────────────── */}
        <TabsContent value="bulk" className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Hướng dẫn:</strong> Mỗi dòng là 1 link Google Maps hoặc Website. Hệ thống sẽ tự động tìm tên, địa chỉ, logo, banner và nạp vào database.
            </div>
            <div className="space-y-2">
              <Label>Danh sách link (mỗi dòng 1 link)</Label>
              <Textarea
                placeholder={`https://maps.google.com/?q=Lisa+Nail+Spa+Q1\nhttps://maps.google.com/?q=Laboho+Spa+Q1\nhttps://theprivespa.com`}
                className="font-mono text-sm h-52"
                value={bulkLinks}
                onChange={(e) => setBulkLinks(e.target.value)}
                disabled={running}
              />
              <p className="text-xs text-muted-foreground">
                {bulkLinks.split("\n").filter(Boolean).length} link được phát hiện
              </p>
            </div>
            <Button
              onClick={handleBulkImport}
              disabled={running || !bulkLinks.trim()}
              className="w-full bg-gold text-ink hover:bg-gold/90"
            >
              {running ? <><Loader2 className="mr-2 size-4 animate-spin" /> Đang xử lý...</> : <><Zap className="mr-2 size-4" /> Bắt đầu nạp hàng loạt</>}
            </Button>
          </div>
        </TabsContent>

        {/* ── TAB 2: SUPPLEMENT ──────────────────────────────── */}
        <TabsContent value="supplement" className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <strong>Hướng dẫn:</strong> Chọn doanh nghiệp cần bổ sung, dán link trang Google Maps / Website của họ. AI sẽ chỉ ghi đè các trường đang rỗng (không xóa dữ liệu đã có).
            </div>
            <div className="space-y-2">
              <Label>Chọn doanh nghiệp cần bổ sung</Label>
              <Select onValueChange={setSelectedBizId} disabled={running}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn doanh nghiệp --" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link Google Maps hoặc Website của doanh nghiệp</Label>
              <Textarea
                placeholder="https://maps.google.com/?cid=... hoặc https://theprivespa.com"
                className="font-mono text-sm h-28"
                value={suppLink}
                onChange={(e) => setSuppLink(e.target.value)}
                disabled={running}
              />
            </div>
            <Button
              onClick={handleSupplement}
              disabled={running || !suppLink.trim() || !selectedBizId}
              className="w-full"
              variant="outline"
            >
              {running ? <><Loader2 className="mr-2 size-4 animate-spin" /> Đang bổ sung...</> : <><RefreshCw className="mr-2 size-4" /> Bổ sung thông tin còn thiếu</>}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── LOG PANEL ────────────────────────────────────────── */}
      {logs.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-sm mb-3">
            Kết quả xử lý — {logs.filter(l => l.status === "success").length}/{logs.length} thành công
          </h3>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-sm border-b pb-1.5 last:border-0">
                {statusIcon(log.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{log.name}</p>
                  <p className="text-xs text-muted-foreground">{log.message}</p>
                </div>
                <Badge
                  variant={log.status === "success" ? "default" : log.status === "error" ? "destructive" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {log.status === "success" ? "OK" : log.status === "error" ? "LỖI" : log.status === "skip" ? "Bỏ qua" : "..."}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
