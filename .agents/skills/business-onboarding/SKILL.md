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
- Dùng `browser_subagent` (Trình duyệt ảo) hoặc công cụ đọc url để duyệt link.
- TUYỆT ĐỐI KHÔNG BỊA ĐẶT THÔNG TIN. Nếu không có, hãy để trống hoặc mảng rỗng `[]`.
- Yêu cầu BẮT BUỘC phải trích xuất các trường sau:
  + `slug`: (url thân thiện, ví dụ: `spa-lam-dep-xyz`)
  + `name`: Tên thương hiệu
  + `email`: BẮT BUỘC CÓ. Nếu website/fanpage không ghi email, TỰ ĐỘNG TẠO email giả lập theo format: `<slug>@1booking.asia`. ĐÂY SẼ LÀ TÀI KHOẢN ĐĂNG NHẬP CỦA HỌ.
  + `phone` và `address`.
  + `page_content.gallery`: Lấy các link ảnh đẹp nhất (bỏ ảnh mờ/nhỏ).
  + `page_content.services`: Lấy danh sách dịch vụ.
  + `page_content.banners`: Hình ảnh chữ nhật ngang rõ nét.

## BƯỚC 2: TỔNG HỢP & VIẾT LẠI (SYNTHESIS)
- Viết lại đoạn Giới thiệu (description) sao cho hay, chuẩn SEO.
- Định dạng thành file JSON chuẩn của bảng `businesses` và lưu vào thư mục `data/onboarding/queue/`. (KHÔNG TỰ Ý ĐẶT TRẠNG THÁI PUBLISHED).

## BƯỚC 3: ĐẨY LÊN BẢN NHÁP (DRAFT PUSH)
- Chạy lệnh `node scripts/seed_business.mjs` để đẩy file JSON vừa tạo lên cơ sở dữ liệu.
- Kịch bản này sẽ tự động tạo Tài khoản đăng nhập (Auth) với mật khẩu mặc định là `123456`, đồng thời tự động set trạng thái gian hàng là `draft` (Bản nháp).
- Lúc này gian hàng ĐÃ ĐƯỢC TẠO nhưng BỊ ẨN khỏi trang chủ.
- Báo cáo lại cho người dùng: Cung cấp link trực tiếp (ví dụ: `http://localhost:3000/spa-xyz`) để người dùng có thể xem giao diện hiển thị TRỰC QUAN ngay lập tức.
- Nhắc nhở người dùng: "Anh có thể xem trang trực quan, nếu ưng ý thì vào trang **Quản trị (Admin Panel)** để đổi trạng thái từ Draft sang Published nhé!".
