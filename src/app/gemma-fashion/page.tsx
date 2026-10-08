import FashionClient from "./FashionClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GEMMA CLOTHING | Đặt hàng & Ưu đãi",
  description: "Thời trang xu hướng & Phụ kiện",
};

export default function GemmaFashionPage() {
  return (
    <FashionClient 
      heroImage="/gemma_hero.png"
      product1="/gemma_product1.png"
      product2="/gemma_product2.png"
    />
  );
}
