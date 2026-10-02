"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Phone, PhoneCall, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Lead = {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  deal_name: string;
  voucher_code: string;
  status: string;
  created_at: string;
};

export default function LeadsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          setLoading(false);
          return;
        }

        const { data: bData, error: dbErr } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
        if (dbErr || !bData) {
          setLoading(false);
          return;
        }

        setBusiness(bData);
        fetchLeads(bData.id);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const fetchLeads = async (businessId: string) => {
    const { data, error } = await supabase
      .from("business_leads")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách khách hàng");
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const toggleStatus = async (leadId: string, currentStatus: string) => {
    // new -> contacted -> closed -> new
    let newStatus = "contacted";
    if (currentStatus === "contacted") newStatus = "closed";
    if (currentStatus === "closed") newStatus = "new";
    
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    const { error } = await supabase
      .from("business_leads")
      .update({ status: newStatus })
      .eq("id", leadId);
      
    if (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
      // Revert
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: currentStatus } : l));
    } else {
      toast.success("Đã cập nhật trạng thái cuộc gọi");
    }
  };

  const exportExcel = () => {
    if (leads.length === 0) {
      toast.error("Chưa có dữ liệu để xuất");
      return;
    }
    
    // Create CSV content safely
    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const clean = str.toString().replace(/"/g, '""');
      if (/^[=+\-@]/.test(clean)) {
        return `"'${clean}"`;
      }
      return `"${clean}"`;
    };

    const getStatusText = (status: string) => {
      if (status === 'closed') return "Đã chốt";
      if (status === 'contacted' || status === 'called') return "Đã liên hệ";
      return "Chưa gọi";
    };

    const headers = ["Ngày đặt", "Tên khách", "Số điện thoại", "Gói Ưu đãi", "Trạng thái"];
    const csvData = leads.map(l => [
      escapeCSV(format(new Date(l.created_at), 'dd/MM/yyyy HH:mm')),
      escapeCSV(l.customer_name),
      escapeCSV(l.customer_phone),
      escapeCSV(l.deal_name),
      escapeCSV(getStatusText(l.status))
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    // Add BOM for UTF-8 Excel support
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Danh_Sach_Khach_${business?.slug || '1beauty'}_${format(new Date(), 'ddMMyyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải danh sách...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Danh sách Khách đặt (Leads)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tổng hợp khách hàng đã đăng ký nhận ưu đãi từ trang Landing Page của bạn.
          </p>
        </div>
        <Button onClick={exportExcel} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
          <Download className="mr-2 size-4" /> Xuất file Excel
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <Phone className="size-10 mb-4 opacity-20" />
            <p>Chưa có khách hàng nào đăng ký ưu đãi.</p>
            <p className="text-sm mt-1">Hãy chia sẻ trang ưu đãi của bạn để thu hút khách nhé!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Giờ đặt</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Gói ưu đãi</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div className="font-medium text-ink">
                        {format(new Date(lead.created_at), 'HH:mm')}
                      </div>
                      <div className="text-xs">
                        {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink">{lead.customer_name}</div>
                      <div className="text-gold font-medium">{lead.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={lead.deal_name}>
                      {lead.deal_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
                        lead.status === 'closed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : (lead.status === 'contacted' || lead.status === 'called')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lead.status === 'closed' ? (
                          <><CheckCircle className="size-3" /> Đã chốt</>
                        ) : (lead.status === 'contacted' || lead.status === 'called') ? (
                          <><PhoneCall className="size-3" /> Đã liên hệ</>
                        ) : (
                          <><PhoneCall className="size-3" /> Chưa gọi</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant={(lead.status === 'contacted' || lead.status === 'called' || lead.status === 'closed') ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleStatus(lead.id, lead.status || 'new')}
                        className={(lead.status === 'contacted' || lead.status === 'called' || lead.status === 'closed') ? "" : "bg-gold text-ink hover:bg-gold/90"}
                      >
                        {lead.status === 'closed' ? "Mở lại" : (lead.status === 'contacted' || lead.status === 'called') ? "Chốt khách" : "Đã gọi"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
