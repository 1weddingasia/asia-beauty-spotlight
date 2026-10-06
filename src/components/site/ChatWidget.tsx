"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ChatWidget({ businessId, businessName, slug }: { businessId: string, businessName: string, slug?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'system'|'error', content: string}[]>([
    { role: 'system', content: `${businessName} Xin chào! Em có thể hỗ trợ gì cho anh chị?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load admin token from session storage if exists
  const [adminToken, setAdminToken] = useState<string | null>(null);
  
  const getAdminTokenKey = (slug?: string, businessId?: string) => `adminToken:${slug || businessId}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(getAdminTokenKey(slug, businessId));
        if (stored) setAdminToken(stored);
        
        // Auto open after 1 minute, only once per session
        const autoOpenKey = `hasAutoOpenedChat:${slug || businessId}`;
        if (!sessionStorage.getItem(autoOpenKey)) {
          const timer = setTimeout(() => {
            setIsOpen(true);
            try { sessionStorage.setItem(autoOpenKey, "true"); } catch (e) {}
          }, 60000); // 1 minute
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn("SessionStorage not available (possibly in-app browser)");
        // Fallback for auto open if sessionStorage is blocked
        const timer = setTimeout(() => setIsOpen(true), 60000);
        return () => clearTimeout(timer);
      }
    }
  }, [slug, businessId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || businessId,
          adminToken,
          messages: [
            ...messages.filter(m => m.role !== 'error').map(m => ({ role: m.role === 'system' ? 'assistant' : 'user', content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      });
      
      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.adminToken && data.adminToken !== adminToken) {
        setAdminToken(data.adminToken);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(getAdminTokenKey(slug, businessId), data.adminToken);
          } catch (e) {}
        }
      }

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'system', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'error', content: "Xin lỗi, hiện tại hệ thống đang bận. Bạn vui lòng thử lại sau nhé." }]);
      }

      if (data.dataUpdated) {
        toast.success("Đã cập nhật dữ liệu thành công!");
        router.refresh();
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'error', content: "Mất kết nối mạng. Vui lòng thử lại sau." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[90px] md:bottom-6 right-4 md:right-6 z-[45] bg-gold text-ink p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 animate-bounce"
        >
          <MessageCircle className="size-6" />
          <span className="font-bold hidden md:inline">Chat với Tiệm</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] w-full md:inset-auto md:bottom-6 md:right-6 md:w-[350px] md:h-[500px] md:max-h-[calc(100vh-120px)] bg-white md:rounded-2xl shadow-2xl flex flex-col border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-ink text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-gold p-2 rounded-full">
                <MessageCircle className="size-5 text-ink" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">{businessName} Xin chào! {adminToken ? '(Admin)' : ''}</h3>
                <p className="text-xs text-champagne">Sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="size-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-gold text-ink rounded-tr-sm' 
                    : msg.role === 'error'
                      ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm rounded-tl-sm'
                      : 'bg-white border shadow-sm rounded-tl-sm whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white border-t flex flex-col shrink-0 pb-4 md:pb-0">
            {adminToken && (
              <div className="p-3 pb-0">
                <div className="text-[11px] text-green-600 font-medium mb-2 flex items-center justify-between">
                  <span>🛡️ Chế độ Quản trị</span>
                  <span className="text-muted-foreground font-normal">Tự động khoá sau 2h</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2 leading-tight">
                  💡 <b>Mẹo:</b> Để thay hình (Logo, Banner, Dịch vụ...), hãy copy 1 đường link ảnh (từ Facebook, Zalo, Web...) và dán vào chat: "Đổi banner thành link: ..."
                </p>
                <div className="flex flex-wrap gap-1.5 pb-2 border-b border-muted/30">
                  <button type="button" onClick={() => setInput("Sửa giá dịch vụ: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">💰 Đổi giá</button>
                  <button type="button" onClick={() => setInput("Thêm dịch vụ mới: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">➕ Thêm DV</button>
                  <button type="button" onClick={() => setInput("Thay logo thành link: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">🖼️ Thay Logo</button>
                  <button type="button" onClick={() => setInput("Thay banner thành link: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">🖼️ Thay Banner</button>
                  <button type="button" onClick={() => setInput("Đổi ảnh dịch vụ ... thành link: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">📷 Ảnh Dịch vụ</button>
                  <button type="button" onClick={() => setInput("Đổi ảnh ưu đãi ... thành link: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">📷 Ảnh Ưu đãi</button>
                  <button type="button" onClick={() => setInput("Cập nhật thông tin liên hệ: SĐT ..., Địa chỉ ...")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">📞 Đổi Liên hệ</button>
                  <button type="button" onClick={() => setInput("Đổi mã bảo mật của tôi thành: ")} className="text-[11px] px-2.5 py-1 bg-green-50/50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition whitespace-nowrap">🔐 Đổi Pass</button>
                  <button type="button" onClick={() => setInput("Cho tôi xin link đăng nhập trang quản trị")} className="text-[11px] px-2.5 py-1 bg-rose-50/50 text-rose-700 rounded-full border border-rose-200 hover:bg-rose-100 transition whitespace-nowrap">🔑 Vào Quản Trị</button>
                </div>
              </div>
            )}
            <form onSubmit={handleSend} className="p-3 flex gap-2">
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={adminToken ? "Nhập lệnh... (Sửa giá/dịch vụ)" : "Nhập câu hỏi... (VD: Xin giá)"}
                className="flex-1 rounded-full border-muted-foreground/20"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="rounded-full bg-gold text-ink hover:bg-gold/90 shrink-0" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
