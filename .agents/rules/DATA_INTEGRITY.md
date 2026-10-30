# NGUYÊN TẮC BẮT BUỘC VỀ TOÀN VẸN DỮ LIỆU (DATA INTEGRITY & ANTI-HALLUCINATION)

1. **TUYỆT ĐỐI CẤM BỊA ĐẶT DỮ LIỆU:**
   - Mọi thông tin (Tên doanh nghiệp, Hotline, Zalo, Địa chỉ, Tọa độ GPS, Giá dịch vụ, Hình ảnh, Banner, Logo, Menu, Ưu đãi) nạp vào cơ sở dữ liệu hoặc hiển thị trên giao diện PHẢI LÀ DỮ LIỆU THẬT 100%, được đối soát từ website, fanpage hoặc nguồn chính thức.
   - Không được tự tạo số điện thoại giả, tọa độ ngẫu nhiên, hoặc link ảnh mẫu giả lập (demo).

2. **NGUYÊN TẮC BÁO CÁO KHI THIẾU THÔNG TIN:**
   - Khi nhận dữ liệu mà phát hiện thiếu sót, mâu thuẫn cú pháp hoặc link ảnh chưa tồn tại: **KHÔNG ĐƯỢC TỰ Ý BỊA ĐẶT** để bù vào cho đủ.
   - **BẮT BUỘC PHẢI BÁO CÁO RÕ RÀNG** điểm thiếu/bất cập, liệt kê chi tiết và xin ý kiến chỉ đạo từ người dùng.

3. **BẢO ĐẢM MÔI TRƯỜNG PRODUCTION THẬT CHO KHÁCH HÀNG:**
   - Ứng dụng phục vụ khách hàng và đối tác thẩm định trực tiếp.
   - Tuyệt đối không để sót dữ liệu demo, mock data (như số điện thoại 0987654321, địa chỉ ảo) hay các link ảnh bị 404 trên giao diện.
