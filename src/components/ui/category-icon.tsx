import {
  Sparkles,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
  Dumbbell,
  ShoppingBag,
  Wrench,
  Briefcase,
  PawPrint,
  Camera,
  Plane,
  Car,
  Smile,
  GraduationCap,
  Theater,
  Store,
  MapPin,
  Building2,
  Landmark,
  Waves,
  Sun,
  Mountain,
  Compass,
  Sailboat,
  Factory,
  HardHat,
  LucideProps,
} from "lucide-react";

interface CategoryIconProps extends Omit<LucideProps, "name"> {
  slug?: string | null;
  name?: string | null;
}

export function CategoryIcon({ slug = "", name = "", className = "size-6", ...props }: CategoryIconProps) {
  const key = `${slug || ""} ${name || ""}`.toLowerCase();

  // Nails / Mi
  if (key.includes("nail") || key.includes("noi-mi") || key.includes("uon-mi") || key.includes("eyelash")) {
    return <Sparkles className={className} {...props} />;
  }

  // Spa / Massage / Thư giãn
  if (key.includes("spa") || key.includes("thu-gian") || key.includes("massage")) {
    return <Sparkles className={className} {...props} />;
  }

  // Tóc / Salon / Barbershop
  if (key.includes("salon") || key.includes("toc") || key.includes("barber") || key.includes("hair")) {
    return <Scissors className={className} {...props} />;
  }

  // Nha khoa
  if (key.includes("nha-khoa") || key.includes("rang") || key.includes("dental")) {
    return <Smile className={className} {...props} />;
  }

  // Clinic / Thẩm mỹ viện / Y tế / Sức khỏe
  if (key.includes("clinic") || key.includes("tham-my") || key.includes("y-te") || key.includes("suc-khoe") || key.includes("health")) {
    return <Stethoscope className={className} {...props} />;
  }

  // Ẩm thực / Nhà hàng / Quán ăn / Cafe / F&B
  if (key.includes("nha-hang") || key.includes("am-thuc") || key.includes("dining") || key.includes("fnb") || key.includes("cafe") || key.includes("quan-an")) {
    return <UtensilsCrossed className={className} {...props} />;
  }

  // Fitness / Gym / Yoga / Thể thao
  if (key.includes("fitness") || key.includes("the-thao") || key.includes("gym") || key.includes("yoga") || key.includes("sport")) {
    return <Dumbbell className={className} {...props} />;
  }

  // Thời trang / Mua sắm
  if (key.includes("thoi-trang") || key.includes("mua-sam") || key.includes("fashion") || key.includes("shop")) {
    return <ShoppingBag className={className} {...props} />;
  }

  // Ô tô / Xe máy / Detailing
  if (key.includes("o-to") || key.includes("xe-may") || key.includes("auto") || key.includes("car-") || key.includes("carwash")) {
    return <Car className={className} {...props} />;
  }

  // Thú cưng / Pet
  if (key.includes("thu-cung") || key.includes("pet")) {
    return <PawPrint className={className} {...props} />;
  }

  // Studio / Chụp ảnh / Áo cưới
  if (key.includes("studio") || key.includes("chup-anh") || key.includes("photo") || key.includes("camera") || key.includes("cuoi")) {
    return <Camera className={className} {...props} />;
  }

  // Du lịch / Homestay / Khách sạn / Lưu trú
  if (key.includes("du-lich") || key.includes("luu-tru") || key.includes("travel") || key.includes("hotel") || key.includes("homestay")) {
    return <Plane className={className} {...props} />;
  }

  // Sửa chữa / Điện nước / Bảo trì
  if (key.includes("sua-chua") || key.includes("dien-nuoc") || key.includes("bao-tri") || key.includes("repair")) {
    return <Wrench className={className} {...props} />;
  }

  // Giáo dục / Đào tạo
  if (key.includes("giao-duc") || key.includes("education") || key.includes("dao-tao")) {
    return <GraduationCap className={className} {...props} />;
  }

  // Tư vấn / Doanh nghiệp / Consulting
  if (key.includes("tu-van") || key.includes("consulting") || key.includes("coaching") || key.includes("business")) {
    return <Briefcase className={className} {...props} />;
  }

  // Giải trí / Nghệ thuật
  if (key.includes("giai-tri") || key.includes("entertainment") || key.includes("nghe-thuat")) {
    return <Theater className={className} {...props} />;
  }

  // Mặc định
  return <Store className={className} {...props} />;
}

interface LocationIconProps extends Omit<LucideProps, "name"> {
  slug?: string | null;
  name?: string | null;
}

export function LocationIcon({ slug = "", name = "", className = "size-4", ...props }: LocationIconProps) {
  return <MapPin className={className} {...props} />;
}
