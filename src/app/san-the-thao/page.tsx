import type { Metadata } from "next";
import SanTheThaoClient from "./SanTheThaoClient";

export const metadata: Metadata = {
  title: "Sân Thể Thao Đa Năng | Đặt Sân Tự Động",
  description: "Đặt sân Bóng đá, Pickleball, Cầu Lông, Tennis nhanh chóng. Xác nhận tự động.",
};

const BASE =
  "https://ejlltaigohemjagfzxxh.supabase.co/storage/v1/object/public/media/demos/arena-sport";

export default function SanTheThaoPage() {
  return (
    <SanTheThaoClient
      heroImage={`${BASE}/arena-hero.png`}
      nightImage={`${BASE}/arena-night.png`}
      badmintonImage={`${BASE}/arena-badminton.png`}
      equipmentImage={`${BASE}/arena-equipment.png`}
    />
  );
}
