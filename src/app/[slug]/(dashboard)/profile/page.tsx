"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revalidatePagePath } from "@/actions/revalidate";
import { Save, Plus, Trash2, Link as LinkIcon, Lock, MapPin, CheckSquare, Square, Sparkles, Utensils, Users, Wine, Image as ImageIcon, X, Building, FileText, ListPlus, CornerDownRight, Gift } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { PARTY_SPACES, PARTY_CUISINES, PARTY_PERKS, isFnBCategory, DEFAULT_PARTY_PROFILE_VALUES, getSpaceLabel, getCuisineLabel, getPerkLabel } from "@/types/party";

const AMENITY_OPTIONS = [
  "Có chỗ đỗ xe",
  "Thanh toán thẻ",
  "Phòng VIP riêng",
  "Wifi miễn phí",
  "Nước uống miễn phí",
  "Nhạc thư giãn",
  "Khu vực chờ",
  "Máy lạnh",
  "Có phòng tắm",
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug;
  const currentTab = searchParams.get('tab') || "overview";
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  // NOTE: Gallery & Offers are unlocked for all businesses during the launch phase (30-day trial).
  // Re-enable plan-tier gating when Free/VIP tiers are introduced.
  const [isPremium] = useState(true);

  // Party Profile State (Dành cho nhà hàng ẩm thực F&B)
  const [partyProfile, setPartyProfile] = useState<any>({
    is_active: true,
    min_guests: DEFAULT_PARTY_PROFILE_VALUES.min_guests,
    max_guests: DEFAULT_PARTY_PROFILE_VALUES.max_guests,
    num_vip_rooms: DEFAULT_PARTY_PROFILE_VALUES.num_vip_rooms,
    price_min: DEFAULT_PARTY_PROFILE_VALUES.price_min,
    price_max: DEFAULT_PARTY_PROFILE_VALUES.price_max,
    spaces_and_amenities: [],
    cuisines: [],
    party_perks: [],
    party_deal_highlight: "",
    party_description: "",
    party_banner_url: null,
    party_gallery: [],
    set_menus: [],
    party_halls: [],
    party_specifications: [],
    party_menu_url: "",
    is_vip: false,
  });

  const [customSpaceInput, setCustomSpaceInput] = useState("");
  const [customCuisineInput, setCustomCuisineInput] = useState("");
  const [customPerkInput, setCustomPerkInput] = useState("");

  const handleTabChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (val === "overview") {
      newParams.delete('tab');
    } else {
      newParams.set('tab', val);
    }
    router.push(`?${newParams.toString()}`);
  };

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const [pageContent, setPageContent] = useState<any>({
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    zalo: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    logo_url: "",
    hero_image: "",
    banners: ["", "", ""],
    gallery: [],
    services: [],
    deals: [],
    amenities: [],
    map_embed: "",
    booking_url: "",
    menu_url: "",
    price_range: "",
    working_hours: [
      { day: "Thứ 2", hours: "09:00 - 20:00" },
      { day: "Thứ 3", hours: "09:00 - 20:00" },
      { day: "Thứ 4", hours: "09:00 - 20:00" },
      { day: "Thứ 5", hours: "09:00 - 20:00" },
      { day: "Thứ 6", hours: "09:00 - 20:00" },
      { day: "Thứ 7", hours: "09:00 - 21:00" },
      { day: "Chủ nhật", hours: "09:00 - 21:00" }
    ]
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("businesses").select("*, plans(name)").eq("owner_id", user.id).eq("slug", slug).single().then(({ data }) => {
          if (data) {
            setBusiness(data);
            

            setFormData({
              name: data.name || "",
              address: data.address || "",
            });
            if (data.page_content) {
              try {
                const parsed = (typeof data.page_content === 'string' ? JSON.parse(data.page_content) : data.page_content) || {};
                setPageContent((prev: any) => ({ 
                  ...prev, 
                  ...parsed,
                  phone: data.phone || parsed.phone || "",
                  email: data.email || parsed.email || "",
                  website: data.website || parsed.website || "",
                  zalo: data.zalo || parsed.zalo || "",
                  facebook: data.socials?.facebook || parsed.facebook || "",
                  instagram: data.socials?.instagram || parsed.instagram || "",
                  tiktok: data.socials?.tiktok || parsed.tiktok || "",
                  youtube: data.socials?.youtube || parsed.youtube || "",
                  working_hours: Array.isArray(parsed.working_hours) ? parsed.working_hours : prev.working_hours,
                  gallery: Array.isArray(parsed.gallery) ? parsed.gallery : prev.gallery,
                  services: Array.isArray(parsed.services) ? parsed.services : prev.services,
                  deals: Array.isArray(parsed.deals) ? parsed.deals : prev.deals,
                  amenities: Array.isArray(parsed.amenities) ? parsed.amenities : prev.amenities,
                  banners: Array.isArray(parsed.banners) ? parsed.banners : prev.banners,
                  menu_url: parsed.menu_url || "",
                }));
              } catch (e) { console.error(e); }
            } else {
              setPageContent((prev: any) => ({
                ...prev,
                phone: data.phone || "",
                email: data.email || "",
                website: data.website || "",
                zalo: data.zalo || "",
                facebook: data.socials?.facebook || "",
                instagram: data.socials?.instagram || "",
                tiktok: data.socials?.tiktok || "",
                youtube: data.socials?.youtube || "",
                menu_url: "",
              }));
            }

            // Tải thêm dữ liệu hồ sơ tiệc nếu doanh nghiệp thuộc ngành ẩm thực
            supabase
              .from("business_party_profiles")
              .select("*")
              .eq("business_id", data.id)
              .maybeSingle()
              .then(({ data: pData }) => {
                if (pData) {
                  setPartyProfile({
                    is_active: pData.is_active ?? true,
                    min_guests: pData.min_guests ?? DEFAULT_PARTY_PROFILE_VALUES.min_guests,
                    max_guests: pData.max_guests ?? DEFAULT_PARTY_PROFILE_VALUES.max_guests,
                    num_vip_rooms: pData.num_vip_rooms ?? DEFAULT_PARTY_PROFILE_VALUES.num_vip_rooms,
                    price_min: pData.price_min ?? DEFAULT_PARTY_PROFILE_VALUES.price_min,
                    price_max: pData.price_max ?? DEFAULT_PARTY_PROFILE_VALUES.price_max,
                    spaces_and_amenities: Array.isArray(pData.spaces_and_amenities) ? pData.spaces_and_amenities : [],
                    cuisines: Array.isArray(pData.cuisines) ? pData.cuisines : [],
                    party_perks: Array.isArray(pData.party_perks) ? pData.party_perks : [],
                    party_deal_highlight: pData.party_deal_highlight || "",
                    party_description: pData.party_description || "",
                    party_banner_url: pData.party_banner_url || null,
                    party_gallery: Array.isArray(pData.party_gallery) ? pData.party_gallery : [],
                    set_menus: Array.isArray(pData.set_menus) ? pData.set_menus : [],
                    party_halls: Array.isArray(pData.party_halls) ? pData.party_halls : [],
                    party_specifications: Array.isArray(pData.party_specifications) ? pData.party_specifications : [],
                    party_menu_url: pData.party_menu_url || "",
                    is_vip: Boolean(pData.is_vip),
                  });
                }
              });
          }
          setLoading(false);
        });
      }
    });
  }, []);

  const isFnB = isFnBCategory(business?.category_slug);

  useEffect(() => {
    if (business && !isFnB && searchParams.get('tab') === 'party') {
      router.replace(`/${slug}/profile`);
    }
  }, [business, isFnB, searchParams, slug, router]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePageContentChange = (field: string, value: any) => {
    setPageContent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePartyProfileChange = (field: string, value: any) => {
    setPartyProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const togglePartyTag = (field: 'spaces_and_amenities' | 'cuisines' | 'party_perks', tag: string) => {
    setPartyProfile((prev: any) => {
      const current = prev[field] || [];
      const updated = current.includes(tag)
        ? current.filter((t: string) => t !== tag)
        : [...current, tag];
      return { ...prev, [field]: updated };
    });
  };

  const handleAddCustomSpace = () => {
    const val = customSpaceInput.trim();
    if (!val) return;
    if (!(partyProfile.spaces_and_amenities || []).includes(val)) {
      setPartyProfile((prev: any) => ({
        ...prev,
        spaces_and_amenities: [...(prev.spaces_and_amenities || []), val],
      }));
    }
    setCustomSpaceInput('');
  };

  const handleRemoveSpace = (tag: string) => {
    setPartyProfile((prev: any) => ({
      ...prev,
      spaces_and_amenities: (prev.spaces_and_amenities || []).filter((t: string) => t !== tag),
    }));
  };

  const handleAddCustomCuisine = () => {
    const val = customCuisineInput.trim();
    if (!val) return;
    if (!(partyProfile.cuisines || []).includes(val)) {
      setPartyProfile((prev: any) => ({
        ...prev,
        cuisines: [...(prev.cuisines || []), val],
      }));
    }
    setCustomCuisineInput('');
  };

  const handleRemoveCuisine = (tag: string) => {
    setPartyProfile((prev: any) => ({
      ...prev,
      cuisines: (prev.cuisines || []).filter((t: string) => t !== tag),
    }));
  };

  const handleAddCustomPerk = () => {
    const val = customPerkInput.trim();
    if (!val) return;
    if (!(partyProfile.party_perks || []).includes(val)) {
      setPartyProfile((prev: any) => ({
        ...prev,
        party_perks: [...(prev.party_perks || []), val],
      }));
    }
    setCustomPerkInput('');
  };

  const handleRemovePerk = (tag: string) => {
    setPartyProfile((prev: any) => ({
      ...prev,
      party_perks: (prev.party_perks || []).filter((t: string) => t !== tag),
    }));
  };

  // Sảnh Tiệc & Phòng VIP
  const addPartyHall = () => {
    setPartyProfile((prev: any) => ({
      ...prev,
      party_halls: [
        ...(prev.party_halls || []),
        { id: `hall_${crypto.randomUUID()}`, name: '', capacity: '', price_min: '', features: '' },
      ],
    }));
  };

  const updatePartyHall = (index: number, field: string, value: any) => {
    setPartyProfile((prev: any) => {
      const updated = [...(prev.party_halls || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, party_halls: updated };
    });
  };

  const removePartyHall = (index: number) => {
    setPartyProfile((prev: any) => ({
      ...prev,
      party_halls: (prev.party_halls || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // Set Menu & Món ăn chi tiết
  const addSetMenu = () => {
    setPartyProfile((prev: any) => ({
      ...prev,
      set_menus: [
        ...(prev.set_menus || []),
        { id: `menu_${crypto.randomUUID()}`, name: '', price: 0, pax: 10, dishes: [] },
      ],
    }));
  };

  const removeSetMenu = (index: number) => {
    setPartyProfile((prev: any) => ({
      ...prev,
      set_menus: (prev.set_menus || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const updateSetMenu = (index: number, field: string, value: any) => {
    setPartyProfile((prev: any) => {
      const updated = [...(prev.set_menus || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, set_menus: updated };
    });
  };

  const addDishToMenu = (menuIndex: number) => {
    setPartyProfile((prev: any) => {
      const updatedMenus = [...(prev.set_menus || [])];
      const currentMenu = updatedMenus[menuIndex] || {};
      const currentDishes = Array.isArray(currentMenu.dishes) ? currentMenu.dishes : [];
      updatedMenus[menuIndex] = {
        ...currentMenu,
        dishes: [...currentDishes, ''],
      };
      return { ...prev, set_menus: updatedMenus };
    });
  };

  const updateDishInMenu = (menuIndex: number, dishIndex: number, value: string) => {
    setPartyProfile((prev: any) => {
      const updatedMenus = [...(prev.set_menus || [])];
      const currentMenu = updatedMenus[menuIndex] || {};
      const updatedDishes = [...(currentMenu.dishes || [])];
      updatedDishes[dishIndex] = value;
      updatedMenus[menuIndex] = { ...currentMenu, dishes: updatedDishes };
      return { ...prev, set_menus: updatedMenus };
    });
  };

  const removeDishFromMenu = (menuIndex: number, dishIndex: number) => {
    setPartyProfile((prev: any) => {
      const updatedMenus = [...(prev.set_menus || [])];
      const currentMenu = updatedMenus[menuIndex] || {};
      const updatedDishes = (currentMenu.dishes || []).filter((_: any, i: number) => i !== dishIndex);
      updatedMenus[menuIndex] = { ...currentMenu, dishes: updatedDishes };
      return { ...prev, set_menus: updatedMenus };
    });
  };

  // Bảng Quy Cách & Chính Sách Tiệc Tùy Chỉnh
  const addPartySpecification = () => {
    setPartyProfile((prev: any) => ({
      ...prev,
      party_specifications: [
        ...(prev.party_specifications || []),
        { id: `spec_${crypto.randomUUID()}`, title: '', content: '' },
      ],
    }));
  };

  const updatePartySpecification = (index: number, field: string, value: string) => {
    setPartyProfile((prev: any) => {
      const updated = [...(prev.party_specifications || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, party_specifications: updated };
    });
  };

  const removePartySpecification = (index: number) => {
    setPartyProfile((prev: any) => ({
      ...prev,
      party_specifications: (prev.party_specifications || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = pageContent.amenities || [];
    if (current.includes(amenity)) {
      handlePageContentChange("amenities", current.filter((a: string) => a !== amenity));
    } else {
      handlePageContentChange("amenities", [...current, amenity]);
    }
  };

  const handleSave = async () => {
    // Check for base64 images which cause massive slowdowns
    const contentStr = JSON.stringify(pageContent);
    // Find if there's any data:image string longer than 50,000 characters
    const base64Matches = contentStr.match(/data:image\/[^;]+;base64,[^"]+/g);
    if (base64Matches && base64Matches.some(m => m.length > 50000)) {
      toast.error("Lỗi: Không được dán trực tiếp ảnh (Base64) vào ô hình ảnh. Vui lòng sử dụng đường link (URL) ảnh để không làm chậm hệ thống!", { duration: 8000 });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("businesses").update({
        name: formData.name,
        address: formData.address,
        description: pageContent.description || null,
        phone: pageContent.phone || null,
        email: pageContent.email || null,
        website: pageContent.website || null,
        zalo: pageContent.zalo || null,
        socials: { 
          facebook: pageContent.facebook, 
          instagram: pageContent.instagram, 
          tiktok: pageContent.tiktok,
          youtube: pageContent.youtube
        },
        page_content: pageContent
      }).eq("id", business.id);

      if (error) throw error;

      // Lưu hồ sơ tiệc nếu là doanh nghiệp F&B
      if (isFnB) {
        const { error: partyErr } = await supabase
          .from("business_party_profiles")
          .upsert({
            business_id: business.id,
            min_guests: Number.isFinite(Number(partyProfile.min_guests)) && Number(partyProfile.min_guests) > 0 ? Number(partyProfile.min_guests) : DEFAULT_PARTY_PROFILE_VALUES.min_guests,
            max_guests: Number.isFinite(Number(partyProfile.max_guests)) && Number(partyProfile.max_guests) > 0 ? Number(partyProfile.max_guests) : DEFAULT_PARTY_PROFILE_VALUES.max_guests,
            num_vip_rooms: Number.isFinite(Number(partyProfile.num_vip_rooms)) ? Number(partyProfile.num_vip_rooms) : DEFAULT_PARTY_PROFILE_VALUES.num_vip_rooms,
            price_min: Number.isFinite(Number(partyProfile.price_min)) && Number(partyProfile.price_min) > 0 ? Number(partyProfile.price_min) : DEFAULT_PARTY_PROFILE_VALUES.price_min,
            price_max: Number.isFinite(Number(partyProfile.price_max)) && Number(partyProfile.price_max) > 0 ? Number(partyProfile.price_max) : DEFAULT_PARTY_PROFILE_VALUES.price_max,
            spaces_and_amenities: partyProfile.spaces_and_amenities || [],
            cuisines: partyProfile.cuisines || [],
            party_perks: partyProfile.party_perks || [],
            party_deal_highlight: partyProfile.party_deal_highlight || null,
            party_description: partyProfile.party_description || null,
            party_banner_url: typeof partyProfile.party_banner_url === 'string' && /^https?:\/\//.test(partyProfile.party_banner_url)
              ? partyProfile.party_banner_url
              : null,
            party_gallery: Array.isArray(partyProfile.party_gallery)
              ? partyProfile.party_gallery.filter((u: any) => typeof u === 'string' && /^https?:\/\//.test(u))
              : [],
            set_menus: (partyProfile.set_menus || [])
              .filter((m: any) => m && typeof m.name === 'string' && m.name.trim())
              .map((m: any) => ({
                ...m,
                name: m.name.trim(),
                dishes: Array.isArray(m.dishes)
                  ? m.dishes.filter((d: any) => typeof d === 'string' && d.trim()).map((d: string) => d.trim())
                  : [],
              })),
            party_halls: (partyProfile.party_halls || [])
              .filter((h: any) => h && typeof h.name === 'string' && h.name.trim())
              .map((h: any) => ({ ...h, name: h.name.trim() })),
            party_specifications: (partyProfile.party_specifications || [])
              .filter((s: any) => s && typeof s.title === 'string' && s.title.trim())
              .map((s: any) => ({ ...s, title: s.title.trim() })),
            party_menu_url: typeof partyProfile.party_menu_url === 'string' && partyProfile.party_menu_url.trim().length > 0
              ? partyProfile.party_menu_url.trim()
              : null,
            is_vip: Boolean(partyProfile.is_vip),
            is_active: Boolean(partyProfile.is_active),
            updated_at: new Date().toISOString(),
          });

        if (partyErr) {
          console.error("Lỗi lưu hồ sơ tiệc:", partyErr);
        }
      }

      const revalPaths = [`/${business.slug}`];
      if (isFnB) {
        revalPaths.push(`/${business.slug}/tiec`, `/tat-nien`);
      }
      await Promise.all(revalPaths.map((p) => revalidatePagePath(p)));
      toast.success("Đã lưu thông tin doanh nghiệp");
    } catch (error: any) {
      toast.error("Lỗi khi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateBanner = (index: number, url: string) => {
    const newBanners = [...(pageContent.banners || ["","",""])];
    newBanners[index] = url;
    handlePageContentChange("banners", newBanners);
  };

  const addDeal = () => {
    handlePageContentChange("deals", [...(pageContent.deals || []), { id: `deal-${Math.random().toString(36).substring(2, 9)}`, title: "", original_price: "", promo_price: "", badge: "", note: "", status: "active" }]);
  };
  const removeDeal = (index: number) => {
    handlePageContentChange("deals", pageContent.deals.filter((_: any, i: number) => i !== index));
  };
  const updateDeal = (index: number, field: string, value: any) => {
    const newDeals = [...(pageContent.deals || [])];
    newDeals[index][field] = value;
    handlePageContentChange("deals", newDeals);
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải thông tin...</div>;
  if (!business) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy doanh nghiệp.</div>;
  const effectiveTab = !isFnB && currentTab === "party" ? "overview" : currentTab;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="sticky top-0 z-40 -mx-6 px-6 py-4 md:-mx-10 md:px-10 bg-background/95 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Chỉnh sửa Gian hàng</h1>
          <p className="text-muted-foreground text-sm mt-1">Cập nhật thông tin chi tiết để thu hút khách hàng tốt hơn.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 hidden md:flex">
            <Link href={`/${business.slug}`} target="_blank">Xem Trang Ưu Đãi</Link>
          </Button>
          {isFnB && (
            <Button asChild variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50 hidden md:flex">
              <Link href={`/${business.slug}/tiec`} target="_blank">Xem Trang Đặt Tiệc</Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 w-full md:w-auto shadow-md">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Tabs value={effectiveTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className={`grid w-full ${isFnB ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} h-auto md:h-12 gap-2 bg-muted p-2 rounded-xl mb-6`}>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ & Bản đồ</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh</TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-1">Ưu đãi {!isPremium && <Lock className="size-3" />}</TabsTrigger>
          {isFnB && (
            <TabsTrigger value="party" className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Sparkles className="size-3.5" /> Nhận Tiệc
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-semibold text-xl border-b pb-4">Thông tin Cơ bản</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tên Doanh Nghiệp (Thương hiệu)</Label>
                <Input value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Khoảng giá trung bình</Label>
                <Input value={pageContent.price_range || ""} onChange={(e) => handlePageContentChange("price_range", e.target.value)} placeholder="VD: 150.000đ - 2.000.000đ" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giới thiệu tóm tắt</Label>
              <Textarea 
                value={pageContent.description || ""} 
                onChange={(e) => handlePageContentChange("description", e.target.value)} 
                rows={4}
                placeholder="Mô tả về không gian, phong cách và thế mạnh của doanh nghiệp..."
              />
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Giờ mở cửa (7 ngày trong tuần)</Label>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(pageContent.working_hours || []).map((wh: any, i: number) => (
                  <div key={i} className="flex flex-col space-y-1 bg-gray-50 p-3 rounded-lg border">
                    <Label className="text-xs font-bold text-gold">{wh.day}</Label>
                    <Input 
                      value={wh.hours} 
                      onChange={(e) => {
                        const newWh = [...pageContent.working_hours];
                        newWh[i].hours = e.target.value;
                        handlePageContentChange("working_hours", newWh);
                      }} 
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Tiện ích Không gian</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((opt) => (
                  <div 
                    key={opt} 
                    onClick={() => toggleAmenity(opt)}
                    className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {(pageContent.amenities || []).includes(opt) ? 
                      <CheckSquare className="size-4 text-gold" /> : 
                      <Square className="size-4 text-gray-300" />
                    }
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Đường Dẫn Thực Đơn Menu Món Ăn Trực Tuyến */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Utensils className="size-5 text-gold" /> Đường Dẫn Thực Đơn / Menu Món Ăn Trực Tuyến
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Dán đường link xem thực đơn để thực khách bấm vào xem trọn bộ danh sách món ăn &amp; thức uống của quán.
                  </p>
                </div>
                {pageContent.menu_url && /^https?:\/\//.test(pageContent.menu_url) && (
                  <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold/10 shrink-0">
                    <a href={pageContent.menu_url} target="_blank" rel="noopener noreferrer">
                      Xem thử thực đơn ↗
                    </a>
                  </Button>
                )}
              </div>
              <Input
                value={pageContent.menu_url || ""}
                onChange={(e) => handlePageContentChange("menu_url", e.target.value)}
                placeholder="https://... (Dán đường link thực đơn trực tuyến của quán)"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-semibold text-xl border-b pb-4">Liên hệ & Mạng xã hội</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="Số nhà, Tên đường, Phường, Quận, Thành phố..." />
              </div>
              <div className="space-y-2">
                <Label>Link Đặt lịch (Booking / Zalo OA)</Label>
                <Input value={pageContent.booking_url || ""} onChange={(e) => handlePageContentChange("booking_url", e.target.value)} placeholder="https://booking.com/..." />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Số điện thoại (Hotline)</Label>
                <Input value={pageContent.phone || ""} onChange={(e) => handlePageContentChange("phone", e.target.value)} placeholder="09xxxx..." />
              </div>
              <div className="space-y-2">
                <Label>Zalo</Label>
                <Input value={pageContent.zalo || ""} onChange={(e) => handlePageContentChange("zalo", e.target.value)} placeholder="09xxxx..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={pageContent.email || ""} onChange={(e) => handlePageContentChange("email", e.target.value)} className="pl-9" placeholder="contact@example.com" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={pageContent.website || ""} onChange={(e) => handlePageContentChange("website", e.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={pageContent.facebook || ""} onChange={(e) => handlePageContentChange("facebook", e.target.value)} placeholder="Link Fanpage" />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={pageContent.instagram || ""} onChange={(e) => handlePageContentChange("instagram", e.target.value)} placeholder="Link IG" />
              </div>
              <div className="space-y-2">
                <Label>TikTok</Label>
                <Input value={pageContent.tiktok || ""} onChange={(e) => handlePageContentChange("tiktok", e.target.value)} placeholder="Link TikTok" />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MapPin className="size-5 text-gold" /> Bản đồ Google Maps (Embed)
              </Label>
              <p className="text-sm text-muted-foreground">
                Để lấy mã nhúng, vào Google Maps {">"} Chọn địa điểm {">"} Nút "Chia sẻ" {">"} Chuyển sang "Nhúng bản đồ" {">"} Bấm "Sao chép HTML" và dán vào đây.
              </p>
              <Textarea 
                value={pageContent.map_embed || ""} 
                onChange={(e) => handlePageContentChange("map_embed", e.target.value)} 
                rows={4}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
              />
              {pageContent.map_embed && pageContent.map_embed.includes('<iframe') && (
                <div className="mt-4 rounded-xl overflow-hidden border">
                  <div dangerouslySetInnerHTML={{ __html: pageContent.map_embed }} className="w-full h-[300px] [&>iframe]:w-full [&>iframe]:h-full" />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-semibold text-xl border-b pb-4">Hình ảnh Nhận diện</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="font-bold">Logo Thương hiệu</Label>
                <p className="text-xs text-muted-foreground">Tỷ lệ 1:1, dung lượng nhẹ.</p>
                <div className="w-32 h-32">
                  <ImageUpload 
                    value={pageContent.logo_url} 
                    onChange={(url) => handlePageContentChange("logo_url", url)} 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-bold">Ảnh Cover Phụ (Tùy chọn)</Label>
                <p className="text-xs text-muted-foreground">Dùng để làm hình nền phụ.</p>
                <div className="w-full h-32 max-w-xs">
                  <ImageUpload 
                    value={pageContent.hero_image} 
                    onChange={(url) => handlePageContentChange("hero_image", url)} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Slider Trang chủ (Tối đa 3 ảnh Banner lớn)</Label>
              <p className="text-xs text-muted-foreground mb-4">Tỷ lệ 16:9 ngang để đẹp nhất trên desktop & mobile.</p>
              <div className="grid md:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-2">
                    <Label className="text-xs">Banner {idx + 1}</Label>
                    <div className="aspect-[16/9] w-full bg-gray-50 border border-dashed rounded-xl overflow-hidden relative group">
                      <ImageUpload 
                        value={pageContent.banners?.[idx] || ""} 
                        onChange={(url) => updateBanner(idx, url)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t relative">
              {!isPremium && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl">
                  <Lock className="size-8 text-gold mb-3" />
                  <h4 className="font-bold text-lg mb-2">Tính năng Premium</h4>
                  <p className="text-sm text-muted-foreground mb-4">Nâng cấp để tải lên không giới hạn Thư viện Ảnh (Gallery) thực tế của cửa hàng.</p>
                  <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                    <Link href={`/${business.slug}/upgrade`}>Nâng cấp 399k / Năm</Link>
                  </Button>
                </div>
              )}
              <Label className="text-base font-semibold flex items-center gap-2">
                Thư viện ảnh không gian (Gallery) {!isPremium && <Lock className="size-4 text-muted-foreground" />}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(pageContent.gallery || []).map((imgUrl: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="Gallery" className="object-cover w-full h-full" />
                    <button 
                      type="button"
                      onClick={() => {
                        const newGallery = pageContent.gallery.filter((_: any, index: number) => index !== i);
                        handlePageContentChange("gallery", newGallery);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                
                <div className="aspect-square">
                  <ImageUpload 
                    value="" 
                    onChange={(url) => {
                      if(url) {
                        handlePageContentChange("gallery", [...(pageContent.gallery || []), url]);
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm relative">
            {!isPremium && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl">
                <Lock className="size-8 text-gold mb-3" />
                <h4 className="font-bold text-lg mb-2">Tính năng Premium</h4>
                <p className="text-sm text-muted-foreground mb-4">Nâng cấp gói Premium để đăng tải các chương trình Ưu đãi lên trang chủ.</p>
                <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                  <Link href={`/${business.slug}/upgrade`}>Nâng cấp 399k / Năm</Link>
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-xl flex items-center gap-2">
                Các Gói Ưu Đãi / Deals {!isPremium && <Lock className="size-4 text-muted-foreground" />}
              </h3>
              <Button onClick={addDeal} disabled={!isPremium} size="sm" variant="outline" className="text-gold border-gold hover:bg-gold/10">
                <Plus className="size-4 mr-2" /> Thêm Ưu đãi
              </Button>
            </div>
            
            <div className="space-y-4">
              {(!pageContent.deals || pageContent.deals.length === 0) && (
                <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                  Chưa có ưu đãi nào.
                </div>
              )}
              {(pageContent.deals || []).map((deal: any, i: number) => (
                <div key={i} className="p-4 border rounded-xl bg-champagne/20 relative group">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Tên Ưu Đãi</Label>
                      <Input value={deal.title || ""} onChange={e => updateDeal(i, "title", e.target.value)} placeholder="VD: Gói Khám Đặc Biệt" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nhãn nổi bật (Badge)</Label>
                      <Input value={deal.badge || ""} onChange={e => updateDeal(i, "badge", e.target.value)} placeholder="HOT" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Giá gốc</Label>
                      <Input value={deal.original_price || ""} onChange={e => updateDeal(i, "original_price", e.target.value)} placeholder="500000" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Giá Ưu Đãi</Label>
                      <Input value={deal.promo_price || ""} onChange={e => updateDeal(i, "promo_price", e.target.value)} placeholder="199000" />
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    <Label className="text-xs">Ghi chú (Lưu ý)</Label>
                    <Textarea value={deal.note || ""} onChange={e => updateDeal(i, "note", e.target.value)} placeholder="Dành cho khách hàng mới..." rows={2} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={deal.status !== 'paused'} 
                        onCheckedChange={(checked) => updateDeal(i, "status", checked ? "active" : "paused")} 
                      />
                      <Label className={`text-xs ${deal.status !== 'paused' ? 'text-green-600' : 'text-gray-400'}`}>
                        {deal.status !== 'paused' ? 'Đang bật' : 'Tạm dừng'}
                      </Label>
                    </div>
                  </div>
                  
                  <Button variant="destructive" size="sm" onClick={() => removeDeal(i)} className="absolute top-4 right-4 h-8 px-2">
                    <Trash2 className="size-4 mr-1" /> Xóa
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {isFnB && (
          <TabsContent value="party" className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="font-semibold text-xl text-amber-500 flex items-center gap-2">
                    <Sparkles className="size-5" /> Cấu Hình Nhận Tiệc Tất Niên 2026
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thông tin tiệc sẽ xuất hiện nổi bật trên Bản Đồ Phố Tiệc Tất Niên và trang sảnh tiệc riêng của quán.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                  <Link href="/tat-nien" target="_blank">
                    Xem Bản Đồ Phố Tiệc
                  </Link>
                </Button>
              </div>

              {/* Bật tắt nhận tiệc & VIP glow */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between pr-4 sm:border-r border-amber-500/20">
                  <div className="space-y-0.5">
                    <Label className="font-bold text-sm">Trạng thái Nhận Tiệc</Label>
                    <p className="text-xs text-muted-foreground">Hiển thị nhà hàng trên Bản Đồ Tất Niên</p>
                  </div>
                  <Switch
                    checked={partyProfile.is_active}
                    onCheckedChange={(checked) => handlePartyProfileChange('is_active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between sm:pl-4">
                  <div className="space-y-0.5">
                    <Label className="font-bold text-sm text-amber-500 flex items-center gap-1.5">
                      ★ Hiệu ứng VIP Ghim Vàng
                    </Label>
                    <p className="text-xs text-muted-foreground">Bật hiệu ứng đèn hào quang vàng trên bản đồ</p>
                  </div>
                  <Switch
                    checked={partyProfile.is_vip}
                    onCheckedChange={(checked) => handlePartyProfileChange('is_vip', checked)}
                  />
                </div>
              </div>

              {/* Sức chứa & Phòng VIP */}
              <div>
                <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-4 text-amber-500" /> Sức Chứa & Quy Mô Sảnh
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Số khách tối thiểu (pax)</Label>
                    <Input
                      type="number"
                      value={partyProfile.min_guests}
                      onChange={(e) => handlePartyProfileChange('min_guests', parseInt(e.target.value) || 0)}
                      placeholder="VD: 15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Số khách tối đa (sức chứa max)</Label>
                    <Input
                      type="number"
                      value={partyProfile.max_guests}
                      onChange={(e) => handlePartyProfileChange('max_guests', parseInt(e.target.value) || 0)}
                      placeholder="VD: 250"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Số phòng VIP riêng</Label>
                    <Input
                      type="number"
                      value={partyProfile.num_vip_rooms}
                      onChange={(e) => handlePartyProfileChange('num_vip_rooms', parseInt(e.target.value) || 0)}
                      placeholder="VD: 4"
                    />
                  </div>
                </div>
              </div>

              {/* Ngân sách trung bình */}
              <div>
                <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Wine className="size-4 text-amber-500" /> Ngân Sách Dự Kiến (/người)
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mức giá thấp nhất (VNĐ/người)</Label>
                    <Input
                      type="number"
                      step={10000}
                      value={partyProfile.price_min}
                      onChange={(e) => handlePartyProfileChange('price_min', parseInt(e.target.value) || 0)}
                      placeholder="VD: 250000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mức giá cao nhất (VNĐ/người)</Label>
                    <Input
                      type="number"
                      step={10000}
                      value={partyProfile.price_max}
                      onChange={(e) => handlePartyProfileChange('price_max', parseInt(e.target.value) || 0)}
                      placeholder="VD: 600000"
                    />
                  </div>
                </div>
              </div>

              {/* Ưu đãi nổi bật */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-amber-600">
                  🎁 Dòng Ưu Đãi Nổi Bật Trên Bản Đồ (Map Pin Highlight)
                </Label>
                <Input
                  value={partyProfile.party_deal_highlight || ''}
                  onChange={(e) => handlePartyProfileChange('party_deal_highlight', e.target.value)}
                  placeholder="VD: Tặng 2 thùng bia + Miễn phí dàn Karaoke VIP"
                />
                <p className="text-[11px] text-muted-foreground">
                  Dòng chữ ngắn gọn này sẽ xuất hiện trên ghim bản đồ khi khách rê chuột hoặc xem lướt.
                </p>
              </div>

              {/* Tiện ích & Không gian */}
              <div className="space-y-3 p-4 rounded-2xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" /> Tiện Ích & Không Gian Tiệc
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Chọn nhanh hoặc tự nhập thêm tiện ích riêng</span>
                </div>

                {/* Gợi ý chọn nhanh */}
                <div className="flex flex-wrap gap-1.5">
                  {PARTY_SPACES.map((space) => {
                    const active = (partyProfile.spaces_and_amenities || []).includes(space.id);
                    return (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => togglePartyTag('spaces_and_amenities', space.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          active
                            ? 'bg-amber-500 text-black font-bold border-amber-500'
                            : 'bg-muted/60 text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {space.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ô nhập tiện ích riêng */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={customSpaceInput}
                    onChange={(e) => setCustomSpaceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSpace();
                      }
                    }}
                    placeholder="Thêm tiện ích khác... (VD: Bãi đỗ xe ô tô 50 chiếc, Hầm rượu vang, Hồ bơi ngoài trời)"
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomSpace}
                    className="h-8 text-xs border-amber-500 text-amber-600 shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Thêm Tiện Ích
                  </Button>
                </div>

                {/* Danh sách các tiện ích đã chọn */}
                {(partyProfile.spaces_and_amenities || []).length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-zinc-400 mr-1">Đã cấu hình:</span>
                    {(partyProfile.spaces_and_amenities || []).map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold"
                      >
                        <span>✓ {getSpaceLabel(s)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpace(s)}
                          className="hover:text-red-400 p-0.5 rounded-full"
                          title="Xóa tiện ích này"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Phong cách ẩm thực */}
              <div className="space-y-3 p-4 rounded-2xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Utensils className="size-3.5 text-rose-500" /> Phong Cách Ẩm Thực & Món Đặc Sản
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Chọn nhanh hoặc tự nhập phong cách của quán</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PARTY_CUISINES.map((c) => {
                    const active = (partyProfile.cuisines || []).includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => togglePartyTag('cuisines', c.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          active
                            ? 'bg-rose-500 text-white font-bold border-rose-500'
                            : 'bg-muted/60 text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ô nhập ẩm thực riêng */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={customCuisineInput}
                    onChange={(e) => setCustomCuisineInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCuisine();
                      }
                    }}
                    placeholder="Thêm món/phong cách khác... (VD: Món Nhật / Sashimi, Bò Tơ Củ Chi, BBQ Hàn Quốc, Dê Tươi)"
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomCuisine}
                    className="h-8 text-xs border-rose-500 text-rose-600 shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Thêm Ẩm Thực
                  </Button>
                </div>

                {/* Danh sách ẩm thực đã chọn */}
                {(partyProfile.cuisines || []).length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-zinc-400 mr-1">Đã cấu hình:</span>
                    {(partyProfile.cuisines || []).map((c: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-semibold"
                      >
                        <span>✓ {getCuisineLabel(c)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCuisine(c)}
                          className="hover:text-red-400 p-0.5 rounded-full"
                          title="Xóa món/phong cách này"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quà tặng & Đặc quyền */}
              <div className="space-y-3 p-4 rounded-2xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Gift className="size-3.5 text-emerald-500" /> Quà Tặng & Đặc Quyền Khách Đặt Tiệc
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Tự do bổ sung ưu đãi hấp dẫn để thu hút đoàn tiệc</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PARTY_PERKS.map((p) => {
                    const active = (partyProfile.party_perks || []).includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePartyTag('party_perks', p.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          active
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                            : 'bg-muted/60 text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ô nhập ưu đãi riêng */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={customPerkInput}
                    onChange={(e) => setCustomPerkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomPerk();
                      }
                    }}
                    placeholder="Thêm ưu đãi riêng... (VD: Tặng bánh kem khai tiệc, Giảm 20% rượu vang, Tặng gói quay chụp tiệc)"
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomPerk}
                    className="h-8 text-xs border-emerald-500 text-emerald-600 shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Thêm Ưu Đãi
                  </Button>
                </div>

                {/* Danh sách ưu đãi đã chọn */}
                {(partyProfile.party_perks || []).length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-zinc-400 mr-1">Đã cấu hình:</span>
                    {(partyProfile.party_perks || []).map((p: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold"
                      >
                        <span>🎁 {getPerkLabel(p)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePerk(p)}
                          className="hover:text-red-400 p-0.5 rounded-full"
                          title="Xóa ưu đãi này"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* MỤC MỚI: Danh sách Sảnh Tiệc & Phòng VIP Riêng (Halls) */}
              <div className="space-y-4 p-4 md:p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-sm font-bold text-blue-400 flex items-center gap-2">
                      <Building className="size-4" /> Danh Sách Sảnh Tiệc &amp; Phòng VIP Riêng
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Thêm từng sảnh hoặc phòng VIP cụ thể với sức chứa, mức giá và trang bị để đoàn tiệc dễ dàng chọn sảnh.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPartyHall}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/20 shrink-0 h-8 text-xs font-bold"
                  >
                    <Plus className="size-3.5 mr-1" /> Thêm Sảnh / Phòng VIP
                  </Button>
                </div>

                {(!partyProfile.party_halls || partyProfile.party_halls.length === 0) && (
                  <div className="text-center py-5 text-xs text-muted-foreground border border-dashed border-blue-500/30 rounded-xl bg-background/50">
                    Chưa có sảnh tiệc riêng nào. Nhấn <strong>&quot;+ Thêm Sảnh / Phòng VIP&quot;</strong> để thiết lập quy cách từng sảnh.
                  </div>
                )}

                <div className="space-y-3">
                  {(partyProfile.party_halls || []).map((hall: any, idx: number) => (
                    <div
                      key={hall.id || idx}
                      className="p-3.5 rounded-xl border border-blue-500/20 bg-background/80 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                          <Building className="size-3.5" /> Sảnh / Phòng #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePartyHall(idx)}
                          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                          title="Xóa sảnh này"
                        >
                          <Trash2 className="size-3.5 mr-1" /> Xóa sảnh
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Tên Sảnh / Tên Phòng VIP *</Label>
                          <Input
                            value={hall.name || ''}
                            onChange={(e) => updatePartyHall(idx, 'name', e.target.value)}
                            placeholder="VD: Sảnh Hoàng Gia / VIP 1"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Sức Chứa Khách</Label>
                          <Input
                            value={hall.capacity || ''}
                            onChange={(e) => updatePartyHall(idx, 'capacity', e.target.value)}
                            placeholder="VD: 20 - 40 khách (hoặc 4 bàn)"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Mức Chi Tiêu / Tiêu Chuẩn Bàn</Label>
                          <Input
                            value={hall.price_min || ''}
                            onChange={(e) => updatePartyHall(idx, 'price_min', e.target.value)}
                            placeholder="VD: Từ 3.000.000đ/bàn"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Trang Thiết Bị &amp; Đặc Điểm</Label>
                        <Input
                          value={hall.features || ''}
                          onChange={(e) => updatePartyHall(idx, 'features', e.target.value)}
                          placeholder="VD: Dàn Karaoke chọn bài, Màn LED 200 inch, Máy lạnh riêng, View sân vườn, Lối đi riêng"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mô tả không gian */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Mô Tả Chi Tiết Không Gian Tiệc</Label>
                <Textarea
                  value={partyProfile.party_description || ''}
                  onChange={(e) => handlePartyProfileChange('party_description', e.target.value)}
                  placeholder="Giới thiệu về các sảnh tiệc, sức chứa các phòng VIP, trang thiết bị âm thanh ánh sáng..."
                  rows={3}
                />
              </div>

              {/* Hình ảnh Sảnh Tiệc & Phòng VIP từ thiết bị */}
              <div className="space-y-4 pt-4 border-t border-amber-500/20">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                    <ImageIcon className="size-4" /> Ảnh Sảnh Tiệc Chính (Banner Tiệc 16:9)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hình ảnh này sẽ xuất hiện trên đầu trang sảnh tiệc riêng và thẻ giới thiệu của quán.
                  </p>
                </div>
                <div className="w-full max-w-md h-44">
                  <ImageUpload
                    value={partyProfile.party_banner_url || ''}
                    onChange={(url) => handlePartyProfileChange('party_banner_url', url)}
                    className="w-full h-44 aspect-[16/9]"
                    label="Tải ảnh sảnh tiệc chính từ thiết bị (16:9)"
                  />
                </div>

                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-400" /> Thư Viện Ảnh Phòng VIP & Không Gian Tiệc
                    </Label>
                    <span className="text-[11px] text-muted-foreground">Tối đa 6 ảnh</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(partyProfile.party_gallery || []).map((imgUrl: string, idx: number) => (
                      <div key={idx} className="aspect-[4/3] relative rounded-xl overflow-hidden group border border-border">
                        <img src={imgUrl} alt={`Party Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (partyProfile.party_gallery || []).filter((_: any, i: number) => i !== idx);
                            handlePartyProfileChange('party_gallery', next);
                          }}
                          className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {(partyProfile.party_gallery || []).length < 6 && (
                      <div className="aspect-[4/3]">
                        <ImageUpload
                          value=""
                          onChange={(url) => {
                            if (url) {
                              const cur = partyProfile.party_gallery || [];
                              handlePartyProfileChange('party_gallery', [...cur, url]);
                            }
                          }}
                          className="w-full h-full aspect-[4/3]"
                          label="+ Tải ảnh phòng VIP"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Đường Dẫn Thực Đơn Tiệc & Báo Giá Chi Tiết */}
              <div className="space-y-3 pt-4 border-t border-amber-500/20 bg-amber-500/5 p-4 md:p-5 rounded-2xl border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                      <Wine className="size-4" /> Đường Dẫn Thực Đơn Tiệc &amp; Báo Giá Trọn Gói
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dán đường link xem thực đơn tiệc, các gói set menu và bảng giá đồ uống chi tiết để khách đặt tiệc tham khảo.
                    </p>
                  </div>
                  {partyProfile.party_menu_url && /^https?:\/\//.test(partyProfile.party_menu_url) && (
                    <Button asChild variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-50 shrink-0">
                      <a href={partyProfile.party_menu_url} target="_blank" rel="noopener noreferrer">
                        Xem thử thực đơn ↗
                      </a>
                    </Button>
                  )}
                </div>
                <Input
                  value={partyProfile.party_menu_url || ""}
                  onChange={(e) => handlePartyProfileChange("party_menu_url", e.target.value)}
                  placeholder="https://... (Dán đường link thực đơn tiệc chi tiết của nhà hàng)"
                />
              </div>

              {/* Danh sách Set Menu động & Thêm dòng từng món ăn */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-bold flex items-center gap-1.5 text-amber-500">
                      <Utensils className="size-4" /> Gợi Ý Set Menu Tiệc &amp; Thực Đơn Từng Món
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Thêm set menu và thêm từng dòng món ăn chi tiết (khai vị, món chính, lẩu, tráng miệng).
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSetMenu} className="h-8 text-xs border-amber-500 text-amber-600 font-bold">
                    <Plus className="size-3.5 mr-1" /> Thêm Set Menu
                  </Button>
                </div>

                <div className="space-y-4">
                  {(!partyProfile.set_menus || partyProfile.set_menus.length === 0) && (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl">
                      Chưa có set menu nào. Nhấn &quot;Thêm Set Menu&quot; để tạo thực đơn mẫu kèm từng món cho khách.
                    </div>
                  )}

                  {(partyProfile.set_menus || []).map((menu: any, menuIdx: number) => (
                    <div key={menu.id || menuIdx} className="p-4 rounded-2xl border border-zinc-800 bg-muted/20 space-y-3.5">
                      {/* Set menu header inputs */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="w-16 h-16 shrink-0">
                          <ImageUpload
                            value={menu.image_url || ''}
                            onChange={(url) => updateSetMenu(menuIdx, 'image_url', url)}
                            className="w-16 h-16"
                            label="Ảnh"
                          />
                        </div>
                        <div className="flex-1 space-y-1 w-full sm:w-auto">
                          <Label className="text-[11px] font-bold">Tên Set Menu *</Label>
                          <Input
                            value={menu.name || ''}
                            onChange={(e) => updateSetMenu(menuIdx, 'name', e.target.value)}
                            placeholder="VD: Set Tiệc Đại Lộc 1 (Hải Sản)"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="w-full sm:w-40 space-y-1">
                          <Label className="text-[11px] font-bold">Giá (VNĐ/bàn)</Label>
                          <Input
                            type="number"
                            step={50000}
                            value={menu.price || 0}
                            onChange={(e) => updateSetMenu(menuIdx, 'price', parseInt(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="w-full sm:w-28 space-y-1">
                          <Label className="text-[11px] font-bold">Số người/bàn</Label>
                          <Input
                            type="number"
                            value={menu.pax || 10}
                            onChange={(e) => updateSetMenu(menuIdx, 'pax', parseInt(e.target.value) || 10)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSetMenu(menuIdx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-500/10 h-8 px-2 sm:mt-5"
                          title="Xóa cả Set Menu này"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {/* Danh sách từng món ăn trong set menu (Dishes list) */}
                      <div className="pt-2 border-t border-border/60 pl-2 sm:pl-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                            <CornerDownRight className="size-3.5 text-amber-500" /> Các món trong set:
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addDishToMenu(menuIdx)}
                            className="h-7 text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                          >
                            <Plus className="size-3 mr-1" /> Thêm món vào set
                          </Button>
                        </div>

                        {(!menu.dishes || menu.dishes.length === 0) && (
                          <div className="text-[11px] text-muted-foreground italic">
                            Chưa có món chi tiết. Bấm &quot;+ Thêm món vào set&quot; để bổ sung từng món (Khai vị, Món chính, Lẩu...).
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {(menu.dishes || []).map((dish: string, dishIdx: number) => (
                            <div key={dishIdx} className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-zinc-500 w-14 shrink-0">
                                Món {dishIdx + 1}:
                              </span>
                              <Input
                                value={dish || ''}
                                onChange={(e) => updateDishInMenu(menuIdx, dishIdx, e.target.value)}
                                placeholder={`VD: Món ${dishIdx + 1} (Khai vị 3 món / Cá chẽm hấp / Lẩu hải sản...)`}
                                className="h-7 text-xs flex-1 bg-background"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDishFromMenu(menuIdx, dishIdx)}
                                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400"
                                title="Xóa món này"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MỤC MỚI: Bảng Quy Cách & Chính Sách Tiệc Tùy Chỉnh (Custom Specifications & Policies) */}
              <div className="space-y-4 p-4 md:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <FileText className="size-4" /> Bảng Quy Cách &amp; Chính Sách Phục Vụ Tiệc
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tùy biến quy định riêng của quán: chính sách đặt cọc, quy định mang đồ uống vào, thời gian tiệc, trang trí, v.v.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPartySpecification}
                    className="border-amber-500 text-amber-400 hover:bg-amber-500/20 shrink-0 h-8 text-xs font-bold"
                  >
                    <Plus className="size-3.5 mr-1" /> Thêm Quy Cách / Chính Sách
                  </Button>
                </div>

                {(!partyProfile.party_specifications || partyProfile.party_specifications.length === 0) && (
                  <div className="text-center py-5 text-xs text-muted-foreground border border-dashed border-amber-500/30 rounded-xl bg-background/50">
                    Chưa có quy cách tiệc nào. Nhấn <strong>&quot;+ Thêm Quy Cách / Chính Sách&quot;</strong> để nhập chính sách đặt cọc, đồ uống...
                  </div>
                )}

                <div className="space-y-3">
                  {(partyProfile.party_specifications || []).map((spec: any, specIdx: number) => (
                    <div
                      key={spec.id || specIdx}
                      className="p-3.5 rounded-xl border border-amber-500/20 bg-background/80 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                          <FileText className="size-3.5" /> Mục Quy Cách #{specIdx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePartySpecification(specIdx)}
                          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                          title="Xóa mục quy cách này"
                        >
                          <Trash2 className="size-3.5 mr-1" /> Xóa mục
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Tiêu Đề Quy Cách / Chính Sách *</Label>
                        <Input
                          value={spec.title || ''}
                          onChange={(e) => updatePartySpecification(specIdx, 'title', e.target.value)}
                          placeholder="VD: Chính sách Đặt Cọc & Hoàn Hủy / Đồ Uống Mang Vào / Phụ Thu Ngoài Giờ"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Nội Dung Chi Tiết *</Label>
                        <Textarea
                          value={spec.content || ''}
                          onChange={(e) => updatePartySpecification(specIdx, 'content', e.target.value)}
                          placeholder="VD: Đặt cọc trước 30% để giữ sảnh và chốt thực đơn; Hoàn 100% nếu báo hủy trước 7 ngày. Miễn phí mang 1 thùng bia cho đoàn từ 30 khách..."
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
      {/* Floating Save Button */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 md:hidden">
        <Button onClick={handleSave} disabled={saving} size="lg" className="bg-gold text-ink hover:bg-gold/90 shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform rounded-full px-6 h-14">
          <Save className="mr-2 size-5" />
          {saving ? "Đang lưu..." : "Lưu ngay"}
        </Button>
      </div>
    </div>
  );
}
