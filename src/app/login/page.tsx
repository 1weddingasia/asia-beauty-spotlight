"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Đăng nhập thất bại: " + error.message);
      setLoading(false);
    } else {
      toast.success("Đăng nhập thành công!");
      const role = data.user?.user_metadata?.role;
      if (role === "admin" || role === "superadmin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-champagne">
            <Shield className="size-6 text-gold" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">Đăng nhập</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Truy cập hệ thống quản trị
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            required
            placeholder="Email đăng nhập"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
          <Input
            type="password"
            required
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />
          
          <div className="flex justify-end">
            <a href="/lien-he" className="text-xs text-muted-foreground hover:text-gold transition-colors">
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            className="h-12 w-full bg-gold text-ink hover:bg-gold/90 font-semibold tracking-wide"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
          </Button>
        </form>
      </div>
    </div>
  );
}
