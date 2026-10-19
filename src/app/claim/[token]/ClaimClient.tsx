"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Loader2, Sparkles, CheckCircle2, ShieldCheck, Eye, EyeOff, MapPin, Phone, ArrowRight, UserCheck } from "lucide-react";
import { registerAndClaimAction, claimBusinessAction } from "@/app/actions/claim";

export default function ClaimClient({ business, token }: { business: any, token: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");

  // Register state
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState(business.phone || "");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Xử lý Đăng ký tài khoản mới và nhận bàn giao
  const handleRegisterAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Mật khẩu phải có tối thiểu 6 ký tự.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi Server Action tạo tài khoản và kích hoạt tiếp quản với 30 ngày dùng thử
      const res = await registerAndClaimAction(token, {
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Có lỗi xảy ra khi tạo tài khoản và tiếp quản.");
      }

      // 2. Đăng nhập ngay trên trình duyệt
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: regEmail.trim(),
        password: regPassword,
      });

      if (signInError) {
        console.warn("Auto sign in failed, routing to login:", signInError);
        toast.success("Tiếp quản thành công! Vui lòng đăng nhập với tài khoản vừa tạo.");
        router.push("/login");
        return;
      }

      toast.success("Chúc mừng! Bạn đã tiếp quản thành công với 30 ngày dùng thử miễn phí.");
      const targetUrl = res.slug ? `/${res.slug}/dashboard` : "/dashboard";
      router.push(targetUrl);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi trong quá trình tiếp quản.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng nhập với tài khoản đã có và nhận bàn giao
  const handleLoginAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      // 1. Đăng nhập trước
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (signInError || !signInData.user) {
        throw new Error(
          signInError?.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không chính xác."
            : (signInError?.message || "Không thể đăng nhập.")
        );
      }

      // 2. Gắn quyền sở hữu
      const res = await claimBusinessAction(token);
      if (!res.success) {
        throw new Error(res.error || "Không thể tiếp quản cơ sở này.");
      }

      toast.success("Tiếp quản thành công! Đang chuyển hướng về bảng điều khiển...");
      const targetUrl = res.slug ? `/${res.slug}/dashboard` : "/dashboard";
      router.push(targetUrl);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra sự cố.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-6">
        
        {/* Card Tóm Tắt Doanh Nghiệp Được Bàn Giao */}
        <div className="bg-slate-900/90 border border-gold/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0">
              <Store className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[11px] font-bold mb-1.5 uppercase tracking-wide">
                <Sparkles className="size-3" /> Xác Nhận Quyền Sở Hữu Gian Hàng
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white truncate" title={business.name}>
                {business.name}
              </h1>
              {business.address && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                  <MapPin className="size-3.5 text-slate-400 shrink-0" />
                  <span>{business.address}</span>
                </p>
              )}
              {business.phone && (
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  <span>{business.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Banner 30 Ngày Dùng Thử Miễn Phí */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3 bg-emerald-950/40 border-emerald-500/30 border rounded-xl p-3 text-xs text-emerald-300">
            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
            <div className="leading-snug">
              <strong className="text-white block font-semibold">Tặng ngay 30 ngày dùng thử miễn phí toàn diện</strong>
              <span>Trang của bạn đã được khởi tạo sẵn sàng đón khách. Hãy thiết lập tài khoản quản lý để tiếp quản.</span>
            </div>
          </div>
        </div>

        {/* Khung Đăng Ký / Đăng Nhập Quản Lý */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs Selector */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-slate-800 text-gold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserCheck className="size-4" />
              <span>Tạo Tài Khoản Mới</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-slate-800 text-gold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="size-4" />
              <span>Đã Có Tài Khoản</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "register" ? (
              /* FORM ĐĂNG KÝ MỚI */
              <form onSubmit={handleRegisterAndClaim} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">Đăng Ký Tài Khoản Quản Lý</h2>
                  <p className="text-xs text-slate-400">
                    Tài khoản và mật khẩu này sẽ dùng để đăng nhập vào Bảng điều khiển quản trị trang của quán.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">Họ và tên người đại diện *</Label>
                  <Input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus:border-gold"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">Email đăng nhập *</Label>
                    <Input
                      type="email"
                      required
                      placeholder="admin@tenquan.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">Số điện thoại liên hệ</Label>
                    <Input
                      type="tel"
                      placeholder="0909123456"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">Mật khẩu đăng nhập *</Label>
                    <div className="relative">
                      <Input
                        type={showRegPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-10 pr-9 focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">Nhập lại mật khẩu *</Label>
                    <Input
                      type={showRegPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Xác nhận lại mật khẩu"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus:border-gold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-ink font-bold h-11 text-sm hover:brightness-105 shadow-lg shadow-gold/10"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                    <span>{loading ? "Đang khởi tạo tài khoản..." : "Đăng Ký & Tiếp Quản Gian Hàng (Miễn Phí 30 Ngày)"}</span>
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Bằng việc bấm đăng ký, bạn có toàn quyền cập nhật thông tin thực đơn, ưu đãi, bảng giá và nhận thông báo khách đặt bàn.
                </p>
              </form>
            ) : (
              /* FORM ĐĂNG NHẬP SẴN */
              <form onSubmit={handleLoginAndClaim} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">Đăng Nhập Tài Khoản Quản Lý</h2>
                  <p className="text-xs text-slate-400">
                    Nếu bạn đã có tài khoản trên hệ thống, hãy đăng nhập để gắn quyền quản lý gian hàng <b>{business.name}</b>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">Email tài khoản</Label>
                  <Input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 pr-9 focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-ink font-bold h-11 text-sm hover:brightness-105"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <ArrowRight className="size-4 mr-2" />}
                    <span>{loading ? "Đang xác thực..." : "Đăng Nhập & Tiếp Quản Ngay"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer trợ giúp */}
        <p className="text-center text-xs text-slate-500">
          Cần hỗ trợ bàn giao? Liên hệ Hotline ban quản trị: <strong className="text-slate-400">0909 123 456</strong>
        </p>

      </div>
    </div>
  );
}
