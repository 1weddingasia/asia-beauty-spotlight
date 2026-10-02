"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, Send, QrCode, Printer, X } from "lucide-react";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substring(2, 9);

type Deal = {
  id: string;
  title: string;
  original_price: string;
  promo_price: string;
  badge: string;
  note: string;
  status: "active" | "paused";
};

export default function DealsManagementPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [telegramId, setTelegramId] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
        if (dbError || !data) {
          setLoading(false);
          return;
        }

        let content: any = data.page_content || {};
        if (typeof data.page_content === 'string') {
          try {
            content = JSON.parse(data.page_content);
          } catch (e) {
            console.error('Invalid page_content JSON:', e);
            content = {};
          }
        }
        setBusiness({ ...data, page_content: content });
          
        setTelegramId(content.telegram_chat_id || "");
        
        // Normalize existing deals
        let existingDeals = Array.isArray(content.deals) ? content.deals : [];
        if (existingDeals.length === 0) {
          if (Array.isArray(content.offers) && content.offers.length > 0) {
            existingDeals = content.offers.map((o: any) => ({
              id: generateId(),
              title: o.title || "",
              original_price: "Liên hệ",
              promo_price: o.promo_price || o.discount || "Ưu đãi",
              badge: o.badge || "Hot",
              note: o.description || o.note || (o.validUntil ? `HSD: ${o.validUntil}` : ""),
              status: "active"
            }));
          } else if (content.featured_deal) {
            existingDeals = [{
              id: generateId(),
              title: content.featured_deal,
              original_price: "Liên hệ",
              promo_price: "Ưu đãi",
              badge: "Độc Quyền 1Beauty",
              note: "",
              status: "active"
            }];
          }
        }
        setDeals(existingDeals);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    
    // Clean deals structure before saving
    const cleanDeals = deals.map(d => ({
      ...d,
      id: d.id || generateId()
    }));

    try {
      const updatedContent = {
        ...(business.page_content || {}),
        telegram_chat_id: telegramId,
        deals: cleanDeals
      };

      const { error } = await supabase
        .from("businesses")
        .update({ page_content: updatedContent })
        .eq("id", business.id);

      if (error) throw error;
      
      // Update local state
      setBusiness({ ...business, page_content: updatedContent });
      setDeals(cleanDeals);
      toast.success("Đã lưu cấu hình Ưu đãi & Telegram!");
    } catch (err: any) {
      console.error("Lỗi khi lưu cấu hình ưu đãi:", err);
      toast.error("Không thể lưu cấu hình. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const addDeal = () => {
    if (deals.length >= 5) {
      toast.error("Bạn chỉ có thể tạo tối đa 5 Ưu đãi!");
      return;
    }
    setDeals([
      ...deals,
      {
        id: generateId(),
        title: "",
        original_price: "",
        promo_price: "",
        badge: "",
        note: "",
        status: "active"
      }
    ]);
  };

  const updateDeal = (index: number, field: keyof Deal, value: Deal[keyof Deal]) => {
    const newDeals = [...deals];
    newDeals[index] = { ...newDeals[index], [field]: value };
    setDeals(newDeals);
  };

  const removeDeal = (index: number) => {
    setDeals(deals.filter((_, i) => i !== index));
  };

  const downloadQR = async () => {
    if (!business?.slug) return;
    try {
      const promoUrl = `${window.location.origin}/uu-dai/${business.slug}`;
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(promoUrl)}`;
      
      toast.info("Đang tạo mã QR...");
      const response = await fetch(url);
      if (!response.ok) throw new Error(`QR API error: ${response.status}`);
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `QR_Code_${business.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      
      toast.success("Đã tải mã QR thành công!");
    } catch (error) {
      toast.error("Không thể tải mã QR lúc này.");
      console.error(error);
    }
  };

  const printStandee = () => {
    if (!business?.slug) return;
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    const promoUrl = `${window.location.origin}/uu-dai/${business.slug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(promoUrl)}&margin=10&color=3d2c00&bgcolor=fefdf8`;
    const escapedName = business.name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const printContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Be Vietnam Pro', sans-serif; background: #fff; }
          @page { size: A5 portrait; margin: 0; }
          .standee {
            width: 148mm; height: 210mm;
            display: flex; flex-direction: column;
            align-items: center; justify-content: space-between;
            padding: 14mm 12mm;
            background: linear-gradient(160deg, #fffbf0 0%, #fff8e1 50%, #fef3c7 100%);
            border: 3px solid #c8960c;
            border-radius: 8mm;
            text-align: center;
            page-break-after: avoid;
          }
          .top-badge { background: #c8960c; color: #fff; font-size: 9pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 16px; border-radius: 99px; margin-bottom: 4mm; }
          .shop-name { font-size: 18pt; font-weight: 900; color: #1a0a00; line-height: 1.2; margin-bottom: 2mm; }
          .headline { font-size: 13pt; font-weight: 700; color: #c8960c; line-height: 1.3; margin-bottom: 6mm; }
          .qr-wrap { background: #fff; border: 3px solid #c8960c; border-radius: 6mm; padding: 6mm; box-shadow: 0 4px 24px rgba(200,150,12,0.2); }
          .qr-img { display: block; width: 50mm; height: 50mm; }
          .instructions { font-size: 9pt; color: #7c5800; margin-top: 5mm; line-height: 1.5; }
          .footer { font-size: 7pt; color: #b39000; border-top: 1px solid #e5c96a; padding-top: 4mm; width: 100%; }
        </style>
      </head>
      <body>
        <div class="standee">
          <div>
            <div class="top-badge">Chương trình ưu đãi đặc quyền</div>
            <div class="shop-name">${escapedName}</div>
            <div class="headline">QUÉT MÃ – NHẬN ƯU ĐÃI<br/>ĐỘC QUYỀN CHO BẠN</div>
          </div>
          <div>
            <div class="qr-wrap">
              <img class="qr-img" src="${qrUrl}" alt="QR Code" />
            </div>
            <div class="instructions">Mở Camera điện thoại hoặc Zalo<br/>quét mã nhận ưu đãi trong 3 giây ✌️</div>
          </div>
          <div class="footer">Hệ thống đặt hẹn bảo trợ bởi 1Beauty.asia</div>
        </div>
      </body>
      </html>
    `;
    const printWin = window.open('', '_blank', 'width=600,height=800');
    if (!printWin) { toast.error("Trình duyệt chặn popup! Hãy cho phép popup và thử lại."); return; }
    printWin.document.write(printContent);
    printWin.document.close();
    // Use fixed timeout after close() — onload is unreliable with document.write
    setTimeout(() => { printWin.print(); }, 1200);
    setShowPrintModal(false);
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải cấu hình...</div>;
  if (!business) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy thông tin doanh nghiệp.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-lg text-ink">Xem trước Standee A5</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-muted-foreground hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            {/* Mini Preview */}
            <div className="p-6 flex justify-center bg-gray-50">
              <div style={{width:"180px",minHeight:"255px",background:"linear-gradient(160deg,#fffbf0,#fef3c7)",border:"2px solid #c8960c",borderRadius:"12px",padding:"16px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",textAlign:"center"}}>
                <div style={{background:"#c8960c",color:"#fff",fontSize:"7px",fontWeight:700,letterSpacing:"0.1em",padding:"2px 10px",borderRadius:"99px",textTransform:"uppercase"}}>Chương trình ưu đãi</div>
                <div style={{fontSize:"11px",fontWeight:900,color:"#1a0a00",lineHeight:1.2}}>{business.name}</div>
                <div style={{fontSize:"9px",fontWeight:700,color:"#c8960c",lineHeight:1.3}}>QUÉT MÃ NH\u1eacN \u01afU \u0110\u00c3I \u0110\u1ed8C QUY\u1ec0N</div>
                <div style={{background:"#fff",border:"2px solid #c8960c",borderRadius:"8px",padding:"6px"}}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/uu-dai/${business.slug}`)}&margin=4&color=3d2c00`} 
                    alt="QR" 
                    style={{width:"80px",height:"80px",display:"block"}}
                  />
                </div>
                <div style={{fontSize:"7px",color:"#7c5800",lineHeight:1.5}}>Mở Camera / Zalo<br/>quét mã nhận ưu đãi trong 3s</div>
                <div style={{fontSize:"6px",color:"#b39000",borderTop:"1px solid #e5c96a",paddingTop:"6px",width:"100%"}}>Hệ thống bảo trợ bởi 1Beauty.asia</div>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPrintModal(false)}>Hủy</Button>
              <Button className="flex-1 bg-gold text-ink hover:bg-gold/90 font-bold" onClick={handlePrint}>
                <Printer className="mr-2 size-4" /> In Ngay (A5)
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Quản lý Ưu đãi (Deals)</h1>
          <p className="text-muted-foreground text-sm mt-1">Cài đặt các gói ưu đãi và Cấu hình nhận thông báo qua Telegram.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button onClick={downloadQR} variant="outline" className="border-gold text-gold hover:bg-gold/10 w-full md:w-auto">
            <QrCode className="mr-2 size-4" />
            Tải Mã QR
          </Button>
          <Button onClick={printStandee} variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50 w-full md:w-auto">
            <Printer className="mr-2 size-4" />
            In Bảng QR Để Bàn (A5)
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 w-full md:w-auto">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      {/* Telegram Config Section */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm border-blue-100">
        <div className="flex items-center gap-2 mb-4 text-blue-600">
          <Send className="size-5" />
          <h2 className="text-lg font-bold">Kết nối Telegram (Nhận thông báo tự động)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Khi có khách hàng bấm "Giữ Chỗ", hệ thống sẽ lập tức gửi tin nhắn về Nhóm Telegram của tiệm để bạn gọi điện chốt lịch.
        </p>
        
        <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-50">
          <Label className="font-semibold text-ink">Chat ID Nhóm Telegram của bạn</Label>
          <div className="flex gap-3">
            <Input 
              placeholder="-10012345678" 
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
              className="bg-white"
            />
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Hiện tại 1Beauty.Asia sẽ hỗ trợ bạn cấu hình trực tiếp mã ID này. 
            Trong tương lai, bạn chỉ cần bấm 1 nút để kết nối tự động.
          </p>
        </div>
      </div>

      {/* Deals Management Section */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Danh sách Gói Ưu đãi</h2>
            <p className="text-sm text-muted-foreground">Tối đa 5 gói. Các gói sẽ hiển thị trực tiếp trên trang Landing Page của tiệm.</p>
          </div>
          <Button onClick={addDeal} variant="outline" className="text-gold border-gold hover:bg-gold/10">
            <Plus className="size-4 mr-2" /> Thêm Ưu đãi mới
          </Button>
        </div>

        <div className="space-y-6">
          {deals.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border border-dashed rounded-xl">
              <p className="text-muted-foreground">Chưa có Ưu đãi nào. Hãy tạo một ưu đãi để thu hút khách hàng!</p>
            </div>
          ) : (
            deals.map((deal, idx) => (
              <div key={deal.id || idx} className={`p-5 rounded-xl border relative transition-colors ${deal.status === 'paused' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gold/30 shadow-sm'}`}>
                
                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className={`text-xs ${deal.status === 'active' ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                      {deal.status === 'active' ? 'Đang bật' : 'Tạm dừng'}
                    </Label>
                    <Switch 
                      checked={deal.status === 'active'}
                      onCheckedChange={(checked) => updateDeal(idx, 'status', checked ? 'active' : 'paused')}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeDeal(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tên dịch vụ / Gói ưu đãi (*)</Label>
                    <Input 
                      placeholder="VD: Triệt lông nách vĩnh viễn Laser Diode" 
                      value={deal.title}
                      onChange={e => updateDeal(idx, 'title', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Giá gốc</Label>
                    <Input 
                      placeholder="VD: 500.000đ" 
                      value={deal.original_price}
                      onChange={e => updateDeal(idx, 'original_price', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá giảm (Promo Price)</Label>
                    <Input 
                      placeholder="VD: 199.000đ" 
                      value={deal.promo_price}
                      onChange={e => updateDeal(idx, 'promo_price', e.target.value)}
                      className={`font-bold text-red-600 ${deal.status === 'paused' ? 'opacity-70' : ''}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nhãn tạo hiệu ứng (Badge)</Label>
                    <Input 
                      placeholder="VD: Bán chạy nhất, Còn 3 suất" 
                      value={deal.badge || ''}
                      onChange={e => updateDeal(idx, 'badge', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú phụ (Note)</Label>
                    <Input 
                      placeholder="VD: Liệu trình 10 buổi - Bảo hành 5 năm" 
                      value={deal.note || ''}
                      onChange={e => updateDeal(idx, 'note', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

