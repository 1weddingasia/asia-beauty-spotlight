# MẪU PROMPT CHUẨN ĐỂ YÊU CẦU AI CÀO DỮ LIỆU GIAN HÀNG

Hãy copy nội dung từ chữ "Antigravity,..." bên dưới, dán vào khung chat và thay thông tin hoặc đường link website của bạn vào ô `[ĐIỀN LINK HOẶC THÔNG TIN VÀO ĐÂY]`.

--------------------------------------------------------------------------------

Antigravity, nhiệm vụ của bạn là Cào Dữ Liệu (Scrape Data) và Tạo Gian Hàng tự động dựa trên link/thông tin sau:
[ĐIỀN LINK HOẶC THÔNG TIN VÀO ĐÂY]

NHỮNG YÊU CẦU BẮT BUỘC KHẮT KHE KHI TẠO GIAN HÀNG (PHẢI LÀM NGHIÊM TÚC, ĐẦY ĐỦ VÀ CHUYÊN NGHIỆP, KHÔNG ĐƯỢC SƠ SÀI):

1. Tagline & Câu Chuyện Thương Hiệu (RẤT QUAN TRỌNG): 
   - `short_description`: Phải có 1 câu Tagline hoặc Slogan tóm tắt định vị của doanh nghiệp (ví dụ: "Nâng tầm vẻ đẹp Việt" hoặc "Chuyên khoa Da liễu hàng đầu"). KHÔNG ĐƯỢC ĐỂ TRỐNG.
   - `description`: Phải viết/cào được Câu chuyện thương hiệu (Về chúng tôi, Tầm nhìn, Sứ mệnh). Bắt buộc viết thành 2-3 đoạn văn dài, có tâm, trình bày rõ ràng. NẾU WEBSITE KHÔNG CÓ, BẠN PHẢI DỰA VÀO NGÀNH NGHỀ ĐỂ TỰ VIẾT MỘT ĐOẠN GIỚI THIỆU CHUYÊN NGHIỆP (Tối thiểu 150 chữ).
   - `amenities`: Trích xuất hoặc dự đoán ít nhất 4-6 Tiện ích không gian (Ví dụ: Chỗ đậu xe ô tô, Wifi miễn phí, Phòng VIP riêng tư, Thanh toán thẻ...). Lưu vào mảng `page_content.amenities`.

2. Thông tin Cơ bản & Liên hệ: 
   - Tên thương hiệu, Điện thoại, Địa chỉ chi tiết, Email. Tự động sinh `slug` chuẩn SEO dựa trên tên.
   - BẮT BUỘC TẠO OBJECT `socials` chứa các link mạng xã hội: `{"facebook": "...", "tiktok": "...", "instagram": "...", "website": "..."}`.
   - Cập nhật số Zalo vào trường `zalo` hoặc `page_content.zalo`.

3. Giờ mở cửa (Working Hours): 
   - Bắt buộc phải khởi tạo cấu trúc mảng Giờ mở cửa cho đủ 7 ngày. Không được bỏ qua. Nếu có thông tin chung (VD: 9:00 - 19:00 hàng ngày), phải tách ra đủ 7 dòng:
     - Thứ 2: 09:00 - 19:00
     - Thứ 3: 09:00 - 19:00
     - Thứ 4: 09:00 - 19:00
     - Thứ 5: 09:00 - 19:00
     - Thứ 6: 09:00 - 19:00
     - Thứ 7: 09:00 - 19:00
     - Chủ nhật: 09:00 - 19:00

4. Hình ảnh thật (Tuyệt đối không dùng Unsplash): 
   - Tìm thẻ `<img/>` của Logo, Banner, Gallery. Lưu vào `page_content.logo_url`, `page_content.banners`, `page_content.gallery`. Phải dùng link tĩnh.

5. Dịch vụ nổi bật: 
   - Bóc tách ít nhất 3-5 dịch vụ/sản phẩm nổi bật đưa vào mảng `services` hoặc `page_content.services`. Điền đầy đủ Tên, Giá (nếu có) và Hình ảnh.

6. Thực thi Database: 
   - Viết và chạy Script Node.js để tự động Upsert toàn bộ JSON này vào bảng `businesses` trên Supabase (tạo user mặc định `123456` với email doanh nghiệp).

7. Báo cáo: 
   - Gửi lại link `1booking.asia/[slug]` để nghiệm thu. Đảm bảo giao diện hiển thị ĐẦY ĐỦ Câu chuyện thương hiệu, Tagline, Tiện ích, Hình ảnh.
