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
  const [tagline, setTagline] = useState(standeeTagline);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const standeeRef = useRef<HTMLDivElement>(null);

  const saveTagline = async () => {
    setIsSaving(true);
    try {
      // Import createClient dynamically or from top if we add it. 
      // I'll dynamically import it to avoid top-level require errors if not already imported.
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const newContent = { ...content, standee_tagline: tagline };
      const { error } = await supabase.from('businesses').update({ page_content: newContent }).eq('id', business.id);
      if (error) throw error;
      // You can use toast here if we import it
      alert("Đã lưu nội dung ưu đãi thành công!");
    } catch (e) {
      alert("Lỗi khi lưu, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const promoUrl = `https://1beauty.asia/${business.slug}`;
  // High-res QR for actual download
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(promoUrl)}&margin=10&color=3d2c00&bgcolor=fefdf8`;
  // Low-res QR for on-screen preview
  const demoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(promoUrl)}&margin=4&color=3d2c00`;

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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!business || !business.slug) return null;

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
            QUÉT MÃ NHẬN ƯU ĐÃI
          </div>
          <div style={{background: "#fff", border: "1.5px solid #c8960c", borderRadius: "6px", padding: "4px"}}>
            <img 
              src={demoQrUrl} 
              alt="QR" 
              style={{width: "60px", height: "60px", display: "block"}}
            />
          </div>
          <div style={{fontSize: "5px", color: "#7c5800", lineHeight: 1.5}}>
            Mở Camera / Zalo<br/>quét mã nhận ưu đãi ngay!
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[420px] p-6 max-h-[95vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-center">Xem trước Standee</DialogTitle>
          </DialogHeader>
          
          <div className="mb-4">
            <label className="text-sm font-semibold mb-1 block">Nội dung ưu đãi tùy chỉnh (Tùy chọn):</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="VD: Tặng ngay voucher 100k, Giảm 50%..." 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button onClick={saveTagline} disabled={isSaving} className="bg-gold text-white hover:bg-gold/90">
                Lưu
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sẽ đồng bộ với trang xem trước và bản in.</p>
          </div>

          {/* RESPONSIVE PREVIEW */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative overflow-hidden shadow-xl flex flex-col items-center justify-between py-6 px-4"
              style={{ 
                width: "100%", 
                maxWidth: "320px", 
                aspectRatio: "148/210",
                background: "linear-gradient(160deg, #fffbf0 0%, #fff8e1 50%, #fef3c7 100%)",
                border: "3px solid #c8960c",
                borderRadius: "16px",
                textAlign: "center"
              }}
            >
              <div className="w-full">
                <div className="bg-gold text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3 inline-block">
                  Chương trình ưu đãi
                </div>
                <div className="text-xl font-black text-[#1a0a00] leading-tight mb-2 uppercase">
                  {business.name}
                </div>
                <div className="text-[13px] font-extrabold text-gold leading-snug mb-1 uppercase">
                  QUÉT MÃ NHẬN ƯU ĐÃI & ĐẶT LỊCH
                </div>
                {tagline.trim() && (
                  <div className="text-sm font-bold text-rose-600 leading-snug mb-4">
                    {tagline}
                  </div>
                )}
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="bg-white border-2 border-gold rounded-xl p-3 shadow-lg">
                  <img 
                    src={demoQrUrl} 
                    alt="QR Code Preview" 
                    className="w-[150px] h-[150px] object-contain block"
                  />
                </div>
                <div className="text-[11px] text-[#7c5800] mt-3 leading-snug font-medium">
                  Mở Camera điện thoại hoặc Zalo<br/>quét mã nhận ưu đãi ngay! ✌️
                </div>
              </div>
              <div className="text-[8px] text-[#b39000] border-t border-[#e5c96a] pt-2 w-full mt-4 font-medium">
                Hệ thống đặt hẹn bảo trợ bởi 1Beauty.asia
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={downloadStandee} disabled={isDownloading} className="w-full bg-gold text-ink font-bold hover:bg-gold/90">
              {isDownloading ? "Đang tạo ảnh..." : "Tải xuống Ảnh (PNG)"}
            </Button>
            <Button onClick={downloadQR} variant="outline" className="w-full border-gold text-gold hover:bg-gold/10">
              Chỉ tải QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* OFF-SCREEN HIDDEN ELEMENT FOR HTML2CANVAS */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", pointerEvents: "none" }}>
        <div 
          ref={standeeRef}
          style={{
            width: "148mm", 
            height: "210mm",
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "16mm 14mm",
            background: "linear-gradient(160deg, #fffbf0 0%, #fff8e1 50%, #fef3c7 100%)",
            border: "4px solid #c8960c",
            borderRadius: "8mm",
            textAlign: "center",
            fontFamily: "'Be Vietnam Pro', sans-serif"
          }}
        >
          <div style={{width: "100%"}}>
            <div style={{background: "#c8960c", color: "#fff", fontSize: "16px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "8px 20px", borderRadius: "99px", marginBottom: "20px", display: "inline-block"}}>
              Chương trình ưu đãi
            </div>
            <div style={{fontSize: "36px", fontWeight: 900, color: "#1a0a00", lineHeight: 1.2, marginBottom: "16px", textTransform: "uppercase"}}>
              {business.name}
            </div>
            <div style={{fontSize: "24px", fontWeight: 800, color: "#c8960c", lineHeight: 1.4, marginBottom: "12px", textTransform: "uppercase"}}>
              QUÉT MÃ NHẬN ƯU ĐÃI & ĐẶT LỊCH
            </div>
            {tagline.trim() && (
              <div style={{fontSize: "22px", fontWeight: 700, color: "#d9381e", lineHeight: 1.3, marginBottom: "24px"}}>
                {tagline}
              </div>
            )}
          </div>
          <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{background: "#fff", border: "4px solid #c8960c", borderRadius: "16px", padding: "20px", boxShadow: "0 6px 32px rgba(200,150,12,0.25)"}}>
              <img 
                src={qrUrl} 
                alt="QR Code" 
                style={{width: "280px", height: "280px", display: "block"}}
                crossOrigin="anonymous"
              />
            </div>
            <div style={{fontSize: "18px", color: "#7c5800", marginTop: "24px", lineHeight: 1.5, fontWeight: 500}}>
              Mở Camera điện thoại hoặc Zalo<br/>quét mã nhận ưu đãi ngay! ✌️
            </div>
          </div>
          <div style={{fontSize: "12px", color: "#b39000", borderTop: "1px solid #e5c96a", paddingTop: "12px", width: "100%", marginTop: "32px", fontWeight: 500}}>
            Hệ thống đặt hẹn bảo trợ bởi 1Beauty.asia
          </div>
        </div>
      </div>
    </div>
  );
}
