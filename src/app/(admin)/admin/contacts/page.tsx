import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Tin nhắn liên hệ | Admin Portal",
};

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts, error } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Hộp thư tin nhắn</h2>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Người liên hệ</th>
                <th className="p-4 font-medium">Doanh nghiệp</th>
                <th className="p-4 font-medium">Số điện thoại</th>
                <th className="p-4 font-medium">Nội dung</th>
                <th className="p-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-red-500">
                    Lỗi tải dữ liệu: {error.message}. (Vui lòng kiểm tra đã tạo table contact_requests chưa)
                  </td>
                </tr>
              ) : !contacts || contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Chưa có tin nhắn liên hệ nào.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {new Date(c.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-4 font-medium">{c.contact_name}</td>
                    <td className="p-4">{c.business_name}</td>
                    <td className="p-4">{c.phone}</td>
                    <td className="p-4 max-w-xs truncate" title={c.message}>{c.message}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {c.status === 'new' ? 'Mới' : 'Đã xử lý'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
