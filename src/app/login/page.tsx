"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if redirect to same URL
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Đã gửi link đăng nhập!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-champagne">
            <Shield className="size-6 text-gold" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">Admin Portal</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Đăng nhập vào trạm điều khiển bằng Email (Magic Link)
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-gold/30 bg-champagne p-6 text-center">
            <h3 className="font-semibold text-ink">Kiểm tra email của bạn</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Chúng tôi đã gửi một link đăng nhập an toàn đến <strong>{email}</strong>
            </p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => setSent(false)}>
              Thử email khác
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              required
              placeholder="admin@1beauty.asia"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
            <Button
              type="submit"
              className="h-12 w-full bg-gold text-ink hover:bg-gold/90 font-semibold tracking-wide"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Đăng nhập với Magic Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
