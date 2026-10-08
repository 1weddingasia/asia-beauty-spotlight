import type { Metadata } from "next";
import ArenaClient from "./ArenaClient";

export const metadata: Metadata = {
  title: "CLB Thể Thao Arena – Đặt Sân Pickleball & Cầu Lông Chuẩn Thi Đấu",
  description:
    "Đặt sân Pickleball & Cầu Lông online tức thì. Hệ thống tự động xác nhận ngay sau 1 giây.",
};

const BASE =
  "https://ejlltaigohemjagfzxxh.supabase.co/storage/v1/object/public/media/demos/arena-sport";

export default function ArenaPage() {
  return (
    <ArenaClient
      heroImage={`${BASE}/arena-hero.png`}
      nightImage={`${BASE}/arena-night.png`}
      badmintonImage={`${BASE}/arena-badminton.png`}
      equipmentImage={`${BASE}/arena-equipment.png`}
    />
  );
}
