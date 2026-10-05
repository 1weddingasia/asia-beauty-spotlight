"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Lead = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  voucher_code: string | null;
  deal_name: string | null;
  status: string;
  businesses: { name: string } | null;
};

// Hàm escape CSV chống injection (Formula Injection) và xử lý ký tự đặc biệt
const escapeCSV = (value: string | null | undefined) => {
  if (!value) return '""';
  // Ngăn chặn Excel tự động chạy công thức nếu nội dung bắt đầu bằng các ký tự đặc biệt
  let safeValue = String(value);
  if (/^[=+\-@\t\r]/.test(safeValue)) {
    safeValue = "'" + safeValue;
  }
  // Escape dấu ngoặc kép bên trong bằng cách nhân đôi (" -> "")
  return `"${safeValue.replace(/"/g, '""')}"`;
};

const formatLeadDate = (dateStr: string, fallback = "-") => {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? fallback : format(d, "dd/MM/yyyy HH:mm");
  } catch (e) {
    return fallback; // Ignored parsing error
  }
};

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = initialLeads.filter(lead => 
    lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.customer_phone?.includes(searchTerm) ||
    lead.businesses?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    
    const headers = ["Ngày", "Doanh nghiệp", "Tên Khách Hàng", "Số Điện Thoại", "Mã Ưu Đãi", "Gói Dịch Vụ", "Trạng Thái"];
    
    const csvContent = filteredLeads.map(lead => {
      const dateStr = formatLeadDate(lead.created_at, "");
      const businessName = lead.businesses?.name || "N/A";
      
      return [
        escapeCSV(dateStr),
        escapeCSV(businessName),
        escapeCSV(lead.customer_name),
        escapeCSV(lead.customer_phone),
        escapeCSV(lead.voucher_code),
        escapeCSV(lead.deal_name),
        escapeCSV(lead.status)
      ].join(",");
    });
    
    const csvRows = [headers.join(","), ...csvContent].join("\n");
    // Thêm BOM \uFEFF để Excel nhận diện chuẩn UTF-8 Tiếng Việt
    const blob = new Blob(["\uFEFF" + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `Leads_${format(new Date(), "dd-MM-yyyy")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Báo Cáo Leads B2B</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Tổng hợp dữ liệu khách hàng đăng ký lấy mã và chatbot từ tất cả doanh nghiệp.
          </p>
        </div>
        
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white flex gap-2">
          <Download className="size-4" /> Xuất file Excel (CSV)
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo SĐT, Tên khách hoặc Tên Tiệm..." 
            className="pl-9 bg-muted/50 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="size-4" /> Lọc Nâng Cao
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Doanh nghiệp</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">Mã Ưu Đãi / Gói</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {formatLeadDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                      {lead.businesses?.name || "Không xác định"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {lead.customer_name || <span className="italic text-muted-foreground">Ẩn danh</span>}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-primary">
                      {lead.customer_phone}
                    </td>
                    <td className="px-6 py-4 max-w-[250px] truncate">
                      {lead.voucher_code ? (
                        <span className="bg-gold/20 text-ink px-2 py-1 rounded text-xs font-bold font-mono mr-2">
                          {lead.voucher_code}
                        </span>
                      ) : null}
                      <span className="text-muted-foreground">{lead.deal_name || "Trợ lý ảo AI Chat"}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                        {lead.status || "Mới"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
