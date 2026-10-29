"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { 
  Sparkles, 
  UtensilsCrossed, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  PartyPopper, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  FileText, 
  Globe,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckSquare,
  Square
} from "lucide-react";

interface SetMenuItem {
  name: string;
  price: string;
  dishes: string;
}

interface PartyDealItem {
  id: string;
  title: string;
  promoPrice: string;
  originalPrice: string;
  note: string;
  badge: string;
}

const BANNER_SLOT_COUNT = 3;
const PARTY_SLIDE_HINTS = [
  "Toàn cảnh sảnh tiệc hoặc sân khấu chính",
  "Hệ thống âm thanh ánh sáng / bàn tiệc",
  "Không gian phòng VIP riêng tư",
];
const DEFAULT_PARTY_BADGES = [
  "TIỆC TẤT NIÊN",
  "ƯU ĐÃI ĐOÀN ĐÔNG",
  "TẶNG ĐỒ UỐNG",
  "COMBO TIỆC",
  "ĐẶT SỚM GIẢM SÂU",
];

const COMMON_AMENITIES = [
  "Phòng VIP riêng tư",
  "Sân khấu & Backdrop",
  "Hệ thống Âm thanh - Ánh sáng",
  "Màn hình LED / Máy chiếu",
  "Hát Karaoke giải trí",
  "Bãi đỗ xe ô tô rộng rãi",
  "Xuất hóa đơn VAT đầy đủ",
  "Trang trí tiệc theo yêu cầu",
];

export function OnboardingPartyClient() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    slug: string;
    name: string;
    previewUrl: string;
    email: string;
  } | null>(null);

  // Form states - Account
  const [brandName, setBrandName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [zalo, setZalo] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  // Capacity & Price
  const [minGuests, setMinGuests] = useState("10");
  const [maxGuests, setMaxGuests] = useState("300");
  const [vipRooms, setVipRooms] = useState("4");
  const [priceMin, setPriceMin] = useState("2500000");
  const [priceMax, setPriceMax] = useState("6000000");

  // Party Deals: Hỗ trợ nhiều gói ưu đãi tiệc
  const [partyDealHighlight, setPartyDealHighlight] = useState("");
  const [partyDeals, setPartyDeals] = useState<PartyDealItem[]>([
    {
      id: "party-deal-1",
      title: "",
      promoPrice: "",
      originalPrice: "",
      note: "",
      badge: "TIỆC TẤT NIÊN",
    },
  ]);

  const [menuDriveUrl, setMenuDriveUrl] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Phòng VIP riêng tư",
    "Sân khấu & Backdrop",
    "Hệ thống Âm thanh - Ánh sáng",
    "Bãi đỗ xe ô tô rộng rãi",
  ]);

  // Media: Hỗ trợ 3 Banner Slider
  const [logoUrl, setLogoUrl] = useState("");
  const [banners, setBanners] = useState<string[]>(Array(BANNER_SLOT_COUNT).fill(""));
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [tempGalleryInput, setTempGalleryInput] = useState("");

  const updateBanner = (index: number, url: string) => {
    setBanners((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const addPartyDeal = () => {
    setPartyDeals((prev) => {
      if (prev.length >= 6) {
        toast.info("Tối đa 6 gói ưu đãi tiệc.");
        return prev;
      }
      return [
        ...prev,
        {
          id: `party-deal-${Date.now()}-${prev.length}`,
          title: "",
          promoPrice: "",
          originalPrice: "",
          note: "",
          badge: DEFAULT_PARTY_BADGES[prev.length] ?? "COMBO TIỆC",
        },
      ];
    });
  };

  const removePartyDeal = (index: number) => {
    setPartyDeals((prev) => {
      if (prev.length <= 1) {
        toast.error("Phải có ít nhất 1 gói ưu đãi tiệc!");
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const updatePartyDeal = (index: number, field: keyof PartyDealItem, value: string) => {
    setPartyDeals((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Set Menus
  const [setMenus, setSetMenus] = useState<SetMenuItem[]>([
    {
      name: "Set Tiệc Tất Niên Hoàng Gia",
      price: "3500000",
      dishes: "Khai vị 3 món, Súp bào ngư, Heo sữa quay giòn, Cá chẽm hấp Hong Kong, Lẩu hải sản nấm, Tráng miệng chè hạt sen",
    },
  ]);

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addSetMenu = () => {
    setSetMenus((prev) => {
      if (prev.length >= 5) {
        toast.info("Tối đa 5 Set Menu mẫu trên trang tiệc.");
        return prev;
      }
      return [...prev, { name: "", price: "", dishes: "" }];
    });
  };

  const removeSetMenu = (index: number) => {
    setSetMenus((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSetMenu = (index: number, field: keyof SetMenuItem, value: string) => {
    setSetMenus((prev) => {
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
        toast.info("Tối đa 8 ảnh sảnh tiệc.");
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

    // Validate
    if (!brandName.trim()) {
      toast.error("Vui lòng nhập Tên Nhà hàng / Trung tâm hội nghị!");
      return;
    }
    if (!managerName.trim()) {
      toast.error("Vui lòng nhập Họ tên Quản lý sảnh / Đại diện!");
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
      toast.error("Vui lòng nhập Số điện thoại hotline tiệc!");
      return;
    }
    if (!address.trim()) {
      toast.error("Vui lòng nhập Địa chỉ tổ chức tiệc!");
      return;
    }
    const validPartyDeals = partyDeals.filter((d) => d.title.trim());
    if (!partyDeals[0]?.title.trim() && !partyDealHighlight.trim()) {
      toast.error("Vui lòng nhập tên gói ưu đãi tiệc chính (Gói #1)!");
      return;
    }

    setLoading(true);

    try {
      const cleanBanners = banners.filter((b) => b && b.trim() !== "");
      const mainHighlight = validPartyDeals[0]?.title || partyDealHighlight.trim();
      const parsedMinGuests = parseInt(minGuests.replace(/\D/g, "") || "10", 10);
      const parsedMaxGuests = parseInt(maxGuests.replace(/\D/g, "") || "300", 10);
      const parsedVipRooms = parseInt(vipRooms.replace(/\D/g, "") || "0", 10);
      const parsedPriceMin = parseInt(priceMin.replace(/\D/g, "") || "2000000", 10);
      const parsedPriceMax = parseInt(priceMax.replace(/\D/g, "") || "6000000", 10);

      const formattedSetMenus = setMenus
        .filter((sm) => sm.name.trim())
        .map((sm) => ({
          name: sm.name.trim(),
          price: parseInt(sm.price.replace(/\D/g, "") || "0", 10),
          dishes: sm.dishes
            .split(/[\n,;]+/)
            .map((d) => d.trim())
            .filter(Boolean),
        }));

      const payload = {
        type: "party" as const,
        brandName: brandName.trim(),
        managerName: managerName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        zalo: zalo.trim() || phone.trim(),
        address: address.trim(),
        website: website.trim() || undefined,
        menuDriveUrl: menuDriveUrl.trim() || undefined,
        logoUrl: logoUrl || undefined,
        bannerUrls: cleanBanners,
        galleryUrls: galleryUrls,
        partyDealHighlight: mainHighlight,
        partyDeals: validPartyDeals.map((d) => ({
          title: d.title.trim(),
          promoPrice: d.promoPrice.trim() || undefined,
          originalPrice: d.originalPrice.trim() || undefined,
          note: d.note.trim() || undefined,
          badge: d.badge.trim() || undefined,
        })),
        capacity: {
          minGuests: parsedMinGuests,
          maxGuests: parsedMaxGuests,
          vipRooms: parsedVipRooms,
        },
        priceRange: {
          min: parsedPriceMin,
          max: parsedPriceMax,
        },
        spacesAndAmenities: selectedAmenities,
        setMenus: formattedSetMenus,
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

      toast.success("Khởi tạo tài khoản & nộp hồ sơ đặt tiệc thành công!");
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
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20">
            <CheckCircle2 className="size-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground mb-3">
            Hồ Sơ Đặt Tiệc & Tài Khoản Đã Khởi Tạo!
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
            Hệ thống đã tự động tạo tài khoản chính thức cho nhà hàng <b className="text-foreground">{successData.name}</b>. AI đang biên soạn giao diện sảnh tiệc và thông báo đã được gửi tới Ban Quản Trị qua Telegram để kích hoạt.
          </p>

          {/* Hộp thông tin tài khoản */}
          <div className="bg-muted/40 border border-border rounded-xl p-5 text-left mb-8 max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gold">
              <ShieldCheck className="size-4" />
              <span>Thông Tin Tài Khoản Quản Trị Của Bạn:</span>
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
              💡 Bạn có thể dùng Email và Mật khẩu này để đăng nhập vào trang quản trị (Dashboard) bất kỳ lúc nào để quản lý các đoàn đặt tiệc và cập nhật menu.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={successData.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-all shadow-md"
            >
              <span>🏮 Xem Trang Tiệc Demo</span>
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
      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold uppercase tracking-wider border border-amber-500/20">
          <PartyPopper className="size-3.5" />
          <span>Chiến Dịch Đặt Tiệc Tất Niên & Sự Kiện 2026 - 2027</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Đăng Ký & Gửi Thông Tin Trang Đặt Tiệc Nhà Hàng
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Tiếp cận hàng nghìn đoàn khách công ty và gia đình đang tìm kiếm địa điểm tổ chức tiệc tất niên, liên hoan. 
          Điền thông tin và tải ảnh sảnh tiệc, hệ thống sẽ tự động tạo tài khoản chính thức và xuất bản trang tiệc chuẩn SEO.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* KHỐI 1: TÀI KHOẢN QUẢN TRỊ CHÍNH THỨC */}
        <div className="bg-card border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">1. Tài Khoản Quản Trị Chính Thức</h2>
              <p className="text-xs text-muted-foreground">Tài khoản dùng để đăng nhập và quản lý các đơn đặt tiệc sau này</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs sm:text-sm text-foreground">
            <ShieldCheck className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <b>Tạo tài khoản chính thức tức thì:</b> Sau khi điền Email và Mật khẩu dưới đây, tài khoản của bạn sẽ được kích hoạt ngay lập tức trên hệ thống 1Booking/1Beauty. Bạn có thể sử dụng thông tin này để <Link href="/login" className="text-amber-500 font-bold underline" target="_blank">Đăng Nhập Quản Trị</Link> bất cứ lúc nào.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Họ và tên Quản lý sảnh / Đại diện nhà hàng <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="VD: Trần Hoàng Nam"
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
                  placeholder="VD: nhahanghoanggia@gmail.com"
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
                Hotline tiếp nhận đặt tiệc <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="VD: 0918731411"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Phone className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN NHÀ HÀNG & QUY CÁCH TIỆC */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UtensilsCrossed className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">2. Thông Tin Nhà Hàng & Quy Cách Sảnh Tiệc</h2>
              <p className="text-xs text-muted-foreground">Sức chứa và chính sách tổ chức tiệc tất niên</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Tên Nhà hàng / Trung tâm hội nghị tiệc <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="VD: Nhà Hàng Ẩm Thực Sinh Thái Sông Quê"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Địa chỉ tổ chức tiệc <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="VD: 88 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP.HCM"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <MapPin className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Số Zalo gửi báo giá thực đơn</label>
              <Input
                placeholder="VD: 0918731411"
                value={zalo}
                onChange={(e) => setZalo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Link Menu Google Drive hoặc PDF trực tuyến (nếu có)</label>
              <div className="relative">
                <Input
                  placeholder="VD: https://drive.google.com/file/d/..."
                  value={menuDriveUrl}
                  onChange={(e) => setMenuDriveUrl(e.target.value)}
                />
                <FileText className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold">Link Website hoặc Fanpage Nhà Hàng (nếu có)</label>
              <div className="relative">
                <Input
                  placeholder="VD: https://nhahangriverside.com hoặc https://facebook.com/..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Globe className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Sức chứa */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Khách tối thiểu / đoàn</label>
                <Input
                  type="number"
                  placeholder="VD: 10"
                  value={minGuests}
                  onChange={(e) => setMinGuests(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Sức chứa tối đa (khách)</label>
                <Input
                  type="number"
                  placeholder="VD: 350"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Số phòng VIP riêng</label>
                <Input
                  type="number"
                  placeholder="VD: 5"
                  value={vipRooms}
                  onChange={(e) => setVipRooms(e.target.value)}
                />
              </div>
            </div>

            {/* Khoảng giá bàn */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Mức giá bàn từ (VNĐ/bàn 10 người)</label>
                <Input
                  placeholder="VD: 2.500.000"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Mức giá bàn đến (VNĐ/bàn 10 người)</label>
                <Input
                  placeholder="VD: 6.000.000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 3: TẢI HÌNH ẢNH SẢNH TIỆC */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">3. Tải Hình Ảnh Sảnh Tiệc & Không Gian</h2>
              <p className="text-xs text-muted-foreground">Ảnh chất lượng cao giúp đoàn khách dễ dàng đưa ra quyết định đặt cọc</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 space-y-3">
              <label className="text-sm font-semibold block">Logo Nhà Hàng / Trung Tâm Tiệc (Ảnh vuông 1:1)</label>
              <div className="flex items-center gap-4">
                <ImageUpload
                  value={logoUrl}
                  onChange={(url) => setLogoUrl(url)}
                  className="w-24 h-24 rounded-full border-2 border-amber-500/40"
                  folder="onboarding/logos"
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Định dạng: PNG, JPG, WEBP</p>
                  <p>• Logo sắc nét giúp trang tiệc uy tín và chuyên nghiệp hơn</p>
                </div>
              </div>
            </div>

            {/* Bộ 3 Banner Slider Sảnh Tiệc */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-sm font-semibold block">
                  Bộ 3 Banner Slider Sảnh Tiệc (Tỷ lệ ngang 16:9)
                </label>
                <span className="text-xs text-amber-500 font-medium">Hệ thống tự động chạy slider chuyển tiếp 3 ảnh</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tải lên tối đa 3 ảnh ngang toàn cảnh sảnh tiệc, sân khấu lung linh hoặc phòng VIP để tạo ấn tượng cho khách đoàn.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: BANNER_SLOT_COUNT }).map((_, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-dashed border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {idx === 0 ? "Slide 1 (Sảnh chính) *" : `Slide ${idx + 1} (Tùy chọn)`}
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
                      {PARTY_SLIDE_HINTS[idx] || "Không gian sảnh tiệc"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thư viện ảnh sảnh tiệc */}
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-sm font-semibold block">
              Thư Viện Ảnh Sảnh Tiệc & Phòng VIP ({galleryUrls.length}/8 ảnh)
            </label>
            <p className="text-xs text-muted-foreground">
              Tải thêm ảnh chi tiết phòng VIP, bàn tiệc thực tế, sân khấu, món ăn nổi bật
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
                    folder="onboarding/party-gallery"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KHỐI 4: ƯU ĐÃI TIỆC & TIỆN ÍCH */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
                <PartyPopper className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">4. Danh Sách Gói Ưu Đãi Tiệc ({partyDeals.length} gói) & Tiện Ích</h2>
                <p className="text-xs text-muted-foreground">Chính sách ưu đãi và trang thiết bị hỗ trợ tổ chức sự kiện</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPartyDeal}
              className="gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Thêm gói ưu đãi tiệc</span>
            </Button>
          </div>

          {/* Danh sách partyDeals */}
          <div className="space-y-4">
            {partyDeals.map((deal, idx) => (
              <div key={deal.id || idx} className="p-5 rounded-xl bg-muted/30 border border-border space-y-4 relative group">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 px-2 py-0.5 rounded bg-amber-500/15">
                      Gói Ưu Đãi #{idx + 1} {idx === 0 && "(Chính)"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Huy hiệu:</span>
                      <Input
                        placeholder="VD: TIỆC TẤT NIÊN, ĐOÀN ĐÔNG, TẶNG BIA"
                        value={deal.badge}
                        onChange={(e) => updatePartyDeal(idx, "badge", e.target.value)}
                        className="h-7 text-xs w-36 py-0"
                      />
                    </div>
                  </div>
                  {partyDeals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePartyDeal(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Xóa gói ưu đãi này"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-1.5">
                    Nội dung gói ưu đãi tiệc {idx === 0 && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    placeholder={idx === 0
                      ? "VD: Tặng trọn gói Âm thanh - Ánh sáng sân khấu & Miễn phí bia tươi cho đoàn từ 5 bàn"
                      : `VD: Ưu Đãi #${idx + 1} - Giảm ngay 10% tổng hóa đơn thức ăn cho tiệc trưa`}
                    value={deal.title}
                    onChange={(e) => updatePartyDeal(idx, "title", e.target.value)}
                    required={idx === 0}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Ưu đãi / Quà tặng nhận được</label>
                    <Input
                      placeholder="VD: Miễn phí 100% hoặc Tặng 2 két bia"
                      value={deal.promoPrice}
                      onChange={(e) => updatePartyDeal(idx, "promoPrice", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Trị giá gốc tương đương (nếu có)</label>
                    <Input
                      placeholder="VD: 5.000.000đ"
                      value={deal.originalPrice}
                      onChange={(e) => updatePartyDeal(idx, "originalPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Điều kiện áp dụng</label>
                  <Input
                    placeholder="VD: Áp dụng khi đặt cọc trước ngày 20/12 hoặc đoàn từ 5 bàn trở lên"
                    value={deal.note}
                    onChange={(e) => updatePartyDeal(idx, "note", e.target.value)}
                  />
                </div>
              </div>
            ))}

            {partyDeals.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addPartyDeal}
                className="w-full py-4 border-dashed border-amber-500/40 text-amber-500 hover:bg-amber-500/10 gap-2 text-xs sm:text-sm"
              >
                <Plus className="size-4" />
                <span>Thêm gói ưu đãi tiệc khác ({partyDeals.length}/6)</span>
              </Button>
            )}
          </div>

          {/* Tiện ích sảnh tiệc */}
          <div className="space-y-3 pt-3">
            <label className="text-sm font-semibold block">Tiện Ích & Không Gian Có Sẵn</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COMMON_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${
                      isChecked
                        ? "border-amber-500/60 bg-amber-500/10 text-foreground font-semibold"
                        : "border-border bg-background text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="size-4 text-amber-500 shrink-0" />
                    ) : (
                      <Square className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Set Menus */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold block">Set Menu Mẫu (Thực đơn tham khảo)</label>
                <span className="text-xs text-muted-foreground">Thêm 1 - 3 set tiệc tiêu biểu để khách dễ lựa chọn</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSetMenu}
                className="gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
              >
                <Plus className="size-3.5" />
                <span>Thêm Set Menu</span>
              </Button>
            </div>

            <div className="space-y-3">
              {setMenus.map((sm, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-background space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 uppercase">Set Menu #{idx + 1}</span>
                    {setMenus.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSetMenu(idx)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <Input
                        placeholder="Tên Set (VD: Set Tiệc Thịnh Vượng)"
                        value={sm.name}
                        onChange={(e) => updateSetMenu(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Giá/bàn (VD: 3.200.000)"
                        value={sm.price}
                        onChange={(e) => updateSetMenu(idx, "price", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Textarea
                        placeholder="Danh sách các món ăn trong set (ngăn cách bằng dấu phẩy hoặc xuống dòng)"
                        value={sm.dishes}
                        onChange={(e) => updateSetMenu(idx, "dishes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="pt-4 text-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-6 text-base font-bold bg-amber-500 hover:bg-amber-600 text-black rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Đang Khởi Tạo Tài Khoản & Xử Lý AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                <span>Hoàn Tất & Gửi Kích Hoạt Trang Tiệc</span>
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            Sau khi bấm, hệ thống tạo tài khoản quản trị chính thức cho bạn và gửi thông báo kiểm duyệt tới Admin 1Booking/1Beauty.
          </p>
        </div>
      </form>
    </div>
  );
}
