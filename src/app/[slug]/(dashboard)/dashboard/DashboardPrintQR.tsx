"use client";

import { useRef, useState } from "react";
import { QrCode, Printer, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";

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
    setIsDownloading(true);
    try {
      const qrCanvas = document.getElementById("qr-code-canvas-hd") as HTMLCanvasElement;
      if (!qrCanvas) throw new Error("QR Canvas không tồn tại");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D không hỗ trợ");

      // Set dimensions (A5 aspect ratio, high resolution)
      canvas.width = 1480;
      canvas.height = 2100;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#fffbf0");
      gradient.addColorStop(0.5, "#fff8e1");
      gradient.addColorStop(1, "#fef3c7");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = "#c8960c";
      ctx.lineWidth = 40;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Helper function for rounded rectangles to ensure broad compatibility
      const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      // Top badge
      ctx.fillStyle = "#c8960c";
      drawRoundRect(canvas.width / 2 - 250, 150, 500, 70, 35);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CHƯƠNG TRÌNH ƯU ĐÃI", canvas.width / 2, 185);

      // Business Name
      ctx.fillStyle = "#1a0a00";
      ctx.font = "900 70px sans-serif";
      // Handle long names
      const maxNameWidth = canvas.width - 200;
      let nameText = (business.name || "").toUpperCase();
      if (ctx.measureText(nameText).width > maxNameWidth) {
        ctx.font = "900 55px sans-serif";
      }
      ctx.fillText(nameText, canvas.width / 2, 320);

      // Subtitle
      ctx.fillStyle = "#c8960c";
      ctx.font = "800 45px sans-serif";
      ctx.fillText("QUÉT MÃ NHẬN ƯU ĐÃI & ĐẶT LỊCH", canvas.width / 2, 420);

      // Tagline
      if (tagline && tagline.trim()) {
        ctx.fillStyle = "#d9381e";
        ctx.font = "bold 40px sans-serif";
        ctx.fillText(tagline.trim(), canvas.width / 2, 510);
      }

      // Draw QR Code Background Box
      const qrSize = 760;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 660;
      
      ctx.shadowColor = "rgba(200,150,12,0.25)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "#ffffff";
      drawRoundRect(qrX - 40, qrY - 40, qrSize + 80, qrSize + 80, 30);
      ctx.fill();
      
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#c8960c";
      ctx.lineWidth = 10;
      ctx.stroke();

      // Draw actual QR Code from hidden canvas
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // Bottom Text
      ctx.fillStyle = "#7c5800";
      ctx.font = "500 38px sans-serif";
      ctx.fillText("Mở Camera điện thoại hoặc Zalo", canvas.width / 2, qrY + qrSize + 110);
      ctx.fillText("quét mã nhận ưu đãi ngay! ✌️", canvas.width / 2, qrY + qrSize + 170);

      // Footer line
      ctx.strokeStyle = "#e5c96a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 300, canvas.height - 150);
      ctx.lineTo(canvas.width / 2 + 300, canvas.height - 150);
      ctx.stroke();

      // Footer text
      ctx.fillStyle = "#b39000";
      ctx.font = "500 24px sans-serif";
      ctx.fillText("Hệ thống đặt hẹn bảo trợ bởi 1Beauty.asia", canvas.width / 2, canvas.height - 100);

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `Standee_${business.slug}.png`;
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
      const canvas = document.getElementById("qr-code-canvas-hd") as HTMLCanvasElement;
      if (!canvas) throw new Error("Canvas không tồn tại");
      const image = canvas.toDataURL("image/png");
      
      const link = document.createElement("a");
      link.href = image;
      link.download = `QR_Code_${business.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Không thể tải mã QR lúc này.");
    }
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!business || !business.slug) return null;

  return (
    <>
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
            <QRCodeCanvas 
              value={promoUrl}
              size={60}
              fgColor="#3d2c00"
              level="M"
              marginSize={0}
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
                  <QRCodeCanvas 
                    value={promoUrl}
                    size={150}
                    fgColor="#3d2c00"
                    level="Q"
                    marginSize={1}
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
    </div>

    <div style={{ display: "none" }}>
      <QRCodeCanvas 
        id="qr-code-canvas-hd"
        value={promoUrl}
        size={1000}
        fgColor="#3d2c00"
        level="H"
        marginSize={2}
      />
    </div>
    </>
  );
}
