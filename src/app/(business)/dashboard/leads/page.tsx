"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Phone, PhoneCall, CheckCircle, X, History } from "lucide-react";
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
  visit_count?: number;
};

const HISTORY_LIMIT = 20;

export default function LeadsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  type HistoryRow = Pick<Lead, 'id' | 'created_at' | 'deal_name' | 'status'>;
  const [visitHistory, setVisitHistory] = useState<HistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // Persist across renders so stale-response guard works correctly
  const historyReqRef = useRef(0);

  function visitBadge(count?: number) {
    if (!count || count === 1) return { label: 'Khách mới', cls: 'bg-green-100 text-green-800' };
    if (count === 2) return { label: `Quay lại - Lần ${count}`, cls: 'bg-orange-100 text-orange-800' };
    return { label: `⭐ VIP - Lần ${count}`, cls: 'bg-purple-100 text-purple-700 font-bold' };
  }

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
      // If visit_count not stored in DB, compute from frequency in this result set
      const phoneSeen: Record<string, number> = {};
      const enriched = (data || []).reverse().map(lead => {
        const p = lead.customer_phone || '';
        phoneSeen[p] = (phoneSeen[p] || 0) + 1;
        return { ...lead, visit_count: lead.visit_count ?? phoneSeen[p] };
      }).reverse();
      setLeads(enriched);
    }
    setLoading(false);
  };

  const openHistory = async (lead: Lead) => {
    setSelectedLead(lead);
    setHistoryLoading(true);
    setVisitHistory([]);
    const reqId = ++historyReqRef.current;
    const { data, error } = await supabase
      .from("business_leads")
      .select("id, created_at, deal_name, status")
      .eq("business_id", lead.business_id)
      .eq("customer_phone", lead.customer_phone)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);
    if (reqId !== historyReqRef.current) return; // stale response — discard
    if (error) {
      console.error(error);
      toast.error("Không tải được lịch sử ghé tiệm");
    } else {
      setVisitHistory((data || []) as HistoryRow[]);
    }
    setHistoryLoading(false);
  };

  // Total visit count from stored value (accurate even when history is limited to HISTORY_LIMIT rows)
  const totalVisits = (lead: Lead) => lead.visit_count ?? 1;

  // Pre-compute for use in the history modal without an IIFE
  const historyTotal = selectedLead ? totalVisits(selectedLead) : 0;


  const toggleStatus = async (leadId: string, currentStatus: string) => {
    // new -> contacted -> served -> new (legacy: called -> served, closed -> new)
    let newStatus = "contacted";
    if (currentStatus === "contacted" || currentStatus === "called") newStatus = "served";
    if (currentStatus === "served" || currentStatus === "closed") newStatus = "new";
    
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
      if (status === 'served' || status === 'closed') return "Đã phục vụ";
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

  const filteredLeads = searchPhone.trim()
    ? leads.filter(l => (l.customer_phone || '').replace(/\D/g, '').includes(searchPhone.replace(/\D/g, '')))
    : leads;

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

      {/* Ô tìm kiếm SĐT nhanh */}
      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
        <Phone className="size-4 text-gold shrink-0" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="Khách đọc SĐT — gõ 3-4 số cuối để tìm ngay..."
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {searchPhone && (
          <button onClick={() => setSearchPhone('')} className="text-xs text-muted-foreground hover:text-ink">
            Xóa
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <Phone className="size-10 mb-4 opacity-20" />
            <p>{searchPhone ? `Không tìm thấy khách nào với số "${searchPhone}"` : 'Chưa có khách hàng nào đăng ký ưu đãi.'}</p>
            {!searchPhone && <p className="text-sm mt-1">Hãy chia sẻ trang ưu đãi của bạn để thu hút khách nhé!</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Giờ đặt</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Gói ưu đãi</th>
                  <th className="px-6 py-4 font-semibold">Lần ghé</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.map((lead) => (
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
                    <td className="px-6 py-4 text-muted-foreground max-w-[160px] truncate hidden md:table-cell" title={lead.deal_name}>
                      {lead.deal_name}
                    </td>
                    <td className="px-6 py-4">
                      {(() => { const b = visitBadge(lead.visit_count); return (
                        <button
                          onClick={() => openHistory(lead)}
                          className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity ${b.cls}`}
                          title="Xem lịch sử ghé tiệm"
                        >
                          <History className="size-3" />{b.label}
                        </button>
                      );})()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
                        (lead.status === 'served' || lead.status === 'closed')
                          ? 'bg-purple-100 text-purple-800' 
                          : (lead.status === 'contacted' || lead.status === 'called')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {(lead.status === 'served' || lead.status === 'closed') ? (
                          <><CheckCircle className="size-3" /> Đã phục vụ</>
                        ) : (lead.status === 'contacted' || lead.status === 'called') ? (
                          <><PhoneCall className="size-3" /> Đã liên hệ</>
                        ) : (
                          <><PhoneCall className="size-3" /> Chưa gọi</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant={(lead.status === 'contacted' || lead.status === 'called' || lead.status === 'served' || lead.status === 'closed') ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleStatus(lead.id, lead.status || 'new')}
                        className={(lead.status === 'contacted' || lead.status === 'called' || lead.status === 'served' || lead.status === 'closed') ? "" : "bg-gold text-ink hover:bg-gold/90"}
                      >
                        {(lead.status === 'served' || lead.status === 'closed') ? "Mở lại" : (lead.status === 'contacted' || lead.status === 'called') ? "Đã phục vụ" : "Đã gọi"}
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

    {/* Visit History Modal */}
    {selectedLead && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="font-bold text-lg text-ink">{selectedLead.customer_name}</h3>
              <p className="text-sm text-gold font-medium">{selectedLead.customer_phone}</p>
            </div>
            <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-ink">
              <X className="size-5" />
            </button>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Lịch sử ghé tiệm ({historyTotal} lần){historyTotal > HISTORY_LIMIT ? ` · Hiển thị ${HISTORY_LIMIT} gần nhất` : ''}
            </p>
            {historyLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Đang tải...</p>
            ) : visitHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visitHistory.map((v, i) => (
                  <div key={v.id} className={`flex items-start gap-3 p-3 rounded-xl ${i === 0 ? 'bg-gold/10 border border-gold/30' : 'bg-muted/40'}`}>
                    <div className={`size-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-gold text-ink' : 'bg-muted text-muted-foreground'}`}>
                      {historyTotal - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{v.deal_name || 'Ưu đãi chung'}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(v.created_at), 'HH:mm dd/MM/yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    )}
  );
}
