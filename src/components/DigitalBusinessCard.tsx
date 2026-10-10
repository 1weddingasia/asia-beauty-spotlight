"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DigitalBusinessCard() {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const DOMAINS = [
    "1Booking.Asia",
    "1Beauty.Asia",
    "1Learn.Asia",
    "1Travel.Asia",
    "MaisonDining.Asia"
  ];

  const vCardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Lê;Tấn Lợi;;;",
    "FN:Lê Tấn Lợi",
    "ORG:1Booking & 1Beauty",
    "TITLE:Founder & CEO",
    "TEL;TYPE=CELL:0918731411",
    ...DOMAINS.map(d => `URL:https://${d.toLowerCase()}`),
    "END:VCARD"
  ].join("\r\n");

  const downloadCardImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
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
          className="fixed bottom-4 left-4 z-[99] flex items-center justify-center w-10 h-10 rounded-full bg-black/20 text-white/30 border border-white/10 hover:bg-gold/20 hover:text-gold hover:border-gold/30 backdrop-blur-md transition-all duration-300"
          title="Digital Business Card"
          aria-label="Thẻ liên hệ số Lê Tấn Lợi"
        >
          <span className="text-[10px] font-black">1B</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="w-auto p-4 md:p-6 bg-transparent border-none shadow-none flex flex-col items-center">
        <DialogTitle className="sr-only">Thẻ liên hệ số — Lê Tấn Lợi</DialogTitle>
        <DialogDescription className="sr-only">Thông tin liên hệ và mã QR để lưu danh bạ.</DialogDescription>
        
        {/* The Card Design */}
        <div 
          ref={cardRef}
          className="relative w-[280px] h-[460px] shrink-0 text-white rounded-2xl overflow-hidden shadow-2xl border border-gold/30 flex flex-col items-center py-6 px-5"
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
            <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center bg-black/80 shadow-[0_0_15px_rgba(234,179,8,0.15)] mb-3">
              <span className="text-sm font-black bg-gradient-to-tr from-gold via-yellow-200 to-amber-600 bg-clip-text text-transparent">
                LTL
              </span>
            </div>

            {/* Name & Title */}
            <h2 className="text-xl font-medium font-display tracking-[0.2em] text-white drop-shadow-md">
              LÊ TẤN LỢI
            </h2>
            <p className="text-gold/80 text-[9px] font-bold tracking-[0.3em] uppercase mt-1.5 mb-5">
              Founder & CEO
            </p>

            {/* Ecosystem Logos (Display Font) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-3 mb-5 border-y border-gold/20 py-4">
              {DOMAINS.map((domain) => (
                <span key={domain} className="font-display italic text-[15px] font-medium tracking-widest bg-gradient-to-r from-gold via-yellow-100 to-gold bg-clip-text text-transparent drop-shadow-sm">
                  {domain}
                </span>
              ))}
            </div>

            {/* Phone & QR Section */}
            <div className="w-full flex items-center justify-between px-1 mt-auto">
              <div className="flex flex-col items-start">
                <span className="text-gold/50 text-[9px] tracking-widest uppercase mb-1">Điện thoại</span>
                <span className="text-white font-bold tracking-widest text-xs">0918 731 411</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/95 p-1.5 rounded-lg shadow-lg">
                  <QRCodeSVG 
                    value={vCardData} 
                    size={68}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[8px] font-medium tracking-wide text-gold/80 mt-1 uppercase text-center w-full">
                  Quét lưu danh bạ
                </span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Action Buttons (outside the capture area) */}
        <div className="flex justify-center gap-2 mt-4 w-[280px] shrink-0">
          <Button 
            onClick={downloadVCard} 
            variant="outline" 
            className="flex-1 rounded-xl bg-black/50 border-gold/30 text-gold hover:bg-gold hover:text-black backdrop-blur-md text-xs h-10"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Lưu Danh Bạ
          </Button>
          <Button 
            onClick={downloadCardImage} 
            variant="outline"
            className="flex-1 rounded-xl bg-black/50 border-gold/30 text-gold hover:bg-gold hover:text-black backdrop-blur-md text-xs h-10"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Tải Ảnh In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
