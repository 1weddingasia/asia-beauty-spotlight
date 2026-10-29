"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { 
  Sparkles, 
  Building2, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Gift, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Globe, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

interface ServiceItem {
  name: string;
  price: string;
  desc: string;
}

interface DealItem {
  id: string;
  title: string;
  promoPrice: string;
  originalPrice: string;
  note: string;
  badge: string;
}

const BANNER_SLOT_COUNT = 3;
const SLIDE_HINTS = [
  "Mặt tiền hoặc sảnh tiếp khách",
  "Không gian dịch vụ / phòng vip",
  "Khuyến mãi hoặc dịch vụ hot",
];
const DEFAULT_DEAL_BADGES = ["HOT", "GIẢM 50%", "COMBO", "ƯU ĐÃI", "QUÀ TẶNG", "ĐẶC BIỆT"];

export function OnboardingDealClient() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    slug: string;
    name: string;
    previewUrl: string;
    email: string;
  } | null>(null);

  // Form states
  const [brandName, setBrandName] = useState("");
  const [categorySlug, setCategorySlug] = useState("spa-thu-gian");
  const [managerName, setManagerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [zalo, setZalo] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [hours, setHours] = useState("09:00 - 21:00");

  // Media: Hỗ trợ 3 Banner Slider
  const [logoUrl, setLogoUrl] = useState("");
  const [banners, setBanners] = useState<string[]>(Array(BANNER_SLOT_COUNT).fill(""));
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [tempGalleryInput, setTempGalleryInput] = useState("");

  // Deals: Hỗ trợ nhiều gói ưu đãi linh hoạt
  const [deals, setDeals] = useState<DealItem[]>([
    {
      id: "deal-1",
      title: "",
      promoPrice: "",
      originalPrice: "",
      note: "",
      badge: "HOT",
    },
  ]);

  const [services, setServices] = useState<ServiceItem[]>([
    { name: "", price: "", desc: "" },
  ]);

  const updateBanner = (index: number, url: string) => {
    setBanners((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const addDeal = () => {
    setDeals((prev) => {
      if (prev.length >= 6) {
        toast.info("Tối đa 6 gói ưu đãi để trang hiển thị tối ưu và đẹp mắt nhất.");
        return prev;
      }
      return [
        ...prev,
        {
          id: `deal-${Date.now()}-${prev.length}`,
          title: "",
          promoPrice: "",
          originalPrice: "",
          note: "",
          badge: DEFAULT_DEAL_BADGES[prev.length] ?? "ƯU ĐÃI",
        },
      ];
    });
  };

  const removeDeal = (index: number) => {
    setDeals((prev) => {
      if (prev.length <= 1) {
        toast.error("Phải có ít nhất 1 chương trình ưu đãi!");
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateDeal = (index: number, field: keyof DealItem, value: string) => {
    setDeals((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addService = () => {
    setServices((prev) => {
      if (prev.length >= 6) {
        toast.info("Tối đa 6 dịch vụ tiêu biểu để hiển thị đẹp nhất trên trang.");
        return prev;
      }
      return [...prev, { name: "", price: "", desc: "" }];
    });
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    setServices((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addGalleryImage = (url: string) => {
    if (!url) return;
    setGalleryUrls((prev) => {
      if (prev.length >= 8) {
        toast.info("Tối đa 8 ảnh thư viện.");
        return prev;
      }
      return [...prev, url];
    });
    setTempGalleryInput("");
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validate bắt buộc
    if (!brandName.trim()) {
      toast.error("Vui lòng nhập Tên cơ sở / Thương hiệu!");
      return;
    }
    if (!managerName.trim()) {
      toast.error("Vui lòng nhập Họ tên người quản lý / Đại diện!");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Vui lòng nhập Email hợp lệ để tạo tài khoản!");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên để bảo mật tài khoản!");
      return;
    }
    if (!phone.trim()) {
      toast.error("Vui lòng nhập Số điện thoại hotline!");
      return;
    }
    if (!address.trim()) {
      toast.error("Vui lòng nhập Địa chỉ cơ sở!");
      return;
    }
    const validDeals = deals.filter((d) => d.title.trim());
    if (validDeals.length === 0) {
      toast.error("Vui lòng nhập tên chương trình ưu đãi (ít nhất 1 gói)!");
      return;
    }

    setLoading(true);

    try {
      const cleanBanners = banners.filter((b) => b && b.trim() !== "");
      const payload = {
        type: "deal" as const,
        brandName: brandName.trim(),
        categorySlug,
        managerName: managerName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        zalo: zalo.trim() || phone.trim(),
        address: address.trim(),
        website: website.trim() || undefined,
        facebook: facebook.trim() || undefined,
        hours: hours.trim() || "09:00 - 21:00",
        logoUrl: logoUrl || undefined,
        bannerUrls: cleanBanners,
        galleryUrls: galleryUrls,
        deals: validDeals.map((d) => ({
          title: d.title.trim(),
          promoPrice: d.promoPrice.trim() || undefined,
          originalPrice: d.originalPrice.trim() || undefined,
          note: d.note.trim() || undefined,
          badge: d.badge.trim() || undefined,
        })),
        mainDeal: {
          title: validDeals[0].title.trim(),
          promoPrice: validDeals[0].promoPrice.trim() || undefined,
          originalPrice: validDeals[0].originalPrice.trim() || undefined,
          note: validDeals[0].note.trim() || undefined,
          badge: validDeals[0].badge.trim() || undefined,
        },
        services: services
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            price: s.price.trim() || undefined,
            desc: s.desc.trim() || undefined,
          })),
      };

      const res = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gửi thông tin thất bại.");
      }

      toast.success("Khởi tạo tài khoản & nộp hồ sơ thành công!");
      setSuccessData({
        slug: data.slug,
        name: data.name,
        previewUrl: data.previewUrl,
        email: email.trim().toLowerCase(),
      });
      setPassword("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // MÀN HÌNH THÀNH CÔNG
  if (successData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-card border border-border/80 rounded-2xl p-8 sm:p-10 shadow-xl text-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20">
            <CheckCircle2 className="size-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground mb-3">
            Hồ Sơ & Tài Khoản Đã Khởi Tạo Thành Công!
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
            Hệ thống đã tự động tạo tài khoản chính thức cho cơ sở <b className="text-foreground">{successData.name}</b>. AI đang trau chuốt nội dung và Ban Quản Trị đã nhận được thông báo qua Telegram để phê duyệt công khai.
          </p>

          {/* Hộp thông tin tài khoản */}
          <div className="bg-muted/40 border border-border rounded-xl p-5 text-left mb-8 max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gold">
              <ShieldCheck className="size-4" />
              <span>Thông Tin Tài Khoản Chính Thức Của Bạn:</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Tài khoản (Email): </span>
              <b className="text-foreground font-mono">{successData.email}</b>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Mật khẩu: </span>
              <span className="text-foreground italic">Mật khẩu bạn vừa đặt khi điền form</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border">
              💡 Bạn có thể dùng Email và Mật khẩu này để đăng nhập vào trang quản trị (Dashboard) bất kỳ lúc nào để theo dõi khách nhận ưu đãi và quản lý dịch vụ.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={successData.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold/90 text-background font-semibold transition-all shadow-md hover:shadow-gold/20"
            >
              <span>👁️ Xem Thử Trang Demo</span>
              <ExternalLink className="size-4" />
            </a>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition-all"
            >
              <span>🔐 Vào Trang Đăng Nhập Quản Trị</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header giới thiệu */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider border border-gold/20">
          <Sparkles className="size-3.5" />
          <span>Biên Soạn Tự Động Bằng Trí Tuệ Nhân Tạo (AI)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Đăng Ký & Gửi Thông Tin Gian Hàng Ưu Đãi
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Dành cho Spa, Thẩm mỹ viện, Salon tóc, Nails & Mi, Nha khoa và Cơ sở làm đẹp. 
          Điền thông tin và tải ảnh, hệ thống sẽ tự động tạo tài khoản chính thức và thiết lập trang ưu đãi chuẩn SEO cho quý cơ sở.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* KHỐI 1: TÀI KHOẢN QUẢN TRỊ CHÍNH THỨC */}
        <div className="bg-card border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-gold/15 text-gold">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">1. Tài Khoản Quản Trị Chính Thức</h2>
              <p className="text-xs text-muted-foreground">
                Tài khoản dùng để đăng nhập vào trang Quản lý (Dashboard) sau này
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 flex items-start gap-3 text-xs sm:text-sm text-foreground">
            <ShieldCheck className="size-5 text-gold shrink-0 mt-0.5" />
            <div>
              <b>Quy trình đăng ký tài khoản tự động:</b> Khi anh/chị điền Email & Mật khẩu bên dưới, hệ thống sẽ kích hoạt luôn tài khoản chính thức. Sau này anh/chị có thể vào trang <Link href="/login" className="text-gold font-bold underline" target="_blank">Đăng Nhập</Link> để tự quản lý ưu đãi, xem danh sách khách đặt hẹn mà không cần tạo lại tài khoản.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Họ và tên người quản lý / Chủ cơ sở <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="VD: Nguyễn Văn A"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Email đăng nhập chính thức <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="VD: spahoanggia@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Mật khẩu quản trị <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự (VD: 123456Aa)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Số điện thoại Hotline <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="VD: 0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Phone className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN CƠ SỞ & THƯƠNG HIỆU */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">2. Thông Tin Cơ Sở Kinh Doanh</h2>
              <p className="text-xs text-muted-foreground">Thông tin hiển thị công khai trên giao diện trang ưu đãi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Tên thương hiệu / Cơ sở <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="VD: Viện Chăm Sóc Sắc Đẹp Á Đông"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Lĩnh vực / Danh mục
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="spa-thu-gian">Spa & Massage Thư Giãn</option>
                <option value="clinic-tham-my">Thẩm Mỹ Viện & Clinic</option>
                <option value="salon-toc">Salon Tóc & Barber</option>
                <option value="nails-mi">Nails & Nối Mi Nghệ Thuật</option>
                <option value="nha-khoa">Nha Khoa Thẩm Mỹ</option>
                <option value="fitness-the-thao">Gym & Yoga & Fitness</option>
                <option value="other">Dịch Vụ Khác</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Địa chỉ cơ sở <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="VD: 123 Đường Số 1, Phường Tân Định, Quận 1, TP.HCM"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <MapPin className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Số Zalo nhận khách (nếu khác Hotline)</label>
              <Input
                placeholder="VD: 0901234567"
                value={zalo}
                onChange={(e) => setZalo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Khung giờ mở cửa</label>
              <div className="relative">
                <Input
                  placeholder="VD: 08:30 - 21:00 hàng ngày"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                <Clock className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Link Fanpage Facebook (nếu có)</label>
              <Input
                placeholder="VD: https://facebook.com/spahoanggia"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Link Website (nếu có)</label>
              <div className="relative">
                <Input
                  placeholder="VD: https://spahoanggia.vn"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Globe className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 3: TẢI HÌNH ẢNH TRỰC TIẾP */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-gold/15 text-gold">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">3. Tải Hình Ảnh Thương Hiệu & Không Gian</h2>
              <p className="text-xs text-muted-foreground">Tải ảnh trực tiếp từ điện thoại hoặc máy tính của bạn</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Logo */}
            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 space-y-3">
              <label className="text-sm font-semibold block">
                Logo Thương Hiệu (Ảnh vuông 1:1)
              </label>
              <div className="flex items-center gap-4">
                <ImageUpload
                  value={logoUrl}
                  onChange={(url) => setLogoUrl(url)}
                  className="w-24 h-24 rounded-full border-2 border-gold/40"
                  folder="onboarding/logos"
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Định dạng: PNG, JPG, WEBP</p>
                  <p>• Nên dùng ảnh nền trong suốt hoặc logo rõ nét</p>
                </div>
              </div>
            </div>

            {/* Bộ 3 Banner Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-sm font-semibold block">
                  Bộ 3 Banner Slider Trang Chủ (Tỷ lệ ngang 16:9)
                </label>
                <span className="text-xs text-gold font-medium">Hệ thống tự động chạy slider chuyển tiếp 3 ảnh</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tải lên tối đa 3 ảnh ngang để gian hàng hiển thị slider động 3 slide bắt mắt nhất khi khách ghé thăm trang.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: BANNER_SLOT_COUNT }).map((_, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-dashed border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {idx === 0 ? "Slide 1 (Chính) *" : `Slide ${idx + 1} (Tùy chọn)`}
                      </span>
                      {banners[idx] && (
                        <button
                          type="button"
                          onClick={() => updateBanner(idx, "")}
                          className="text-xs text-destructive hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="size-3" /> Xóa
                        </button>
                      )}
                    </div>
                    <ImageUpload
                      value={banners[idx]}
                      onChange={(url) => updateBanner(idx, url)}
                      className="w-full h-28 rounded-lg"
                      folder="onboarding/banners"
                    />
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {SLIDE_HINTS[idx] || "Ảnh không gian cơ sở"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thư viện ảnh gallery */}
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-sm font-semibold block">
              Thư Viện Ảnh Cơ Sở & Dịch Vụ ({galleryUrls.length}/8 ảnh)
            </label>
            <p className="text-xs text-muted-foreground">
              Tải thêm ảnh không gian, phòng ốc, thiết bị hoặc hình ảnh khách hàng trải nghiệm
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-destructive transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}

              {galleryUrls.length < 8 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center p-2">
                  <ImageUpload
                    value={tempGalleryInput}
                    onChange={(url) => addGalleryImage(url)}
                    className="w-full h-full border-none bg-transparent"
                    folder="onboarding/gallery"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KHỐI 4: GÓI ƯU ĐÃI & DỊCH VỤ TIÊU BIỂU */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold/15 text-gold">
                <Gift className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">4. Danh Sách Gói Ưu Đãi ({deals.length} gói) & Dịch Vụ</h2>
                <p className="text-xs text-muted-foreground">Thêm nhiều gói khuyến mãi để thu hút khách hàng nhận voucher trực tuyến</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDeal}
              className="gap-1.5 border-gold/40 text-gold hover:bg-gold/10 self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Thêm gói ưu đãi</span>
            </Button>
          </div>

          {/* Danh sách deals */}
          <div className="space-y-4">
            {deals.map((deal, idx) => (
              <div key={deal.id || idx} className="p-5 rounded-xl bg-muted/30 border border-border space-y-4 relative group">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold px-2 py-0.5 rounded bg-gold/15">
                      Gói Ưu Đãi #{idx + 1} {idx === 0 && "(Chính)"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Huy hiệu:</span>
                      <Input
                        placeholder="VD: HOT, GIẢM 50%, COMBO"
                        value={deal.badge}
                        onChange={(e) => updateDeal(idx, "badge", e.target.value)}
                        className="h-7 text-xs w-32 py-0"
                      />
                    </div>
                  </div>
                  {deals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeal(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Xóa gói ưu đãi này"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    Tên gói ưu đãi {idx === 0 && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    placeholder={idx === 0 
                      ? "VD: Trọn Gói Chăm Sóc Da Mặt Chuyên Sâu 9 Bước Thư Giãn" 
                      : `VD: Gói Dịch Vụ #${idx + 1} - Gội Đầu Dưỡng Sinh Thảo Mộc 60 Phút`}
                    value={deal.title}
                    onChange={(e) => updateDeal(idx, "title", e.target.value)}
                    required={idx === 0}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Giá ưu đãi (Khuyến mãi)</label>
                    <Input
                      placeholder="VD: 199.000đ hoặc Giảm 50%"
                      value={deal.promoPrice}
                      onChange={(e) => updateDeal(idx, "promoPrice", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Giá gốc (nếu có)</label>
                    <Input
                      placeholder="VD: 600.000đ"
                      value={deal.originalPrice}
                      onChange={(e) => updateDeal(idx, "originalPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Điều kiện hoặc Ghi chú áp dụng</label>
                  <Input
                    placeholder="VD: Áp dụng từ thứ 2 - thứ 6, vui lòng đặt lịch trước 2 tiếng"
                    value={deal.note}
                    onChange={(e) => updateDeal(idx, "note", e.target.value)}
                  />
                </div>
              </div>
            ))}

            {deals.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addDeal}
                className="w-full py-4 border-dashed border-gold/40 text-gold hover:bg-gold/10 gap-2 text-xs sm:text-sm"
              >
                <Plus className="size-4" />
                <span>Thêm chương trình ưu đãi khác ({deals.length}/6)</span>
              </Button>
            )}
          </div>

          {/* Dịch vụ tiêu biểu */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold block">Dịch Vụ Tiêu Biểu (Bảng giá tham khảo)</label>
                <span className="text-xs text-muted-foreground">Thêm 1 - 6 dịch vụ chính của quán</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addService}
                className="gap-1.5 border-gold/40 text-gold hover:bg-gold/10"
              >
                <Plus className="size-3.5" />
                <span>Thêm dịch vụ</span>
              </Button>
            </div>

            <div className="space-y-3">
              {services.map((srv, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-background space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold uppercase">Dịch vụ #{idx + 1}</span>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(idx)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <Input
                        placeholder="Tên dịch vụ (VD: Gội đầu dưỡng sinh thảo dược 60 phút)"
                        value={srv.name}
                        onChange={(e) => updateService(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Giá (VD: 150.000đ)"
                        value={srv.price}
                        onChange={(e) => updateService(idx, "price", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Input
                        placeholder="Mô tả ngắn gọn quy trình hoặc công dụng (nếu có)"
                        value={srv.desc}
                        onChange={(e) => updateService(idx, "desc", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NÚT SUBMIT */}
        <div className="pt-4 text-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-6 text-base font-bold bg-gold hover:bg-gold/90 text-background rounded-xl shadow-lg hover:shadow-gold/25 transition-all gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Đang Khởi Tạo Tài Khoản & Xử Lý AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                <span>Hoàn Tất & Gửi Kích Hoạt Gian Hàng</span>
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            Sau khi bấm, hệ thống sẽ tạo tài khoản chính thức cho bạn và gửi thông báo kiểm duyệt tới Admin 1Booking/1Beauty.
          </p>
        </div>
      </form>
    </div>
  );
}
