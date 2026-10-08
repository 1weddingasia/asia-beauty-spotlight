---
name: business-onboarding
description: Quy trình nhập liệu Gian hàng Bán tự động (AI Curator Workflow)
---

# Quy trình nhập liệu Gian hàng Bán tự động (AI Curator Workflow)

Bạn đang làm việc trong dự án 1Beauty.Asia / 1Booking.Asia.
Khách hàng cực kỳ quan tâm đến chất lượng dữ liệu của các gian hàng. TUYỆT ĐỐI KHÔNG SỬ DỤNG CÁC SCRIPT CÀO DỮ LIỆU HÀNG LOẠT MÀ KHÔNG CÓ BƯỚC KIỂM DUYỆT.
Bạn phải đóng vai trò là một **Biên tập viên AI (AI Curator)**. Đừng bao giờ làm việc một cách lười biếng, cẩu thả, bịa đặt dữ liệu, hoặc bỏ qua việc đánh giá nội dung.

Khi người dùng (USER) yêu cầu tạo một gian hàng mới từ một đường link (Website / Fanpage), bạn BẮT BUỘC phải tuân thủ nghiêm ngặt 3 bước sau:

## CÁCH KÍCH HOẠT (TRIGGER)
Khi người dùng nói: "Tạo gian hàng từ link...", "Nhập liệu gian hàng...", "Scrape link này...", bạn lập tức kích hoạt quy trình này.

## BƯỚC 1: THU THẬP & CHỌN LỌC (DATA GATHERING)
- Dùng `search_web` hoặc `browser_subagent` để thu thập dữ liệu.
- TUYỆT ĐỐI KHÔNG BỊA ĐẶT, KHÔNG DÙNG THÔNG TIN MẪU. Nếu không có thực tế, BẮT BUỘC ĐỂ TRỐNG (Mảng rỗng `[]` hoặc Chuỗi rỗng `""`).
- **Ngoại lệ bắt buộc (Duy nhất 2 trường):** 
  + **Giờ mở cửa:** Nếu không tìm thấy, mới được dùng mặc định `08:00 - 20:00 (Thứ 2 - Chủ Nhật)`.
  + **Email:** Nếu không có, TỰ ĐỘNG TẠO `<slug>@1booking.asia` để làm tài khoản login.
  + **Số điện thoại:** BẮT BUỘC lấy số hotline thực tế. NẾU KHÔNG CÓ THỰC TẾ TRÊN MẠNG THÌ ĐỂ TRỐNG HOẶC GHI "(Chưa công khai)", TUYỆT ĐỐI KHÔNG LẤY SỐ MẶC ĐỊNH HOẶC BỊA SỐ LUNG TUNG!

**1.1. Ưu tiên Google Maps (Tránh Anti-scraping)**
- BƯỚC A: Mở Google Maps thông qua `browser_subagent` hoặc `search_web` với từ khóa: `[Tên gian hàng] + [Địa chỉ]`.
- BƯỚC B: Tại bảng Google Business Profile, trích xuất:
  + Tên chuẩn xác, Địa chỉ chính xác, Giờ mở cửa, Số điện thoại.
  + Link Website chính thức (nếu có) để nhổ `og:image` ở bước sau.
  + Trích xuất link ảnh từ phần "Photos" của Google Maps (đây là ảnh tĩnh chất lượng cao, link không bao giờ chết như Facebook CDN). Lấy các ảnh không gian (không lấy ảnh có mặt người mờ mịt).

**1.2. Mẹo lấy ảnh Website chuẩn xác 100% (Không cào bừa)**
Khi duyệt website, tuyệt đối không quét bừa thẻ `<img>` (dễ dính icon nhỏ, pixel theo dõi). Bắt buộc chỉ bốc:
- **Ảnh đại diện/Banner**: Lấy đúng thẻ `<meta property="og:image" content="...">`. Đây luôn là ảnh nét nhất chủ tiệm chọn.
- **Logo**: Lấy từ `<link rel="icon">` hoặc `<meta property="og:logo">`.

**1.3. Cơ chế Fallback (Bỏ Trống Thay Bằng Màu Chủ Đạo)**
Nếu link ảnh bị chết, không có ảnh, hoặc kích thước nhỏ (<400x400px), TUYỆT ĐỐI KHÔNG dùng ảnh mạng (như Unsplash hay kho ảnh mẫu vì chất lượng không đảm bảo).
Thay vào đó, trả về mảng rỗng `[]` cho banner và chuỗi rỗng `""` cho logo. Giao diện (Frontend) sẽ tự động hiển thị màn hình trống với tông màu chủ đạo của hệ thống thay thế cho hình ảnh.

## BƯỚC 2: TỔNG HỢP & VIẾT LẠI (SYNTHESIS)
- Viết lại đoạn Giới thiệu (description) sao cho hay, chuẩn SEO. BẮT BUỘC tạo email theo format: `<slug>@1booking.asia` (nếu không có sẵn).
- BẠN BẮT BUỘC PHẢI KHAI THÁC TỐI ĐA VÀ ĐẦY ĐỦ CÁC TRƯỜNG DỮ LIỆU SAU (Theo chuẩn CSDL):
  1. `name`, `slug` (không dấu, cách nhau bởi `-`), `address`, `phone`, `email`
  2. `short_description` (1-2 câu tóm tắt), `description` (Bài viết PR chi tiết, CHỈ SỬ DỤNG VĂN BẢN THUẦN / PLAIN TEXT với ký tự `\n` để xuống dòng, TUYỆT ĐỐI KHÔNG dùng thẻ HTML như `<b>`, `<br>`, v.v.)
  3. `website`, `zalo` (số zalo)
  4. `socials`: Lấy link `facebook`, `tiktok`, `youtube`, `instagram`
  5. `seo_title`, `seo_description`
  6. Các trường trong `page_content`:
     - `logo_url`, `banners` (mảng url), `gallery` (mảng url ảnh không gian)
     - `working_hours` (Giờ làm việc)
     - `price_range` (Ví dụ: "100.000đ - 5.000.000đ" hoặc "$$ - $$$")
     - `amenities` (Tiện ích: "Có chỗ đậu xe", "Wifi miễn phí", "Phòng VIP", v.v.)
     - `services` (Danh sách dịch vụ kèm giá)
     - `deals` (Các chương trình khuyến mãi/ưu đãi lấy từ web/facebook)
     - `map_embed` (Chuỗi iframe mã nhúng bản đồ Google Maps nếu có)
- Định dạng thành file JSON chuẩn và lưu vào `data/onboarding/queue/`. (KHÔNG TỰ Ý ĐẶT TRẠNG THÁI PUBLISHED).

## BƯỚC 3: ĐẨY LÊN BẢN NHÁP (DRAFT PUSH)
- Chạy lệnh `node scripts/seed_business.mjs` để đẩy file JSON lên cơ sở dữ liệu. Hoặc dùng `auto_onboard_ai.mjs` đã được tinh chỉnh.
- Gian hàng sẽ tự động có Auth (pass: `123456`) và ở trạng thái `draft`.
- Gửi link preview (ví dụ: `http://localhost:3000/spa-xyz`) cho USER duyệt trực quan.
