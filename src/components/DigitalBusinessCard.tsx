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
        {/* Very subtle discreet button on the bottom left */}
        <button
          className="fixed bottom-4 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-black/20 text-white/30 border border-white/10 hover:bg-gold/20 hover:text-gold hover:border-gold/30 backdrop-blur-md transition-all duration-300"
          title="Digital Business Card"
        >
          <span className="text-[9px] font-black">1B</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md w-full p-6 bg-transparent border-none shadow-none flex flex-col items-center overflow-y-auto max-h-[100dvh]">
        <DialogTitle className="sr-only">Thẻ liên hệ số — Lê Tấn Lợi</DialogTitle>
        <DialogDescription className="sr-only">Thông tin liên hệ và mã QR để lưu danh bạ.</DialogDescription>
        
        {/* The Card Design */}
        <div 
          ref={cardRef}
          className="relative w-[320px] h-[540px] shrink-0 text-white rounded-2xl overflow-hidden shadow-2xl border border-gold/30 flex flex-col items-center py-10 px-6"
          style={{
            backgroundImage: "url('/images/premium-card-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Subtle overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/60 z-0"></div>

          <div className="relative z-10 w-full h-full flex flex-col items-center">
            
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center bg-black/80 shadow-[0_0_15px_rgba(234,179,8,0.15)] mb-4">
              <span className="text-xl font-black bg-gradient-to-tr from-gold via-yellow-200 to-amber-600 bg-clip-text text-transparent">
                LTL
              </span>
            </div>

            {/* Name & Title */}
            <h2 className="text-2xl font-black font-display tracking-widest text-white drop-shadow-md">
              LÊ TẤN LỢI
            </h2>
            <p className="text-gold/70 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 mb-8">
              Founder & CEO
            </p>

            {/* Ecosystem Logos (Display Font) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 mb-8 border-y border-gold/20 py-6">
              {[
                "1Booking.Asia", 
                "1Beauty.Asia", 
                "1Learn.Asia", 
                "1Travel.Asia", 
                "MaisonDining.Asia"
              ].map((domain) => (
                <span key={domain} className="font-display text-lg font-medium tracking-wider bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                  {domain}
                </span>
              ))}
            </div>

            {/* Phone & QR Section */}
            <div className="w-full flex items-center justify-between px-2 mt-auto">
              <div className="flex flex-col items-start">
                <span className="text-gold/50 text-[10px] tracking-widest uppercase mb-1">Điện thoại</span>
                <span className="text-white font-bold tracking-widest text-sm">0918 731 411</span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl shadow-lg">
                <QRCodeSVG 
                  value={vCardData} 
                  size={64}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
            
          </div>
        </div>

        {/* Action Buttons (outside the capture area) */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6 w-[320px] shrink-0">
          <Button 
            onClick={downloadVCard} 
            variant="outline" 
            className="flex-1 rounded-xl bg-black/50 border-gold/30 text-gold hover:bg-gold hover:text-black backdrop-blur-md"
          >
            <Share2 className="w-4 h-4 mr-2" /> Lưu Danh Bạ
          </Button>
          <Button 
            onClick={downloadCardImage} 
            variant="outline"
            className="flex-1 rounded-xl bg-black/50 border-gold/30 text-gold hover:bg-gold hover:text-black backdrop-blur-md"
          >
            <Download className="w-4 h-4 mr-2" /> Tải Ảnh In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
