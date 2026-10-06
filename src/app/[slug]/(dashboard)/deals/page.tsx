"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2 } from "lucide-react";
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
  valid_from?: string;
  valid_until?: string;
  terms?: string;
};

type CrossSell = {
  id: string;
  name: string;
  price: string;
  status: "active" | "paused";
};

export default function DealsManagementPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [crossSells, setCrossSells] = useState<CrossSell[]>([]);

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
              note: o.description || o.note || "",
              status: "active",
              valid_until: o.validUntil || o.valid_until || "",
              terms: o.terms || ""
            }));
          } else if (content.featured_deal) {
            existingDeals = [{
              id: generateId(),
              title: content.featured_deal,
              original_price: "Liên hệ",
              promo_price: "Ưu đãi",
              badge: "Độc Quyền 1Beauty",
              note: "",
              status: "active",
              valid_from: "",
              valid_until: "",
              terms: ""
            }];
          }
        }
        setDeals(existingDeals);

        let existingCrossSells = Array.isArray(content.cross_sells) ? content.cross_sells : [];
        setCrossSells(existingCrossSells);

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
        deals: cleanDeals,
        cross_sells: crossSells
      };

      const { error } = await supabase
        .from("businesses")
        .update({ page_content: updatedContent })
        .eq("id", business.id);

      if (error) throw error;
      
      // Update local state
      setBusiness({ ...business, page_content: updatedContent });
      setDeals(cleanDeals);
      setCrossSells(crossSells);
      toast.success("Đã lưu cấu hình Ưu đãi & Mua kèm!");
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
        status: "active",
        valid_from: "",
        valid_until: "",
        terms: ""
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

  const addCrossSell = () => {
    setCrossSells([
      ...crossSells,
      {
        id: generateId(),
        name: "",
        price: "",
        status: "active"
      }
    ]);
  };

  const updateCrossSell = (index: number, field: keyof CrossSell, value: CrossSell[keyof CrossSell]) => {
    const newCS = [...crossSells];
    newCS[index] = { ...newCS[index], [field]: value };
    setCrossSells(newCS);
  };

  const removeCrossSell = (index: number) => {
    setCrossSells(crossSells.filter((_, i) => i !== index));
  };


  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải cấu hình...</div>;
  if (!business) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy thông tin doanh nghiệp.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Quản lý Ưu đãi (Deals)</h1>
          <p className="text-muted-foreground text-sm mt-1">Cài đặt các gói ưu đãi và cấu hình mua kèm.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 w-full md:w-auto">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
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
              <div key={deal.id || idx} className={`p-5 rounded-xl border transition-colors ${deal.status === 'paused' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gold/30 shadow-sm'}`}>
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-gray-200">
                  <h3 className={`font-bold ${deal.status === 'paused' ? 'text-gray-400' : 'text-gold'}`}>
                    Gói Ưu đãi {idx + 1}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className={`text-xs ${deal.status !== 'paused' ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        {deal.status !== 'paused' ? 'Đang bật' : 'Tạm dừng'}
                      </Label>
                      <Switch 
                        checked={deal.status !== 'paused'}
                        onCheckedChange={(checked) => updateDeal(idx, 'status', checked ? 'active' : 'paused')}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeDeal(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label>Thời gian bắt đầu (Tùy chọn)</Label>
                    <Input 
                      type="datetime-local"
                      value={deal.valid_from || ''}
                      onChange={e => updateDeal(idx, 'valid_from', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian kết thúc (Hết hạn)</Label>
                    <Input 
                      type="datetime-local"
                      value={deal.valid_until || ''}
                      onChange={e => updateDeal(idx, 'valid_until', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ghi chú phụ (Note)</Label>
                    <Input 
                      placeholder="VD: Liệu trình 10 buổi - Bảo hành 5 năm" 
                      value={deal.note || ''}
                      onChange={e => updateDeal(idx, 'note', e.target.value)}
                      className={deal.status === 'paused' ? 'opacity-70' : ''}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Điều kiện áp dụng</Label>
                    <Textarea 
                      placeholder="VD: Chỉ áp dụng cho khách hàng mới, Không áp dụng chung với các chương trình khác..." 
                      value={deal.terms || ''}
                      onChange={e => updateDeal(idx, 'terms', e.target.value)}
                      className={`resize-none min-h-[80px] ${deal.status === 'paused' ? 'opacity-70' : ''}`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cross-Sell Management Section */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-ink text-purple-700">Dịch vụ & Sản phẩm mua kèm (Cross-sell/Upsell)</h2>
            <p className="text-sm text-muted-foreground">Khách có thể chọn mua thêm các sản phẩm này trong popup đặt lịch.</p>
          </div>
          <Button onClick={addCrossSell} variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
            <Plus className="size-4 mr-2" /> Thêm Mua Kèm
          </Button>
        </div>

        <div className="space-y-4">
          {crossSells.length === 0 ? (
            <div className="text-center py-6 bg-purple-50/50 border border-dashed rounded-xl">
              <p className="text-muted-foreground">Chưa có sản phẩm mua kèm nào. Gợi ý mua kèm giúp gia tăng doanh thu trên mỗi khách hàng!</p>
            </div>
          ) : (
            crossSells.map((cs, idx) => (
              <div key={cs.id || idx} className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center gap-4 ${cs.status === 'paused' ? 'bg-gray-50 border-gray-200' : 'bg-white border-purple-200 shadow-sm'}`}>
                <div className="hidden md:flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Tên Sản phẩm / Dịch vụ</Label>
                  <Input 
                    placeholder="VD: Tinh dầu dưỡng tóc, Mặt nạ phục hồi..." 
                    value={cs.name}
                    onChange={e => updateCrossSell(idx, 'name', e.target.value)}
                    className={cs.status === 'paused' ? 'opacity-70' : ''}
                  />
                </div>
                <div className="w-full md:w-48 space-y-2">
                  <Label>Giá bán</Label>
                  <Input 
                    placeholder="VD: 150.000đ" 
                    value={cs.price}
                    onChange={e => updateCrossSell(idx, 'price', e.target.value)}
                    className={cs.status === 'paused' ? 'opacity-70' : ''}
                  />
                </div>
                <div className="flex items-center gap-4 mt-6 md:mt-0 pt-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500 whitespace-nowrap">
                      {cs.status !== 'paused' ? 'Hiện' : 'Ẩn'}
                    </Label>
                    <Switch 
                      checked={cs.status !== 'paused'}
                      onCheckedChange={(checked) => updateCrossSell(idx, 'status', checked ? 'active' : 'paused')}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCrossSell(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

