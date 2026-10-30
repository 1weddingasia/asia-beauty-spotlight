<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NGUYÊN TẮC BẮT BUỘC VỀ TOÀN VẸN DỮ LIỆU (DATA INTEGRITY)
1. **TUYỆT ĐỐI CẤM BỊA ĐẶT DỮ LIỆU:** Mọi thông tin (Tên quán, Hotline, Zalo, Địa chỉ, Tọa độ GPS, Giá dịch vụ, Hình ảnh, Banner, Logo, Menu, Ưu đãi) nạp vào DB hoặc hiển thị trên giao diện PHẢI LÀ DỮ LIỆU THẬT 100%, được đối soát từ website, fanpage hoặc nguồn chính thức.
2. **NGUYÊN TẮC BÁO CÁO KHI THIẾU THÔNG TIN:** Khi nhận dữ liệu mà phát hiện thiếu sót, mâu thuẫn hoặc link ảnh không tồn tại: KHÔNG ĐƯỢC TỰ Ý BỊA ĐẶT để bù vào cho đủ. BẮT BUỘC PHẢI BÁO CÁO RÕ RÀNG điểm thiếu/bất cập và xin ý kiến chỉ đạo.
3. **BẢO ĐẢM MÔI TRƯỜNG PRODUCTION THẬT CHO KHÁCH HÀNG:** Tuyệt đối không để sót dữ liệu demo, mock data (như 0987654321, 68 Phố Ẩm Thực, link ảnh 404) trên giao diện.
