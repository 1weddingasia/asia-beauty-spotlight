import React from "react";
import {
  Sparkles,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
  Dumbbell,
  ShoppingBag,
  Wrench,
  GraduationCap,
  PawPrint,
  Camera,
  Plane,
  Car,
  Theater,
  Store,
  Flower2,
  MapPin,
  LucideProps,
} from "lucide-react";

// Icon răng chuẩn y khoa / nha khoa sắc nét
function ToothIcon({ className = "size-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M7 3C4.5 3 3 5 3 7.5C3 10.5 4.5 13 5.5 15.5C6.5 18 7.5 22 9.5 22C11 22 11.2 19 12 17C12.8 19 13 22 14.5 22C16.5 22 17.5 18 18.5 15.5C19.5 13 21 10.5 21 7.5C21 5 19.5 3 17 3C15 3 13.5 4 12 5.5C10.5 4 9 3 7 3Z" />
      <path d="M9 8C9 7 10 6 12 6C14 6 15 7 15 8" opacity="0.6" />
    </svg>
  );
}

interface CategoryIconProps extends Omit<LucideProps, "name"> {
  slug?: string | null;
  name?: string | null;
}

// Helper kiểm tra từ/cụm từ an toàn cho tiếng Việt (tránh lỗi của \b trong JS RegExp với ký tự có dấu)
function hasWordOrPhrase(target: string, phrases: string[]): boolean {
  if (!target) return false;
  return phrases.some((phrase) => {
    // Cụm từ có khoảng cách hoặc dấu nối: kiểm tra substring an toàn
    if (phrase.includes(" ") || phrase.includes("-")) {
      return target.includes(phrase);
    }
    // Từ đơn: kiểm tra biên giới từ có hỗ trợ dải ký tự tiếng Việt Unicode
    const regex = new RegExp(`(^|[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])${phrase}([^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]|$)`, "i");
    return regex.test(target);
  });
}

export function CategoryIcon({ slug = "", name = "", className = "size-6", ...props }: CategoryIconProps) {
  const cleanSlug = (slug || "").toLowerCase().trim();
  const cleanName = (name || "").toLowerCase().trim();

  // 1. Phân loại chuẩn xác theo slug
  if (cleanSlug.includes("nha-khoa") || cleanSlug.includes("dental") || cleanSlug.includes("implant")) {
    return <ToothIcon className={className} {...props} />;
  }

  if (cleanSlug.includes("thoi-trang") || cleanSlug.includes("mua-sam") || cleanSlug.includes("fashion") || cleanSlug.includes("shop")) {
    return <ShoppingBag className={className} {...props} />;
  }

  if (cleanSlug.includes("spa") || cleanSlug.includes("massage") || cleanSlug.includes("thu-gian")) {
    return <Flower2 className={className} {...props} />;
  }

  if (cleanSlug.includes("nail") || cleanSlug.includes("noi-mi") || cleanSlug.includes("uon-mi") || cleanSlug.includes("eyelash") || /(^|-)mi(-|$)/.test(cleanSlug)) {
    return <Sparkles className={className} {...props} />;
  }

  if (cleanSlug.includes("salon") || cleanSlug.includes("toc") || cleanSlug.includes("barber") || cleanSlug.includes("hair")) {
    return <Scissors className={className} {...props} />;
  }

  if (cleanSlug.includes("clinic") || cleanSlug.includes("tham-my") || cleanSlug.includes("y-te") || cleanSlug.includes("bac-si") || cleanSlug.includes("health")) {
    return <Stethoscope className={className} {...props} />;
  }

  if (cleanSlug.includes("nha-hang") || cleanSlug.includes("am-thuc") || cleanSlug.includes("dining") || cleanSlug.includes("fnb") || cleanSlug.includes("cafe") || cleanSlug.includes("quan-an") || cleanSlug.includes("food")) {
    return <UtensilsCrossed className={className} {...props} />;
  }

  if (cleanSlug.includes("fitness") || cleanSlug.includes("the-thao") || cleanSlug.includes("gym") || cleanSlug.includes("yoga") || cleanSlug.includes("sport")) {
    return <Dumbbell className={className} {...props} />;
  }

  if (cleanSlug.includes("sua-chua") || cleanSlug.includes("dich-vu") || cleanSlug.includes("dien-nuoc") || cleanSlug.includes("bao-tri") || cleanSlug.includes("repair")) {
    return <Wrench className={className} {...props} />;
  }

  if (cleanSlug.includes("giao-duc") || cleanSlug.includes("tu-van") || cleanSlug.includes("education") || cleanSlug.includes("dao-tao")) {
    return <GraduationCap className={className} {...props} />;
  }

  if (cleanSlug.includes("thu-cung") || cleanSlug.includes("pet")) {
    return <PawPrint className={className} {...props} />;
  }

  if (cleanSlug.includes("studio") || cleanSlug.includes("chup-anh") || cleanSlug.includes("photo") || cleanSlug.includes("camera") || cleanSlug.includes("cuoi")) {
    return <Camera className={className} {...props} />;
  }

  if (cleanSlug.includes("du-lich") || cleanSlug.includes("luu-tru") || cleanSlug.includes("travel") || cleanSlug.includes("hotel") || cleanSlug.includes("homestay")) {
    return <Plane className={className} {...props} />;
  }

  if (cleanSlug.includes("o-to") || cleanSlug.includes("xe-may") || cleanSlug.includes("auto") || cleanSlug.includes("car-") || cleanSlug.includes("-car") || cleanSlug === "car") {
    return <Car className={className} {...props} />;
  }

  if (cleanSlug.includes("giai-tri") || cleanSlug.includes("entertainment") || cleanSlug.includes("nghe-thuat")) {
    return <Theater className={className} {...props} />;
  }

  // 2. Fallback theo tên tiếng Việt (dùng bộ nhận diện chuẩn Unicode không dính từ chéo)
  if (hasWordOrPhrase(cleanName, ["răng", "nha khoa", "implant", "niềng răng", "dental"])) {
    return <ToothIcon className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["thời trang", "mua sắm", "quần áo", "phụ kiện", "fashion", "boutique", "shop"])) {
    return <ShoppingBag className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["spa", "massage", "thư giãn", "body", "trị liệu"])) {
    return <Flower2 className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["nail", "móng", "nối mi", "uốn mi", "eyelash"])) {
    return <Sparkles className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["tóc", "salon", "barber", "cắt tóc", "uốn duỗi", "nhuộm"])) {
    return <Scissors className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["clinic", "thẩm mỹ", "tiêm", "filler", "laser", "y tế", "bác sĩ"])) {
    return <Stethoscope className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["nhà hàng", "ẩm thực", "quán ăn", "cafe", "cà phê", "ăn uống", "dining"])) {
    return <UtensilsCrossed className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["gym", "fitness", "thể thao", "yoga", "bơi lội", "pilates"])) {
    return <Dumbbell className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["sửa chữa", "bảo trì", "điện nước", "cứu hộ"])) {
    return <Wrench className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["giáo dục", "đào tạo", "tư vấn", "học nghề", "dạy nghề"])) {
    return <GraduationCap className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["thú cưng", "chó", "mèo", "pet"])) {
    return <PawPrint className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["studio", "chụp ảnh", "áo cưới", "nhiếp ảnh"])) {
    return <Camera className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["du lịch", "lưu trú", "khách sạn", "homestay", "resort"])) {
    return <Plane className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["ô tô", "xe máy", "rửa xe", "detailing"])) {
    return <Car className={className} {...props} />;
  }
  if (hasWordOrPhrase(cleanName, ["giải trí", "nghệ thuật", "rạp chiếu phim", "sân khấu", "entertainment"])) {
    return <Theater className={className} {...props} />;
  }

  return <Store className={className} {...props} />;
}

interface LocationIconProps extends Omit<LucideProps, "name"> {
  slug?: string | null;
  name?: string | null;
}

export function LocationIcon({ slug = "", name = "", className = "size-4", ...props }: LocationIconProps) {
  return <MapPin className={className} {...props} />;
}
