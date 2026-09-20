"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, X, Building, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UsersClient({ initialProfiles, businesses }: { initialProfiles: any[], businesses: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, business_id: businessId })
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Tạo tài khoản thành công!");
        setIsModalOpen(false);
        setEmail("");
        setPassword("");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.")) return;
    
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Đã xóa tài khoản!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Lỗi khi xóa!");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Thành viên & Phân quyền</h2>
          <p className="text-muted-foreground mt-2">Quản lý User, Admin và Cấp tài khoản cho Doanh nghiệp.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gold text-ink hover:bg-gold/90">
          <Plus className="mr-2 size-4" /> Tạo tài khoản
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò (Role)</TableHead>
              <TableHead>Doanh nghiệp sở hữu</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!initialProfiles || initialProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Không có dữ liệu.</TableCell>
              </TableRow>
            ) : (
              initialProfiles.map((p) => {
                const ownedBusiness = businesses.find(b => b.owner_id === p.id);
                
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.role === 'admin' ? <Shield className="size-3" /> : <Building className="size-3" />}
                        {p.role === 'admin' ? 'Quản trị viên' : 'Chủ doanh nghiệp'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {ownedBusiness ? (
                        <span className="text-sm font-medium text-gold">{ownedBusiness.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">---</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right">
                      {p.role !== 'admin' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(p.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Tạo Tài Khoản Khách Hàng</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email khách hàng..." />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu khởi tạo</Label>
                <Input type="text" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
              </div>
              <div className="space-y-2">
                <Label>Phân quyền</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="owner">Chủ doanh nghiệp (Chỉ sửa trang của mình)</option>
                  <option value="admin">Quản trị viên (Toàn quyền hệ thống)</option>
                </select>
              </div>
              
              {role === 'owner' && (
                <div className="space-y-2">
                  <Label>Gắn quyền sở hữu Doanh nghiệp</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    value={businessId} 
                    onChange={e => setBusinessId(e.target.value)}
                  >
                    <option value="">-- Chọn doanh nghiệp --</option>
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <Button type="submit" className="w-full bg-gold text-ink hover:bg-gold/90 mt-4" disabled={loading}>
                {loading ? "Đang xử lý..." : "Cấp tài khoản"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
