# 🚀 HƯỚNG DẪN KÍCH HOẠT ZALO GATEWAY — 1BEAUTY.ASIA

> Code đã sẵn sàng 100% trong codebase. Chỉ cần thực hiện các bước dưới đây để bật.

---

## PHẦN 1: Chuẩn bị (Làm 1 lần duy nhất)

### Bước 1: Chuẩn bị tài khoản & phần cứng

- **VPS**: Khuyến nghị DigitalOcean $4/tháng (1GB RAM, Ubuntu 22.04 LTS).
  - Mua tại: https://digitalocean.com hoặc Vultr.com
- **Số Zalo phụ**: Khuyến nghị **2-3 số SIM rác** (SIM không dùng SĐT chính).
  - Lý do dùng nhiều số: Hệ thống tự xoay vòng (round-robin) để mỗi số chỉ gửi 1 tin/mỗi vài lần có khách → không bị Zalo checkpoint vì tần suất cao.
  - Đặt mua SIM rác: ~20.000đ/SIM tại bất kỳ cửa hàng điện thoại nào.

---

### Bước 2: Cài abs-zalo-bot lên VPS

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Cài Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone và cài abs-zalo-bot
git clone https://github.com/teddiesloco/abs-zalo-bot.git
cd abs-zalo-bot
./install.sh   # hoặc: npm install
```

---

### Bước 3: Cấu hình abs-zalo-bot

Tạo file `.env` trong thư mục `abs-zalo-bot`:

```bash
# abs-zalo-bot/.env
BRIDGE_TOKEN=your_super_secret_token_here   # Tự tạo chuỗi ngẫu nhiên
PORT=3871
```

---

### Bước 4: Đăng nhập từng số Zalo phụ

```bash
# Chạy bot lần đầu
npm start

# Mở trình duyệt tại: http://your-vps-ip:3871/connect
# → Dùng Zalo App trên điện thoại quét QR để đăng nhập tài khoản phụ
# → Sau khi đăng nhập, lưu lại userId của tài khoản đó

# Lặp lại cho mỗi số Zalo phụ (nếu có nhiều số thì chạy nhiều instance trên port khác)
```

**Lấy userId Zalo của mình để điền vào ZALO_ADMIN_ID:**
- Đăng nhập Zalo Web tại: https://chat.zalo.me
- Mở DevTools (F12) → Application → Local Storage → tìm `zlocalStorage` → lấy giá trị `userId`

---

### Bước 5: Chạy 24/7 bằng PM2

```bash
npm install -g pm2
pm2 start src/cli.js --name zalo-1beauty
pm2 startup
pm2 save
```

---

### Bước 6: Thêm `zalo_owner_id` vào từng tiệm trong Supabase

Mỗi chủ tiệm cần cung cấp Zalo userId của họ. Chạy SQL trong Supabase:

```sql
-- Cập nhật Zalo ID cho tiệm (thay 'luxury-spa-demo' và userId thực)
UPDATE businesses
SET page_content = page_content || '{"zalo_owner_id": "123456789"}'::jsonb
WHERE slug = 'luxury-spa-demo';
```

---

## PHẦN 2: Kích hoạt trong 1Beauty.Asia (Vercel)

### Thêm 4 biến môi trường vào Vercel Dashboard

Vào: https://vercel.com → Project → Settings → Environment Variables

| Tên biến | Giá trị ví dụ | Ghi chú |
|---|---|---|
| `ZALO_ENABLED` | `true` | **Công tắc chính — Tắt = `false` hoặc xóa biến** |
| `ZALO_SIDECAR_URL` | `http://123.456.789.0:3871` | IP VPS của anh |
| `ZALO_SIDECAR_TOKEN` | `abc123xyz...` | Phải khớp với `BRIDGE_TOKEN` trong abs-zalo-bot |
| `ZALO_SENDER_IDS` | `111111,222222,333333` | userId của các tài khoản Zalo phụ, ngăn bằng dấu phẩy |
| `ZALO_ADMIN_ID` | `your-personal-zalo-id` | userId Zalo cá nhân của anh Lợi để nhận báo cáo |

Sau khi thêm xong → **Redeploy** (hoặc push 1 commit nhỏ) để apply.

---

## PHẦN 3: Cơ chế Round-Robin (Phân tán tần suất)

Hệ thống đã code sẵn cơ chế xoay vòng số Zalo:

```
Khách 1 → Gửi từ số Zalo phụ A
Khách 2 → Gửi từ số Zalo phụ B  
Khách 3 → Gửi từ số Zalo phụ C
Khách 4 → Gửi từ số Zalo phụ A (vòng lại)
...
```

✅ Với 3 số, mỗi số chỉ gửi 1 tin / 3 khách = tần suất rất thấp, rất an toàn.

---

## PHẦN 4: Kiểm tra sau khi bật

Test thử bằng cách vào `/uu-dai/luxury-spa-demo` và điền số điện thoại.
Kiểm tra log VPS:

```bash
pm2 logs zalo-1beauty
```

Nếu thấy `200 OK` tương ứng với POST `/api/send-message` là thành công! 🎉

---

> **Lưu ý quan trọng:**  
> - Chỉ dùng tài khoản Zalo PHỤ, KHÔNG bao giờ dùng SĐT chính.  
> - VPS phải luôn bật 24/7 (PM2 tự khởi động lại nếu crash).  
> - Nếu Zalo hỏi xác minh OTP, đăng nhập lại là được.  
