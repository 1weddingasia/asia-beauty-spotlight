"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Plus, Pencil, Trash2, Eye, Upload, Link as LinkIcon, Sparkles, ToggleLeft, 
  Clock, Ban, CheckCircle2, ShieldCheck, UserCheck, CalendarPlus, Check, ChevronDown 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createOrUpdateOwner } from "@/app/actions/admin";
import { adminManageMembershipAction } from "@/app/actions/membership";

function AccountCell({ business }: { business: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (business.owner_id) {
    const ownerEmail = business.profiles?.email || "Đã có chủ sở hữu";
    return (
      <div className="flex flex-col gap-0.5 max-w-[160px]">
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 truncate" title={ownerEmail}>
          <UserCheck className="size-3 text-emerald-600 shrink-0" />
          <span className="truncate">{ownerEmail}</span>
        </span>
        <span className="text-[10px] text-slate-400">Đã tiếp quản</span>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!email || !password) return toast.error("Nhập đủ email & mật khẩu");
    setLoading(true);
    const res = await createOrUpdateOwner(email, password, business.id);
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
      return;
    }
    toast.success("Cấp tài khoản thành công!");
    setLoading(false);
    router.refresh();
  };

  const copyClaimLink = () => {
    if (!business.claim_token) return toast.error("Không tìm thấy mã bàn giao.");
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://1beauty.asia';
    const link = `${origin}/claim/${business.claim_token}`;
    navigator.clipboard.writeText(link);
    toast.success("Đã sao chép link bàn giao trang!");
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[150px]">
      <div className="flex items-center gap-1">
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={copyClaimLink}
          className="h-6 text-[11px] px-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-bold"
          title="Sao chép link gửi cho chủ tiệm đăng ký"
        >
          <LinkIcon className="size-3 mr-1" /> Link bàn giao
        </Button>
      </div>

      <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
        <Input placeholder="Email cấp sẵn" value={email} onChange={e => setEmail(e.target.value)} className="h-6 text-[11px]" />
        <Input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} className="h-6 text-[11px]" />
        <Button onClick={handleCreate} disabled={loading} size="sm" className="h-6 text-[11px] bg-gold text-ink hover:bg-gold/90 font-bold">
          {loading ? "..." : "Cấp TK"}
        </Button>
      </div>
    </div>
  );
}

function MembershipCell({ business }: { business: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const mem = business.memberships?.[0];
  const now = new Date();
  const rawExp = mem?.expires_at ? new Date(mem.expires_at) : null;
  const fallbackExp = new Date(new Date(business.created_at || now).getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryDate = rawExp || fallbackExp;

  const msLeft = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const isExpired = msLeft <= 0;

  const memStatus = mem?.status || (business.plan_tier === 'premium' ? 'active' : 'trial');
  const planName = mem?.plans?.name || (business.category_slug?.includes('am-thuc') || business.category_slug?.includes('tiec') ? 'Gói Trang Đặt Tiệc' : 'Gói Trang Ưu Đãi');
  const formattedExpiry = expiryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleAction = async (action: "extend_trial_30" | "activate_udai_1year" | "activate_tiec_1year") => {
    const label = action === "extend_trial_30" ? "Tặng thêm 30 ngày dùng thử" : action === "activate_udai_1year" ? "Kích hoạt Gói Ưu Đãi (1 năm)" : "Kích hoạt Gói Đặt Tiệc (1 năm)";
    if (!confirm(`Xác nhận: ${label} cho "${business.name}"?`)) return;

    setLoading(true);
    const res = await adminManageMembershipAction({
      businessId: business.id,
      action
    });

    if (res.success) {
      toast.success(`Đã thực hiện: ${label}`);
      router.refresh();
    } else {
      toast.error(res.error || "Thao tác thất bại.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-1 min-w-[170px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
          memStatus === 'active' && !isExpired
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : isExpired
            ? 'bg-rose-100 text-rose-800 border border-rose-300'
            : 'bg-amber-100 text-amber-900 border border-gold/40'
        }`}>
          {memStatus === 'active' && !isExpired ? (
            <><CheckCircle2 className="size-3 text-emerald-600" /> Chính thức</>
          ) : isExpired ? (
            <><Clock className="size-3 text-rose-600" /> Hết hạn</>
          ) : (
            <><Sparkles className="size-3 text-amber-600" /> Dùng thử</>
          )}
        </span>
        <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px]" title={planName}>
          {planName}
        </span>
      </div>

      <p className="text-[11px] text-slate-500">
        Hạn: <strong className="text-slate-900">{formattedExpiry}</strong> ({daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết'})
      </p>

      {/* Nút thao tác nhanh của Admin */}
      <div className="flex items-center gap-1 pt-1 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleAction("extend_trial_30")}
          className="h-5 text-[10px] px-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
          title="Tặng thêm 30 ngày dùng thử miễn phí"
        >
          +30N Thử
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleAction("activate_udai_1year")}
          className="h-5 text-[10px] px-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
          title="Kích hoạt chính thức 1 năm Gói Trang Ưu Đãi"
        >
          1N Ưu Đãi
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleAction("activate_tiec_1year")}
          className="h-5 text-[10px] px-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
          title="Kích hoạt chính thức 1 năm Gói Trang Đặt Tiệc"
        >
          1N Tiệc
        </Button>
      </div>
    </div>
  );
}

export default function BusinessesClient({ initialBusinesses }: { initialBusinesses: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  const handleQuickPromo = async (id: string, name: string) => {
    if (!confirm(`Tạo nhanh trang ưu đãi & tài khoản doanh nghiệp cho "${name}"?`)) return;

    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/quick-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: id })
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
        return;
      }

      const { email, password } = data.account;
      const accountInfo = `Email: ${email}\nMật khẩu: ${password}\n\nLink: https://1beauty.asia${data.promoLink}`;
      
      navigator.clipboard.writeText(accountInfo);
      toast.success("Đã tạo thành công! Thông tin tài khoản đã được copy vào clipboard.", { duration: 8000 });
      router.refresh();
    } catch (err: any) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa doanh nghiệp "${name}"? Hành động này không thể hoàn tác.`)) return;

    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã xóa doanh nghiệp!");
      router.refresh();
    }
  };

  // Cycle: published ↔ suspended
  const cycleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'published' : 'suspended';
    const label = nextStatus === 'published' ? 'Kích hoạt hoạt động' : 'Tạm ngưng';
    if (!confirm(`Đổi trạng thái sang "${label}"?`)) return;

    setLoadingStatusId(id);
    const { error } = await supabase.from('businesses').update({ status: nextStatus }).eq('id', id);
    if (error) {
      toast.error('Lỗi: ' + error.message);
    } else {
      toast.success(`Đã đổi trạng thái → ${label}`);
      router.refresh();
    }
    setLoadingStatusId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Quản lý Doanh nghiệp</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Quản trị toàn bộ cơ sở, bàn giao tài khoản và kích hoạt gói thành viên trực tiếp từ cơ sở dữ liệu.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/categories">Danh mục</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/locations">Địa điểm</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
            <Link href="/admin/businesses/import">
              <Upload className="mr-2 size-4" />
              Nạp dữ liệu
            </Link>
          </Button>
          <Button asChild className="bg-gold text-ink hover:bg-gold/90 font-bold">
            <Link href="/admin/businesses/new">
              <Plus className="mr-2 size-4" />
              Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Tên Doanh Nghiệp</TableHead>
              <TableHead className="font-bold">Gói Thành Viên & Hạn Dùng</TableHead>
              <TableHead className="font-bold">Trạng Thái</TableHead>
              <TableHead className="font-bold">Tài Khoản / Bàn Giao</TableHead>
              <TableHead className="font-bold">Danh Mục</TableHead>
              <TableHead className="font-bold">Địa Điểm</TableHead>
              <TableHead className="text-right font-bold">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!initialBusinesses || initialBusinesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              initialBusinesses.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{b.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{b.slug}</span>
                    </div>
                  </TableCell>
                  
                  {/* Cột Gói Thành Viên & Hạn Dùng Thật từ DB */}
                  <TableCell>
                    <MembershipCell business={b} />
                  </TableCell>

                  {/* Trạng thái hiển thị */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        b.status === 'published' || b.status === 'active' ? 'bg-green-100 text-green-800' : 
                        b.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status === 'suspended' ? <><Ban className="size-3" /> Tạm ngưng</>
                          : (b.status === 'published' || b.status === 'active') ? <><CheckCircle2 className="size-3" /> Hoạt động</>
                          : b.status}
                      </span>
                      {b.is_featured && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Cột Tài khoản / Bàn giao */}
                  <TableCell>
                    <AccountCell business={b} />
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    {b.business_categories && b.business_categories.length > 0 
                      ? b.business_categories.map((c: any) => c.directory_categories?.name).filter(Boolean).join(", ") 
                      : (b.category_slug || "---")}
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    {b.business_locations && b.business_locations.length > 0
                      ? b.business_locations.map((l: any) => l.directory_locations?.name).filter(Boolean).join(", ")
                      : (b.location || "---")}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Xem trang ưu đãi */}
                      <Button variant="ghost" size="icon" asChild title="Xem trang ưu đãi">
                        <Link href={`/${b.slug}`} target="_blank">
                          <Eye className="size-4 text-gold" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Chỉnh sửa">
                        <Link href={`/admin/businesses/${b.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      {/* Nút đổi trạng thái: active / suspended */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title={`Đổi trạng thái (hiện: ${b.status})`}
                        disabled={loadingStatusId === b.id}
                        onClick={() => cycleStatus(b.id, b.status)}
                        className={b.status === 'suspended' ? 'text-red-500' : 'text-green-600'}
                      >
                        <ToggleLeft className={`size-4 ${loadingStatusId === b.id ? 'animate-spin' : ''}`} />
                      </Button>
                      {!b.owner_id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Tạo Nhanh Trang Ưu Đãi & TK Doanh Nghiệp"
                          disabled={loadingId === b.id}
                          onClick={() => handleQuickPromo(b.id, b.name)}
                        >
                          <Sparkles className={`size-4 text-amber-500 ${loadingId === b.id ? 'animate-pulse' : ''}`} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(b.id, b.name)} 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
