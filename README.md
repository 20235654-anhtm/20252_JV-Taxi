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
3. Cấu hình biến môi trường và kết nối Database (Supabase):
   - Tạo file `.env` từ file `.env.example` trong thư mục `backend`.
   - Mở file `.env` vừa tạo và thay thế `[YOUR-PASSWORD]` bằng mật khẩu kết nối database thực tế của bạn.
4. Kiểm tra kết nối database:
   ```bash
   npx ts-node src/test-db.ts
   ```
   _Nếu terminal hiện "Kết nối database thành công!" thì bạn đã cấu hình đúng._
5. Khởi động server trong môi trường dev:
   ```bash
   npm run dev
   ```
   _Server sẽ khởi chạy. Mặc định sẽ chạy ở port 5000 (ví dụ: `http://localhost:5000`)._

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
   _Frontend sẽ chạy tại địa chỉ được in ra trên terminal (thường là `http://localhost:5173`). Mở link này bằng trình duyệt để xem._

---

## Git & File bỏ qua (.gitignore)

- Toàn bộ thư mục `node_modules/` và thư mục build (`dist/`, `build/`) đã được cấu hình loại bỏ trong `.gitignore` để không bị push lên repository.
- Các file chứa biến môi trường nhạy cảm như `.env` cũng đã được ignore. **Tuyệt đối không push file `.env` thực tế lên Github.**
