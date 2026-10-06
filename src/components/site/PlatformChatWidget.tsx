"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMsg = { id: string, role: 'user' | 'assistant' | 'error', content: string };

const getBubbleClass = (role: ChatMsg['role']) => {
  if (role === 'user') return 'bg-gold text-ink rounded-tr-sm';
  if (role === 'error') return 'bg-red-50 text-red-600 border border-red-200 shadow-sm rounded-tl-sm';
  return 'bg-white border shadow-sm rounded-tl-sm';
};

export function PlatformChatWidget({ mode = 'b2b' }: { mode?: 'b2b' | 'b2c' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '1', role: 'assistant', content: mode === 'b2b' 
      ? `Chào chủ tiệm, 1Beauty có thể giúp gì để tăng doanh thu cho quán bạn hôm nay?`
      : `Chào bạn, bạn đang tìm kiếm ưu đãi làm đẹp hoặc dịch vụ gì hôm nay? 1Beauty sẽ hỗ trợ bạn ngay!`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/platform-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => m.role !== 'error').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ],
          mode
        })
      });
      
      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        throw new Error(`Chat API error: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'error', content: "Xin lỗi, hiện tại hệ thống đang bận. Bạn vui lòng liên hệ admin để được hỗ trợ nhé." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'error', content: "Mất kết nối mạng. Vui lòng thử lại sau." }]);
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
          <span className="font-bold hidden md:inline">Trợ lý 1Beauty</span>
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
                <h3 className="font-bold text-sm leading-tight">1Beauty Xin chào!</h3>
                <p className="text-xs text-champagne">Hỗ trợ đối tác 24/7</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="size-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${getBubbleClass(msg.role)}`}>
                  {/* Tự động render hình ảnh nếu có cú pháp markdown ![alt](url) */}
                  {msg.content.split(/(!\[.*?\]\(.*?\))/g).map((part, i) => {
                    const match = part.match(/!\[(.*?)\]\((.*?)\)/);
                    if (match) {
                      const url = match[2];
                      // Validate URL to prevent XSS / arbitrary requests
                      if (url.startsWith('https://vietqr.app/') || url.startsWith('https://qr.sepay.vn/')) {
                        return <img key={i} src={url} alt={match[1]} loading="lazy" className="max-w-full rounded-md mt-2 shadow-sm border" />;
                      }
                      return <span key={i} className="text-red-500 text-xs italic">[Hình ảnh không hợp lệ]</span>;
                    }
                    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
                  })}
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
          <form onSubmit={handleSend} className="p-3 pb-4 md:pb-3 bg-white border-t flex gap-2 shrink-0">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'b2b' ? "Nhập câu hỏi... (VD: 1Beauty là gì?)" : "Nhập nhu cầu... (VD: Mình muốn tìm spa trị mụn)"}
              className="flex-1 rounded-full border-muted-foreground/20"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="rounded-full bg-gold text-ink hover:bg-gold/90 shrink-0" disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
