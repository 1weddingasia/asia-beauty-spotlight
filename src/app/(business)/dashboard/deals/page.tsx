"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, Send, MessageCircle } from "lucide-react";
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

  const [telegramId, setTelegramId] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("businesses").select("*").eq("owner_id", user.id).single().then(({ data }) => {
          if (data) {
            setBusiness(data);
            const content = data.page_content || {};
            setTelegramId(content.telegram_chat_id || "");
            
            // Normalize existing deals
            let existingDeals = content.deals || [];
            if (existingDeals.length === 0 && content.featured_deal) {
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
            setDeals(existingDeals);
          }
          setLoading(false);
        });
      }
    });
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
      toast.error("Lỗi khi lưu: " + err.message);
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

  const updateDeal = (index: number, field: keyof Deal, value: string) => {
    const newDeals = [...deals];
    newDeals[index] = { ...newDeals[index], [field]: value };
    setDeals(newDeals);
  };

  const removeDeal = (index: number) => {
    setDeals(deals.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải cấu hình...</div>;
  if (!business) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy thông tin doanh nghiệp.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Quản lý Ưu đãi (Deals)</h1>
          <p className="text-muted-foreground text-sm mt-1">Cài đặt các gói ưu đãi và Cấu hình nhận thông báo qua Telegram.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 w-full md:w-auto">
          <Save className="mr-2 size-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
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
