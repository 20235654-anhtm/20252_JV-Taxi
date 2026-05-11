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

## 3. Cấu trúc Route Frontend

Dự án sử dụng `react-router-dom` để quản lý điều hướng. Các route được định nghĩa tại `frontend/src/routes/index.tsx` và chia thành 2 luồng chính:

### Luồng cho Khách (Guest - Chưa đăng nhập)
| Đường dẫn (URL) | Component (`src/pages/guest/`) | Mô tả |
| :--- | :--- | :--- |
| `/` | `GuestHome.tsx` | Trang chủ dành cho khách. |
| `/guest/search-location` | `GuestSearchLocation.tsx` | Trang tìm và chọn điểm đến cho khách. |
| `/login` | `SignIn.tsx` | Màn hình đăng nhập. |
| `/signup` | `SignUpSelection.tsx` | Màn hình chọn vai trò đăng ký. |
| `/signup/passenger` | `PassengerSignUp.tsx` | Màn hình đăng ký cho hành khách. |
| `/signup/driver` | `DriverSignUp.tsx` | Màn hình đăng ký cho tài xế. |

### Luồng cho Hành Khách (Passenger - Đã đăng nhập)
| Đường dẫn (URL) | Component (`src/pages/passenger/`) | Mô tả |
| :--- | :--- | :--- |
| `/passenger` | `PassengerHome.tsx` | Trang chủ dành cho hành khách. |
| `/passenger/search-location`| `SearchLocation.tsx` | Trang tìm, chọn điểm đến để bắt xe. |
| `/passenger/booking-options`| `BookingOptions.tsx` | Trang chọn phương thức ghép cuốc. |
| `/passenger/select-driver` | `SelectDriver.tsx` | Trang hiển thị danh sách tài xế. |
| `/passenger/driver-detail` | `DriverDetail.tsx` | Trang xem chi tiết một tài xế. |
| `/passenger/profile`       | `Profile.tsx`      | Trang thông tin cá nhân và đăng xuất. |

---

## 4. Lưu ý quan quan trọng về Prisma 7 & Supabase

Dự án hiện tại đang sử dụng **Prisma 7**. Để đẩy schema lên Supabase mà không bị lỗi treo hoặc lỗi quyền hạn:

1.  **Cấu hình .env**: File `.env` của bạn cần cả `DATABASE_URL` (cho ứng dụng) và `DIRECT_URL` (cho các lệnh Prisma).
2.  **Lệnh đẩy Schema**: Sử dụng lệnh sau để tránh lỗi kết nối:
    ```bash
    npx prisma db push
    ```
3.  **Seed dữ liệu**: Để nạp dữ liệu mẫu khu vực Bách Khoa:
    ```bash
    npm run db:seed
    ```

## Git & File bỏ qua (.gitignore)

- Toàn bộ thư mục `node_modules/` và thư mục build (`dist/`, `build/`) đã được cấu hình loại bỏ trong `.gitignore` để không bị push lên repository.
- Các file chứa biến môi trường nhạy cảm như `.env` cũng đã được ignore. **Tuyệt đối không push file `.env` thực tế lên Github.**
