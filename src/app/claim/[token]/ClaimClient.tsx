"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Loader2 } from "lucide-react";
import { claimBusinessAction } from "@/app/actions/claim";

export default function ClaimClient({ business, token }: { business: any, token: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Sign up the user (or sign in if they already exist)
      let authUserId = null;
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        if (signInError.message.includes("Invalid login")) {
           // Maybe user doesn't exist, let's try sign up
           const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
             email,
             password,
           });
           
           if (signUpError) {
             throw new Error(signUpError.message);
           }
           
           if (signUpData.user) {
             authUserId = signUpData.user.id;
           }
        } else {
          throw new Error(signInError.message);
        }
      } else if (signInData.user) {
        authUserId = signInData.user.id;
      }
      
      if (!authUserId) {
        throw new Error("Không thể xác thực tài khoản. Vui lòng thử lại.");
      }
      
      // 2. Call Server Action to update database securely
      const result = await claimBusinessAction(token, authUserId);
      if (!result.success) {
        throw new Error(result.error || "Có lỗi xảy ra khi bàn giao.");
      }
      
      toast.success("Bàn giao thành công! Đang chuyển hướng đến bảng điều khiển...");
      router.push("/dashboard/profile");
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-12 rounded-full bg-gold/20 flex items-center justify-center mb-4 text-gold">
            <Store className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">Đăng ký Quản lý</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Tạo tài khoản để nhận bàn giao và quản lý nội dung cho cơ sở <b>{business.name}</b>.
          </p>
        </div>
        
        <form onSubmit={handleClaim} className="space-y-4">
          <div className="space-y-2">
            <Label>Email quản lý</Label>
            <Input 
              type="email" 
              required 
              placeholder="admin@spa.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Mật khẩu (ít nhất 6 ký tự)</Label>
            <Input 
              type="password" 
              required 
              placeholder="••••••••" 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-6" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {loading ? "Đang xử lý..." : "Đăng ký & Bắt đầu Quản lý"}
          </Button>
        </form>
      </div>
    </div>
  );
}
