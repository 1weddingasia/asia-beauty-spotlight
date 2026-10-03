"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Sparkles, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Đăng nhập thất bại: " + error.message);
      } else {
        toast.success("Đăng nhập thành công!");
        const role = data.user?.user_metadata?.role;
        if (role === "admin" || role === "superadmin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error("Lỗi không mong muốn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "business", // default role for self-registered users
          }
        }
      });

      if (error) {
        toast.error("Đăng ký thất bại: " + error.message);
      } else {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        setView("login");
      }
    } catch (err: any) {
      toast.error("Lỗi không mong muốn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email của bạn");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Lỗi: " + error.message);
      } else {
        toast.success("Đã gửi link đặt lại mật khẩu! Vui lòng kiểm tra email.");
        setView("login");
      }
    } catch (err: any) {
      toast.error("Lỗi không mong muốn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Cột trái: Hình ảnh giới thiệu (ẩn trên mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-ink items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://placehold.co/1000x1500/000000/222222?text=Beauty+Texture')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-lg">
          <Link href="/" className="inline-block mb-12">
            <span className="font-display text-4xl text-white">1Beauty</span>
            <span className="text-gradient-gold font-display text-4xl">.Asia</span>
          </Link>
          
          <h1 className="text-4xl font-display text-white mb-6 leading-tight">
            Nền Tảng Quản Lý<br />Dành Cho Đối Tác
          </h1>
          <p className="text-champagne/80 text-lg leading-relaxed mb-8">
            Tham gia mạng lưới hơn 10.000+ Spa, Thẩm mỹ viện uy tín trên toàn quốc. Đưa dịch vụ của bạn đến gần hơn với hàng triệu khách hàng tiềm năng.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm font-semibold text-white/90">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-gold" /> Bảo mật an toàn
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold" /> Quản lý dễ dàng
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập/đăng ký */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-display text-3xl text-ink">1Beauty</span>
              <span className="text-gradient-gold font-display text-3xl">.Asia</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold tracking-tight text-ink">
              {view === "login" ? "Chào mừng trở lại" : view === "register" ? "Trở thành đối tác" : "Quên mật khẩu"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {view === "login" 
                ? "Đăng nhập để quản lý gian hàng của bạn" 
                : view === "register" 
                ? "Tạo tài khoản mới để bắt đầu kinh doanh"
                : "Nhập email để nhận liên kết đặt lại mật khẩu"}
            </p>
          </div>

          {/* Form Login */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="Email đăng nhập"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setView("register")} className="text-sm font-medium text-muted-foreground hover:text-ink transition-colors">
                  Chưa có tài khoản?
                </button>
                <button type="button" onClick={() => setView("forgot")} className="text-sm font-semibold text-gold hover:text-gold-soft transition-colors">
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-gold text-ink hover:bg-gold/90 font-bold tracking-wide rounded-xl shadow-lg shadow-gold/20 transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
              </Button>
            </form>
          )}

          {/* Form Register */}
          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    placeholder="Tên doanh nghiệp / Chủ shop"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 bg-white"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="Email liên hệ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="Tạo mật khẩu (Ít nhất 6 ký tự)"
                    value={password}
                    minLength={6}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-ink text-white hover:bg-ink/90 font-bold tracking-wide rounded-xl shadow-lg transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setView("login")} className="text-sm font-medium text-muted-foreground hover:text-ink transition-colors">
                  Đã có tài khoản? <span className="font-semibold text-gold">Đăng nhập</span>
                </button>
              </div>
            </form>
          )}

          {/* Form Forgot Password */}
          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-gold text-ink hover:bg-gold/90 font-bold tracking-wide rounded-xl shadow-lg shadow-gold/20 transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi link khôi phục"}
              </Button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setView("login")} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-ink transition-colors">
                  <ArrowLeft className="mr-2 size-4" /> Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          <div className="pt-8 text-center border-t border-border mt-8">
            <p className="text-xs text-muted-foreground">
              Bằng việc đăng nhập hoặc đăng ký, bạn đồng ý với <a href="#" className="underline">Điều khoản dịch vụ</a> và <a href="#" className="underline">Chính sách bảo mật</a> của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
