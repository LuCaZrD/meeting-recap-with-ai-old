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

## Giấy phép

MIT License
