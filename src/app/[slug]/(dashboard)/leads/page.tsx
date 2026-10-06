"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Phone, CheckCircle, X, History, Users, CalendarDays, Ticket } from "lucide-react";
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
  cross_sell_items?: string;
  notes?: string;
};

type Customer = {
  id: string;
  phone: string;
  name: string;
  total_visits: number;
  last_visit_at: string;
  created_at: string;
  notes?: string;
};

const HISTORY_LIMIT = 20;

export default function LeadsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // New State for CRM
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [viewMode, setViewMode] = useState<'leads' | 'customers'>('leads');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  type HistoryRow = Pick<Lead, 'id' | 'created_at' | 'deal_name' | 'voucher_code' | 'status' | 'cross_sell_items' | 'notes'>;
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
    // 1. Fetch Bookings (Leads)
    const { data: leadsData, error: leadsErr } = await supabase
      .from("business_leads")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
      
    if (leadsErr) {
      console.error(leadsErr);
      toast.error("Lỗi khi tải danh sách khách hàng");
    } else {
      setLeads(leadsData || []);
    }

    // 2. Fetch Unique Customers
    const { data: custData, error: custErr } = await supabase
      .from("business_customers")
      .select("*")
      .eq("business_id", businessId)
      .order("last_visit_at", { ascending: false });

    if (!custErr && custData) {
      setCustomers(custData);
    }

    setLoading(false);
  };

  const fetchHistory = async (phone: string) => {
    setHistoryLoading(true);
    setVisitHistory([]);
    const reqId = ++historyReqRef.current;
    const { data, error } = await supabase
      .from("business_leads")
      .select("id, created_at, deal_name, voucher_code, status, cross_sell_items, notes")
      .eq("business_id", business.id)
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);
    if (reqId !== historyReqRef.current) return;
    if (error) {
      console.error(error);
      toast.error("Không tải được lịch sử ghé tiệm");
    } else {
      setVisitHistory((data || []) as HistoryRow[]);
    }
    setHistoryLoading(false);
  };

  const openHistory = async (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedCustomer(null);
    await fetchHistory(lead.customer_phone);
  };

  const openCustomerHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedLead(null);
    await fetchHistory(customer.phone);
  };

  // Total visit count from stored value (accurate even when history is limited to HISTORY_LIMIT rows)
  const totalVisits = (lead: Lead) => lead.visit_count ?? 1;

  // Pre-compute for use in the history modal without an IIFE
  const historyTotal = selectedCustomer 
    ? selectedCustomer.total_visits 
    : (selectedLead ? totalVisits(selectedLead) : 0);


  const updateStatus = async (leadId: string, newStatus: string) => {
    const prevLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    const { error } = await supabase
      .from("business_leads")
      .update({ status: newStatus })
      .eq("id", leadId);
      
    if (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
      setLeads(prevLeads);
    } else {
      toast.success("Đã cập nhật trạng thái");
    }
  };

  const updateNotes = async (leadId: string, newNotes: string) => {
    const { error } = await supabase
      .from("business_leads")
      .update({ notes: newNotes })
      .eq("id", leadId);
      
    if (error) {
      toast.error("Lỗi khi lưu ghi chú");
    }
  };

  const handleNotesChange = (leadId: string, value: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: value } : l));
  };

  const exportExcel = () => {
    if (leads.length === 0) {
      toast.error("Chưa có dữ liệu để xuất");
      return;
    }

    const getStatusText = (status: string) => {
      if (status === 'served' || status === 'closed') return "Đã phục vụ";
      if (status === 'confirmed') return "Đã xác nhận";
      if (status === 'cancelled') return "Hủy";
      if (status === 'contacted' || status === 'called') return "Đã liên hệ";
      return "Chưa gọi";
    };

    const escapeExcel = (str: string) => {
      if (!str) return '';
      const clean = str.toString();
      if (/^[=+\-@]/.test(clean)) {
        return `'${clean}`;
      }
      return clean;
    };

    const data = leads.map(l => ({
      "Ngày đặt": format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
      "Tên khách": escapeExcel(l.customer_name),
      "Số điện thoại": escapeExcel(l.customer_phone),
      "Gói Ưu đãi": escapeExcel(l.deal_name),
      "Sản phẩm mua kèm": escapeExcel(l.cross_sell_items || ''),
      "Trạng thái": getStatusText(l.status),
      "Ghi chú": escapeExcel(l.notes || '')
    }));

    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "KhachHang");
      XLSX.writeFile(workbook, `Danh_Sach_Khach_${business?.slug || '1beauty'}_${format(new Date(), 'ddMMyyyy')}.xlsx`);
    }).catch((err) => {
      console.error(err);
      toast.error("Lỗi khi tạo file Excel");
    });
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải danh sách...</div>;

  const searchTerm = searchPhone.trim().toLowerCase();
  const filteredLeads = searchTerm
    ? leads.filter(l => {
        const phoneMatch = (l.customer_phone || '').replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
        const codeMatch = (l.voucher_code || '').toLowerCase().includes(searchTerm);
        return phoneMatch || codeMatch;
      })
    : leads;

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchPhone, viewMode]);

  const filteredCustomers = searchTerm
    ? customers.filter(c => (c.phone || '').replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
    : customers;

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Group leads for timeline view
  const groupedLeads = paginatedLeads.reduce((acc, lead) => {
    const dateStr = format(new Date(lead.created_at), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const sortedDates = Object.keys(groupedLeads).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getDayLabel = (dateStr: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const d = format(new Date(dateStr), 'dd/MM/yyyy');
    if (dateStr === today) return `Hôm nay, ${d}`;
    if (dateStr === yesterday) return `Hôm qua, ${d}`;
    return d;
  };

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Quản lý Khách Hàng (CRM)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ghi nhận khách hàng chuẩn CSKH: Mỗi SĐT là 1 khách hàng duy nhất.
          </p>
        </div>
        <Button onClick={exportExcel} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
          <Download className="mr-2 size-4" /> Xuất file Excel
        </Button>
      </div>

      {/* Ô tìm kiếm SĐT nhanh */}
      <div className="flex items-center gap-3 rounded-xl border-2 border-gold/40 bg-gold/5 px-4 py-3 shadow-sm">
        <Phone className="size-5 text-gold shrink-0" />
        <input
          type="text"
          placeholder="TÌM SĐT HOẶC MÃ ĐỂ CHECK-IN (gõ 3-4 số cuối)..."
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/70 text-ink"
        />
        {searchPhone && (
          <button onClick={() => setSearchPhone('')} className="text-xs text-muted-foreground hover:text-ink">
            Xóa
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setViewMode('customers')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${viewMode === 'customers' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-ink'}`}
        >
          <Users className="inline-block size-4 mr-2" />
          Khách Hàng ({customers.length})
        </button>
        <button
          onClick={() => setViewMode('leads')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${viewMode === 'leads' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-ink'}`}
        >
          <CalendarDays className="inline-block size-4 mr-2" />
          Quản lý Ưu đãi & Check-in ({leads.length})
        </button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {viewMode === 'customers' && (
          filteredCustomers.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
              <Users className="size-10 mb-4 opacity-20" />
              <p>{searchPhone ? `Không tìm thấy khách hàng với số "${searchPhone}"` : 'Chưa có dữ liệu khách hàng.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tên Khách Hàng</th>
                    <th className="px-6 py-4 font-semibold">Số Điện Thoại</th>
                    <th className="px-6 py-4 font-semibold text-center">Tổng Số Lượt Ghé</th>
                    <th className="px-6 py-4 font-semibold">Lần Ghé Cuối</th>
                    <th className="px-6 py-4 font-semibold">Lịch sử</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-ink">{c.name}</td>
                      <td className="px-6 py-4 font-medium text-gold">{c.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">{c.total_visits}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(c.last_visit_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openCustomerHistory(c)}
                          className="text-gold font-medium text-xs border border-gold rounded px-3 py-1.5 hover:bg-gold hover:text-white transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {viewMode === 'leads' && (
          filteredLeads.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
              <Phone className="size-10 mb-4 opacity-20" />
              <p>{searchPhone ? `Không tìm thấy khách nào với số "${searchPhone}"` : 'Chưa có khách hàng nào đăng ký ưu đãi.'}</p>
              {!searchPhone && <p className="text-sm mt-1">Hãy chia sẻ trang ưu đãi của bạn để thu hút khách nhé!</p>}
            </div>
          ) : (
          <div className="p-4 md:p-8">
            <div className="relative border-l-2 border-muted-foreground/20 ml-16 md:ml-24 space-y-10">
              {sortedDates.map(dateStr => (
                <div key={dateStr} className="relative">
                  {/* Date Badge */}
                  <div className="absolute -left-3 md:-left-3.5 -top-3 bg-white">
                    <div className="bg-muted px-4 py-1 rounded-full text-xs font-bold text-muted-foreground border shadow-sm flex items-center gap-2">
                      <CalendarDays className="size-3" /> {getDayLabel(dateStr)}
                    </div>
                  </div>

                  <div className="pt-6 space-y-6">
                    {groupedLeads[dateStr].map(lead => (
                      <div key={lead.id} className="relative flex items-start group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[30px] md:-left-[32px] mt-2 w-4 h-4 rounded-full border-2 border-white bg-gold shadow-sm group-hover:scale-125 transition-transform" />
                        
                        {/* Timeline Time */}
                        <div className="absolute -left-[76px] md:-left-[88px] mt-1.5 w-10 md:w-12 text-right">
                          <span className="text-xs font-bold text-muted-foreground block">{format(new Date(lead.created_at), 'HH:mm')}</span>
                        </div>

                        {/* Card Content */}
                        <div className="ml-4 md:ml-8 flex-1 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden">
                          {/* Left: Customer Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <button 
                                onClick={() => openHistory(lead)} 
                                className="text-left cursor-pointer group/name"
                              >
                                <h3 className="font-bold text-lg text-ink group-hover/name:text-gold transition-colors">{lead.customer_name}</h3>
                                <p className="text-gold font-semibold flex items-center gap-1.5"><Phone className="size-3" /> {lead.customer_phone}</p>
                              </button>
                              
                              <div className="md:hidden">
                                {(() => { const b = visitBadge(lead.visit_count); return (
                                  <span className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] ${b.cls}`}>
                                    <History className="size-3" />{b.label}
                                  </span>
                                );})()}
                              </div>
                            </div>

                            <div className="pt-2">
                              <p className="font-medium text-ink text-sm flex items-start gap-2">
                                <Ticket className="size-4 shrink-0 text-gold mt-0.5" /> 
                                <span>{lead.deal_name}</span>
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="font-mono text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md shadow-sm">
                                  Mã: {lead.voucher_code || 'N/A'}
                                </div>
                                {lead.cross_sell_items && (
                                  <div className="text-xs text-purple-700 bg-purple-50 border border-purple-100 font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                                    🛒 {lead.cross_sell_items}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="hidden md:block w-px bg-muted/60 self-stretch" />

                          {/* Right: Actions */}
                          <div className="w-full md:w-64 space-y-3 flex flex-col justify-between">
                            <div className="flex justify-between md:justify-end items-center gap-3">
                              <div className="hidden md:block">
                                {(() => { const b = visitBadge(lead.visit_count); return (
                                  <button onClick={() => openHistory(lead)} className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] hover:opacity-80 transition-opacity ${b.cls}`}>
                                    <History className="size-3" />{b.label}
                                  </button>
                                );})()}
                              </div>
                              <select
                                value={['served', 'closed'].includes(lead.status) ? 'served' : ['contacted', 'called', 'confirmed'].includes(lead.status) ? 'confirmed' : lead.status === 'cancelled' ? 'cancelled' : 'new'}
                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                className={`text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer appearance-none flex-1 md:flex-none ${
                                  ['served', 'closed'].includes(lead.status) ? 'bg-green-100 text-green-800 border-green-200 shadow-inner' :
                                  ['contacted', 'called', 'confirmed'].includes(lead.status) ? 'bg-blue-100 text-blue-800 border-blue-200 shadow-inner' :
                                  lead.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                  'bg-red-100 text-red-700 border-red-200 shadow-inner'
                                } border transition-colors focus:ring-2 focus:ring-gold/20`}
                              >
                                <option value="new">Chưa liên hệ</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="served">✅ Đã Check-in</option>
                                <option value="cancelled">❌ Hủy / KNM</option>
                              </select>
                            </div>

                            <textarea
                              placeholder="Thêm ghi chú nội bộ..."
                              value={lead.notes || ''}
                              onChange={(e) => handleNotesChange(lead.id, e.target.value)}
                              onBlur={(e) => updateNotes(lead.id, e.target.value)}
                              className="w-full text-xs bg-muted/20 border border-muted-foreground/20 rounded-lg p-2.5 outline-none focus:border-gold focus:bg-white transition-colors resize-none h-14"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="rounded-full"
                >
                  Trang trước
                </Button>
                <div className="text-sm font-medium text-muted-foreground px-4">
                  Trang {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="rounded-full"
                >
                  Trang sau
                </Button>
              </div>
            )}
          </div>
          )
        )}
      </div>
    </div>

    {/* Visit History Modal */}
    {(selectedLead || selectedCustomer) && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedLead(null); setSelectedCustomer(null); }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="font-bold text-lg text-ink">{selectedCustomer ? selectedCustomer.name : selectedLead?.customer_name}</h3>
              <p className="text-sm text-gold font-medium">{selectedCustomer ? selectedCustomer.phone : selectedLead?.customer_phone}</p>
            </div>
            <button onClick={() => { setSelectedLead(null); setSelectedCustomer(null); }} className="text-muted-foreground hover:text-ink">
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
                      {v.voucher_code && (
                        <p className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded inline-block mt-0.5 mb-1 shadow-sm">
                          Mã: {v.voucher_code}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mb-1">{format(new Date(v.created_at), 'HH:mm dd/MM/yyyy')}</p>
                      {v.cross_sell_items && (
                        <p className="text-xs text-purple-600 font-medium truncate" title={v.cross_sell_items}>
                          🛒 {v.cross_sell_items}
                        </p>
                      )}
                      {v.notes && (
                        <p className="text-xs text-ink/70 italic mt-1 bg-white/50 p-1.5 rounded-md border border-black/5" title={v.notes}>
                          "{v.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    )}
  </>
  );
}
