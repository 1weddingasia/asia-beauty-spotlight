"use client";

import { useRef, useState } from "react";
import { QrCode, Printer, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import html2canvas from "html2canvas";

export default function DashboardPrintQR({ business }: { business: any }) {
  let content = business.page_content || {};
  if (typeof content === 'string') {
    try { content = JSON.parse(content); } catch (e) {}
  }
  const standeeTagline = content.standee_tagline || "";
  const [isDownloading, setIsDownloading] = useState(false);
  const standeeRef = useRef<HTMLDivElement>(null);

  const promoUrl = `https://1beauty.asia/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(promoUrl)}&margin=10&color=3d2c00&bgcolor=fefdf8`;
  
  const escapedName = business.name
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const downloadStandee = async () => {
    if (!standeeRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(standeeRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Standee_QR_${business.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi khi tạo ảnh Standee:", error);
      alert("Không thể tải ảnh lúc này.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadQR = async () => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(promoUrl)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`QR API error: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `QR_Code_${business.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(error);
      alert("Không thể tải mã QR lúc này.");
    }
  };

  if (!business || !business.slug) return null;

  const demoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(promoUrl)}&margin=4&color=3d2c00`;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="mt-8 rounded-xl border bg-card shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <QrCode className="size-40 text-gold" />
      </div>
      <div className="flex-1 relative z-10 space-y-4">
        <div>
          <h3 className="font-bold text-xl text-ink flex items-center gap-2">
            <QrCode className="size-6 text-gold" /> Mã QR Gian Hàng & Ưu Đãi
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Tải mã QR hoặc xem trước Bảng để bàn (chuẩn khổ A5) với thiết kế chuyên nghiệp. 
            Thích hợp để dán tại quầy lễ tân, bàn tư vấn hoặc trên ấn phẩm truyền thông.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setIsPreviewOpen(true)} className="bg-gold text-ink font-bold hover:bg-gold/90 transition-all hover:scale-105 shadow-md shadow-gold/20">
            <Eye className="mr-2 size-4" /> Xem trước & Tải Bảng (A5)
          </Button>

          <Button onClick={downloadQR} variant="outline" className="border-gold text-gold hover:bg-gold/10 transition-all hover:scale-105">
            <QrCode className="mr-2 size-4" /> Tải QR Ảnh (PNG)
          </Button>
        </div>
      </div>

      <div className="shrink-0 relative z-10 w-full md:w-auto flex justify-center">
        <div 
          onClick={() => setIsPreviewOpen(true)}
          title="Nhấn để xem trước"
          className="cursor-pointer group relative"
          style={{
            width: "140px", 
            minHeight: "200px", 
            background: "linear-gradient(160deg, #fffbf0, #fef3c7)", 
            border: "2px solid #c8960c", 
            borderRadius: "8px", 
            padding: "10px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "6px", 
            textAlign: "center",
            boxShadow: "0 10px 25px -5px rgba(200, 150, 12, 0.2), 0 8px 10px -6px rgba(200, 150, 12, 0.1)"
          }}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all rounded-[6px]" />
          <div style={{background: "#c8960c", color: "#fff", fontSize: "5px", fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "99px", textTransform: "uppercase"}}>
            Chương trình ưu đãi
          </div>
          <div style={{fontSize: "9px", fontWeight: 900, color: "#1a0a00", lineHeight: 1.2}}>
            {business.name}
          </div>
          <div style={{fontSize: "7px", fontWeight: 700, color: "#c8960c", lineHeight: 1.3}}>
            QUÉT MÃ - NHẬN ƯU ĐÃI
          </div>
          <div style={{background: "#fff", border: "1.5px solid #c8960c", borderRadius: "6px", padding: "4px"}}>
            <img 
              src={demoQrUrl} 
              alt="QR" 
              style={{width: "60px", height: "60px", display: "block"}}
            />
          </div>
          <div style={{fontSize: "5px", color: "#7c5800", lineHeight: 1.5}}>
            Mở Camera / Zalo<br/>quét mã nhận ưu đãi trong 3s
          </div>
          <div style={{fontSize: "4px", color: "#b39000", borderTop: "1px solid #e5c96a", paddingTop: "4px", width: "100%", marginTop: "auto"}}>
            Bảo trợ bởi 1Beauty.asia
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[420px] p-6 max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">Xem trước Standee</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center mb-6">
            <div 
              ref={standeeRef}
              style={{
                width: "148mm", 
                height: "210mm",
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "14mm 12mm",
                background: "linear-gradient(160deg, #fffbf0 0%, #fff8e1 50%, #fef3c7 100%)",
                border: "3px solid #c8960c",
                borderRadius: "8mm",
                textAlign: "center",
                transformOrigin: "top center",
                transform: "scale(0.6)",
                marginBottom: "-80px", // adjust for scaling layout shift
                fontFamily: "'Be Vietnam Pro', sans-serif"
              }}
            >
              <div style={{width: "100%"}}>
                <div style={{background: "#c8960c", color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", borderRadius: "99px", marginBottom: "16px", display: "inline-block"}}>
                  Chương trình ưu đãi
                </div>
                <div style={{fontSize: "24px", fontWeight: 900, color: "#1a0a00", lineHeight: 1.2, marginBottom: "8px"}}>
                  {business.name}
                </div>
                {standeeTagline.trim() ? (
                  <div style={{fontSize: "18px", fontWeight: 700, color: "#c8960c", lineHeight: 1.3, marginBottom: "24px"}}>
                    QUÉT MÃ – NHẬN ƯU ĐÃI<br/>{standeeTagline}
                  </div>
                ) : (
                  <div style={{fontSize: "18px", fontWeight: 700, color: "#c8960c", lineHeight: 1.3, marginBottom: "24px"}}>
                    QUÉT MÃ<br/>NHẬN ƯU ĐÃI
                  </div>
                )}
              </div>
              <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div style={{background: "#fff", border: "3px solid #c8960c", borderRadius: "12px", padding: "16px", boxShadow: "0 4px 24px rgba(200,150,12,0.2)"}}>
                  <img 
                    src={qrUrl} 
                    alt="QR Code" 
                    style={{width: "180px", height: "180px", display: "block"}}
                    crossOrigin="anonymous"
                  />
                </div>
                <div style={{fontSize: "14px", color: "#7c5800", marginTop: "20px", lineHeight: 1.5}}>
                  Mở Camera điện thoại hoặc Zalo<br/>quét mã nhận ưu đãi trong 3 giây ✌️
                </div>
              </div>
              <div style={{fontSize: "10px", color: "#b39000", borderTop: "1px solid #e5c96a", paddingTop: "12px", width: "100%", marginTop: "20px"}}>
                Hệ thống đặt hẹn bảo trợ bởi 1Beauty.asia
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={downloadStandee} disabled={isDownloading} className="w-full bg-gold text-ink font-bold hover:bg-gold/90">
              {isDownloading ? "Đang tạo ảnh..." : "Tải xuống Ảnh (PNG)"}
            </Button>
            <Button onClick={downloadQR} variant="outline" className="w-full border-gold text-gold hover:bg-gold/10">
              Chỉ tải QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
