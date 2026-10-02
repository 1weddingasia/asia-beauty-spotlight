"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
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
      const date = format(new Date(lead.created_at), "dd/MM/yyyy HH:mm");
      const businessName = lead.businesses?.name || "N/A";
      // Bọc trong dấu nháy kép để xử lý dấu phẩy trong nội dung
      return `"${date}","${businessName}","${lead.customer_name}","${lead.customer_phone}","${lead.voucher_code || ''}","${lead.deal_name || ''}","${lead.status}"`;
    });
    
    const csvRows = [headers.join(","), ...csvContent].join("\n");
    // Thêm BOM \uFEFF để Excel nhận diện chuẩn UTF-8 Tiếng Việt
    const blob = new Blob(["\uFEFF" + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `Leads_1Beauty_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
    
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
                      {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm")}
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
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Mới
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
