"use client";

import { QrCode, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPrintQR({ business }: { business: any }) {
  let content = business.page_content || {};
  if (typeof content === 'string') {
    try { content = JSON.parse(content); } catch (e) {}
  }
  const standeeTagline = content.standee_tagline || "";

  const handlePrint = () => {
    const promoUrl = `https://1beauty.asia/${business.slug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(promoUrl)}&margin=10&color=3d2c00&bgcolor=fefdf8`;
    const escapedName = business.name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
      
    const printContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Mã QR Standee A5 - ${escapedName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Be Vietnam Pro', sans-serif; background: #fff; }
          @page { size: A5 portrait; margin: 0; }
          .standee {
            width: 148mm; height: 210mm;
            display: flex; flex-direction: column;
            align-items: center; justify-content: space-between;
            padding: 14mm 12mm;
            background: linear-gradient(160deg, #fffbf0 0%, #fff8e1 50%, #fef3c7 100%);
            border: 3px solid #c8960c;
            border-radius: 8mm;
            text-align: center;
            page-break-after: avoid;
          }
          .top-badge { background: #c8960c; color: #fff; font-size: 9pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 16px; border-radius: 99px; margin-bottom: 4mm; }
          .shop-name { font-size: 18pt; font-weight: 900; color: #1a0a00; line-height: 1.2; margin-bottom: 2mm; }
          .headline { font-size: 13pt; font-weight: 700; color: #c8960c; line-height: 1.3; margin-bottom: 6mm; }
          .qr-wrap { background: #fff; border: 3px solid #c8960c; border-radius: 6mm; padding: 6mm; box-shadow: 0 4px 24px rgba(200,150,12,0.2); }
          .qr-img { display: block; width: 50mm; height: 50mm; }
          .instructions { font-size: 9pt; color: #7c5800; margin-top: 5mm; line-height: 1.5; }
          .footer { font-size: 7pt; color: #b39000; border-top: 1px solid #e5c96a; padding-top: 4mm; width: 100%; }
        </style>
      </head>
      <body>
        <div class="standee">
          <div>
            <div class="top-badge">Chương trình ưu đãi đặc quyền</div>
            <div class="shop-name">${escapedName}</div>
            ${standeeTagline.trim() ? '<div class="headline">QUÉT MÃ – NHẬN ƯU ĐÃI<br/>' + standeeTagline.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>' : '<div class="headline">QUÉT MÃ<br/>NHẬN ƯU ĐÃI</div>'}
          </div>
          <div>
            <div class="qr-wrap">
              <img class="qr-img" src="${qrUrl}" alt="QR Code" />
            </div>
            <div class="instructions">Mở Camera điện thoại hoặc Zalo<br/>quét mã nhận ưu đãi trong 3 giây ✌️</div>
          </div>
          <div class="footer">Hệ thống đặt hẹn bảo trợ bởi 1Beauty.asia</div>
        </div>
      </body>
      </html>
    `;
    const printWin = window.open('', '_blank', 'width=600,height=800');
    if (!printWin) { alert("Trình duyệt chặn popup! Hãy cho phép popup và thử lại."); return; }
    printWin.document.write(printContent);
    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 1200);
  };

  const downloadQR = async () => {
    try {
      const promoUrl = `https://1beauty.asia/${business.slug}`;
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

  const demoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://1beauty.asia/${business.slug}`)}&margin=4&color=3d2c00`;

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
            Tải mã QR hoặc In Bảng để bàn (chuẩn khổ A5) với thiết kế chuyên nghiệp kiểu Momo. 
            Thích hợp để dán tại quầy lễ tân, bàn tư vấn hoặc trên các ấn phẩm truyền thông để khách dễ dàng quét và nhận ưu đãi, booking ngay lập tức.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handlePrint} className="bg-gold text-ink font-bold hover:bg-gold/90 transition-all hover:scale-105 shadow-md shadow-gold/20">
            <Printer className="mr-2 size-4" /> In Bảng QR Để Bàn (A5)
          </Button>
          <Button onClick={downloadQR} variant="outline" className="border-gold text-gold hover:bg-gold/10 transition-all hover:scale-105">
            <QrCode className="mr-2 size-4" /> Tải QR Ảnh (PNG)
          </Button>
        </div>
      </div>

      <div className="shrink-0 relative z-10 w-full md:w-auto flex justify-center">
        {/* Standee Preview Box */}
        <div 
          onClick={handlePrint}
          title="Nhấn để in ngay"
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
    </div>
  );
}
