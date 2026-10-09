"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DigitalBusinessCard() {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const vCardData = `BEGIN:VCARD
VERSION:3.0
N:Lê;Tấn Lợi;;;
FN:Lê Tấn Lợi
ORG:1Booking & 1Beauty
TITLE:Founder & CEO
TEL;TYPE=CELL:0918731411
URL:https://1booking.asia
URL:https://1beauty.asia
URL:https://1learn.asia
URL:https://1travel.asia
URL:https://maisondining.asia
END:VCARD`;

  const downloadCardImage = async () => {
    if (!cardRef.current) return;
    try {
      // Temporarily hide some buttons during capture if needed, 
      // but we will only capture the card inner div anyway.
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High resolution for printing
        backgroundColor: "#0f172a", // slate-900
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "Le-Tan-Loi-Business-Card.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate card image", err);
      toast.error("Không thể tạo ảnh thẻ. Vui lòng thử lại.");
    }
  };

  const downloadVCard = () => {
    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Le-Tan-Loi.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Discreet button positioned on the right */}
        <button
          className="fixed bottom-4 right-20 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold/60 border border-gold/20 hover:bg-gold hover:text-ink hover:scale-110 shadow-lg backdrop-blur-sm transition-all duration-300 group"
          title="Digital Business Card"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider group-hover:hidden">Card</span>
          <span className="hidden text-xs font-black group-hover:block">1B</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Thẻ liên hệ số — Lê Tấn Lợi</DialogTitle>
        <DialogDescription className="sr-only">Thông tin liên hệ và mã QR để lưu danh bạ.</DialogDescription>
        
        {/* The Card Design */}
        <div 
          ref={cardRef}
          className="relative text-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/40"
          style={{
            backgroundImage: "url('/images/premium-card-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Subtle overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          <div className="relative z-10 p-8 flex flex-col items-center text-center">
            {/* Header Logos */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display font-black text-xl tracking-wider text-white drop-shadow-md">
                1BOOKING
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
              <span className="font-display font-black text-xl tracking-wider text-white drop-shadow-md">
                1BEAUTY
              </span>
            </div>

            {/* Avatar */}
            <div className="w-28 h-28 mb-5 rounded-full p-1 bg-gradient-to-tr from-gold via-yellow-200 to-amber-600 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center overflow-hidden border border-black/50 backdrop-blur-sm">
                <span className="text-4xl font-black bg-gradient-to-tr from-gold via-yellow-200 to-amber-600 bg-clip-text text-transparent drop-shadow-md">
                  LTL
                </span>
              </div>
            </div>

            {/* Name & Title */}
            <h2 className="text-3xl font-black font-display tracking-widest mb-1 text-white drop-shadow-lg">
              LÊ TẤN LỢI
            </h2>
            <p className="text-gold text-sm font-bold tracking-[0.2em] uppercase mb-8 drop-shadow-md">
              Founder & CEO
            </p>

            {/* Contact Info */}
            <div className="w-full space-y-3 mb-8 text-sm">
              <div className="flex justify-between items-center px-5 py-3 bg-black/50 backdrop-blur-md rounded-xl border border-gold/20 shadow-inner">
                <span className="text-gold/70 font-medium tracking-wider uppercase text-xs">Điện thoại</span>
                <span className="font-bold text-white tracking-widest text-base">0918 731 411</span>
              </div>
              <div className="flex flex-col gap-1.5 px-5 py-4 bg-black/50 backdrop-blur-md rounded-xl border border-gold/20 text-right shadow-inner">
                <span className="text-gold/70 text-left mb-2 font-medium tracking-wider uppercase text-xs border-b border-gold/20 pb-2">Hệ sinh thái</span>
                <span className="text-white font-semibold tracking-wider">1beauty.asia</span>
                <span className="text-white font-semibold tracking-wider">1booking.asia</span>
                <span className="text-white font-semibold tracking-wider">1learn.asia</span>
                <span className="text-white font-semibold tracking-wider">1travel.asia</span>
                <span className="text-white font-semibold tracking-wider">maisondining.asia</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white p-3 rounded-xl shadow-inner mb-2 flex flex-col items-center">
              <QRCodeSVG 
                value={vCardData} 
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">
              Quét để lưu danh bạ
            </p>
          </div>
        </div>

        {/* Action Buttons (outside the capture area) */}
        <div className="flex justify-center gap-3 mt-4">
          <Button 
            onClick={downloadVCard} 
            variant="outline" 
            className="rounded-full bg-slate-900 border-gold/30 text-gold hover:bg-gold hover:text-slate-900"
          >
            <Share2 className="w-4 h-4 mr-2" /> Lưu Danh Bạ
          </Button>
          <Button 
            onClick={downloadCardImage} 
            variant="outline"
            className="rounded-full bg-slate-900 border-gold/30 text-gold hover:bg-gold hover:text-slate-900"
          >
            <Download className="w-4 h-4 mr-2" /> Tải Ảnh In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
