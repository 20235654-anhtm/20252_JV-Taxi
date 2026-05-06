# JV-TAXI

Dự án này bao gồm 2 phần chính: **Backend** (Node.js + Express + TypeScript) và **Frontend** (React + TypeScript + Vite).

Dưới đây là hướng dẫn để các thành viên trong team clone source code về và setup chạy thử trên máy cá nhân.

## Yêu cầu môi trường
- Đã cài đặt [Node.js](https://nodejs.org/) (khuyến nghị phiên bản LTS mới nhất từ 18.x trở lên).
- Đã cài đặt Git.

---

## 1. Setup Backend

1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói thư viện (dependencies):
   ```bash
   npm install
   ```
3. Tạo file `.env` (nếu cần thiết) dựa trên các cấu hình mặc định (bạn có thể hỏi team leader hoặc copy từ mẫu `.env.example` nếu có).
4. Khởi động server trong môi trường dev:
   ```bash
   npm run dev
   ```
   *Server sẽ khởi chạy. Mặc định sẽ chạy ở port 5000 (ví dụ: `http://localhost:5000`).*

---

## 2. Setup Frontend

1. Mở một terminal mới (giữ terminal backend chạy song song) và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện (dependencies):
   ```bash
   npm install
   ```
3. Khởi động ứng dụng frontend:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy tại địa chỉ được in ra trên terminal (thường là `http://localhost:5173`). Mở link này bằng trình duyệt để xem.*

---

## Git & File bỏ qua (.gitignore)
- Toàn bộ thư mục `node_modules/` và thư mục build (`dist/`, `build/`) đã được cấu hình loại bỏ trong `.gitignore` để không bị push lên repository.
- Các file chứa biến môi trường nhạy cảm như `.env` cũng đã được ignore. **Tuyệt đối không push file `.env` thực tế lên Github.**

Chúc team code vui vẻ! 🚀
