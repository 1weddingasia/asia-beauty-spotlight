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
TEL;TYPE=CELL:0917731411
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
        {/* Discreet button in the bottom right corner */}
        <button
          className="fixed bottom-2 right-2 z-50 text-[10px] text-muted-foreground/30 hover:text-gold hover:bg-gold/10 px-2 py-1 rounded transition-all duration-300"
          title="Digital Business Card"
        >
          card visit
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Thẻ liên hệ số — Lê Tấn Lợi</DialogTitle>
        <DialogDescription className="sr-only">Thông tin liên hệ và mã QR để lưu danh bạ.</DialogDescription>
        
        {/* The Card Design */}
        <div 
          ref={cardRef}
          className="relative bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-gold/20"
        >
          {/* Background pattern / gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black z-0"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 z-0"></div>

          <div className="relative z-10 p-8 flex flex-col items-center text-center">
            {/* Header Logos */}
            <div className="flex items-center gap-4 mb-6 opacity-80">
              <span className="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-gold to-yellow-200 bg-clip-text text-transparent">
                1BOOKING
              </span>
              <div className="w-1 h-4 bg-gold/30"></div>
              <span className="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-gold to-yellow-200 bg-clip-text text-transparent">
                1BEAUTY
              </span>
            </div>

            {/* Avatar */}
            <div className="w-24 h-24 mb-4 rounded-full p-1 bg-gradient-to-tr from-gold via-yellow-200 to-amber-600 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                {/* Fallback avatar if no image provided yet */}
                <span className="text-3xl font-black text-gold">LTL</span>
              </div>
            </div>

            {/* Name & Title */}
            <h2 className="text-2xl font-bold font-display tracking-wide mb-1 text-white">
              LÊ TẤN LỢI
            </h2>
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-6">
              Founder & CEO
            </p>

            {/* Contact Info */}
            <div className="w-full space-y-3 mb-8 text-sm">
              <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <span className="text-slate-400">Điện thoại</span>
                <span className="font-semibold text-white tracking-wider">0917 731 411</span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-right text-xs">
                <span className="text-slate-400 text-left mb-1">Hệ sinh thái</span>
                <span className="text-gold font-medium">1beauty.asia</span>
                <span className="text-gold font-medium">1booking.asia</span>
                <span className="text-gold font-medium">1learn.asia</span>
                <span className="text-gold font-medium">1travel.asia</span>
                <span className="text-gold font-medium">maisondining.asia</span>
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
