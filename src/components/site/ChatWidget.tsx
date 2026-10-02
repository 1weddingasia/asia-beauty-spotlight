"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatWidget({ businessId, businessName }: { businessId: string, businessName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'system', content: string}[]>([
    { role: 'system', content: `Chào bạn, mình là trợ lý AI của ${businessName}. Mình có thể tư vấn bảng giá, dịch vụ hoặc giúp bạn đặt lịch hẹn. Bạn cần hỗ trợ gì ạ?` }
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
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: businessId,
          messages: [...messages.map(m => ({ role: m.role === 'system' ? 'assistant' : 'user', content: m.content })), { role: 'user', content: userMsg }]
        })
      });
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'system', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'system', content: "Xin lỗi, hiện tại hệ thống đang bận. Bạn vui lòng gọi hotline để được hỗ trợ nhé." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: "Mất kết nối mạng. Vui lòng thử lại sau." }]);
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
          className="fixed bottom-6 right-6 z-50 bg-gold text-ink p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 animate-bounce"
        >
          <MessageCircle className="size-6" />
          <span className="font-bold hidden md:inline">Chat với Tiệm</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col border border-border/50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-ink text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gold p-2 rounded-full">
                <Bot className="size-5 text-ink" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Trợ lý AI</h3>
                <p className="text-xs text-champagne">{businessName}</p>
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
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-gold text-ink rounded-tr-sm' : 'bg-white border shadow-sm rounded-tl-sm'}`}>
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
          <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập câu hỏi... (VD: Xin giá làm móng)"
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
