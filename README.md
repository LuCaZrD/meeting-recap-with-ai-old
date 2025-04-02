# Meeting Recap AI

Ứng dụng web giúp người dùng tạo tóm tắt tự động từ các file ghi âm cuộc họp bằng cách sử dụng trí tuệ nhân tạo.

![Meeting Recap AI](https://i.imgur.com/YQ6GmVh.png)

## Tính năng

- **Tải lên file âm thanh**
  - Hỗ trợ các định dạng phổ biến (MP3, WAV, M4A)
  - Tải từ máy tính hoặc Google Drive

- **Nhập thông tin cuộc họp**
  - Tiêu đề, ngày tổ chức, danh sách người tham gia
  - Mục đích cuộc họp

- **Tùy chỉnh prompt cho AI**
  - Prompt mặc định hoặc tùy chỉnh
  - Khôi phục prompt mặc định dễ dàng

- **Xử lý âm thanh và tạo tóm tắt**
  - Tối ưu hóa âm thanh
  - Chuyển đổi âm thanh thành văn bản
  - Tạo tóm tắt có cấu trúc

- **Xuất kết quả**
  - Hiển thị định dạng Markdown
  - Sao chép vào clipboard
  - Tải xuống dạng file

## Công nghệ sử dụng

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Markdown
- Google Generative AI (Gemini API)

## Cách cài đặt

```bash
# Clone repository
git clone https://github.com/quangkhai771/meeting-recap-with-ai.git
cd meeting-recap-with-ai

# Cài đặt dependencies
npm install

# Cài đặt Google Generative AI và types
npm install @google/generative-ai @types/node --save
```

### Cấu hình biến môi trường

1. Tạo file `.env.local` trong thư mục gốc của dự án
2. Thêm API key của Google Gemini vào file:

```
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Để lấy Gemini API key:
- Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
- Đăng nhập và tạo API key mới
- Sao chép và dán vào file `.env.local`

### Chạy ứng dụng

```bash
# Khởi động môi trường development
npm run dev
```

Truy cập ứng dụng tại [http://localhost:3005](http://localhost:3005)

## Triển khai

Dự án này đã được triển khai trên Cloudflare Pages: [https://meeting-recap-ai.pages.dev](https://meeting-recap-ai.pages.dev)

### Triển khai lên Cloudflare Pages

1. Đăng ký tài khoản [Cloudflare](https://dash.cloudflare.com/sign-up)
2. Từ dashboard, chọn "Pages" và click "Create a project"
3. Chọn "Connect to Git" và kết nối với repository GitHub của bạn
4. Cấu hình build:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node.js version: `18.x` (hoặc cao hơn)
5. Thêm biến môi trường trong tab "Settings > Environment variables":
   - `NEXT_PUBLIC_GEMINI_API_KEY`: API key của bạn
6. Trigger deploy lại và ứng dụng sẽ khả dụng tại URL của Cloudflare Pages

### Triển khai lên Cloudflare Workers

1. Cài đặt Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Đăng nhập vào Cloudflare từ terminal:
   ```bash
   wrangler login
   ```

3. Tạo file `wrangler.toml` trong thư mục gốc dự án:
   ```toml
   name = "meeting-recap-ai"
   main = "./.next/standalone/server.js"
   compatibility_date = "2023-12-01"
   compatibility_flags = ["nodejs_compat"]
   
   [site]
   bucket = "./.next/static"
   
   [build]
   command = "npm run build"
   
   [vars]
   NEXT_PUBLIC_GEMINI_API_KEY = "your_gemini_api_key_here"
   ```

4. Sửa file `next.config.js` để hỗ trợ Workers:
   ```js
   const nextConfig = {
     // ... cấu hình hiện tại
     output: 'standalone',
   };
   ```

5. Triển khai lên Cloudflare Workers:
   ```bash
   wrangler deploy
   ```

6. Sau khi triển khai thành công, bạn sẽ nhận được URL để truy cập ứng dụng

## Giấy phép

MIT License
