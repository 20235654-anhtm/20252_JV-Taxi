# JV-TAXI

Dự án này bao gồm 2 phần chính: **Backend** (Node.js + Express + TypeScript) và **Frontend** (React + TypeScript + Vite).

Dưới đây là hướng dẫn để các thành viên trong team clone source code về và setup chạy thử trên máy cá nhân.

## Yêu cầu môi trường

- Đã cài đặt [Node.js](https://nodejs.org/) (**Yêu cầu: phiên bản LTS từ 18.x trở lên**). 
  - *Lưu ý:* Nếu chưa cài Node.js, bạn sẽ không thể chạy lệnh `npm`. Nếu dùng phiên bản quá cũ, các thư viện như `Prisma` hoặc `@tailwindcss/vite` sẽ báo lỗi khi cài đặt.
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
   - Cấu hình các biến Stripe:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```
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

---

## 3. Hướng dẫn Test chức năng Thanh toán (Stripe Visa Demo)

Dự án đã tích hợp thanh toán thẻ Visa (demo) thông qua cổng Stripe. Để test chức năng này, hãy làm theo các bước sau:

### Bước 1: Truy cập trang Xác nhận đặt xe
1. Đăng nhập vào tài khoản Passenger.
2. Thực hiện quy trình tìm xe: **Tìm địa điểm** -> **Chọn loại xe** -> **Chọn tài xế**.
3. Bạn sẽ được dẫn đến trang **Xác nhận đặt xe** (`/passenger/booking-confirmation`).

### Bước 2: Nhập thông tin thanh toán
1. Tại mục **Phương thức thanh toán**, chọn **Thẻ (Card)**.
2. Nhấn **Xác nhận đặt xe**.
3. Một Popup nhập thông tin thẻ sẽ hiện lên. Nhập thông tin thẻ demo của Stripe:
   - **Số thẻ (Card number):** `4242 4242 4242 4242`
   - **Tháng/Năm hết hạn:** Bất kỳ ngày nào trong tương lai (VD: `12/30`).
   - **Mã bảo mật (CVC):** 3 chữ số bất kỳ (VD: `123`).
   - **Mã bưu điện (Zip Code):** 5 chữ số bất kỳ (VD: `10000`).
4. Nhấn **Thanh toán ngay**.

### Bước 3: Kiểm tra kết quả
- Nếu thông tin đúng, một Popup thông báo **"Thanh toán thành công"** sẽ hiện ra cùng với mã giao dịch (Payment ID).
- Bạn có thể vào trang **Cá nhân (Profile)** để xem minh họa thẻ Visa đã được liên kết với tài khoản.

---

## 4. Cấu trúc Route Frontend

### Luồng cho Khách (Guest - Chưa đăng nhập)

| Đường dẫn (URL)          | Component (`src/pages/guest/`) | Mô tả                                 |
| :----------------------- | :----------------------------- | :------------------------------------ |
| `/`                      | `GuestHome.tsx`                | Trang chủ dành cho khách.             |
| `/guest/search-location` | `GuestSearchLocation.tsx`      | Trang tìm và chọn điểm đến cho khách. |
| `/login`                 | `SignIn.tsx`                   | Màn hình đăng nhập.                   |
| `/signup`                | `SignUpSelection.tsx`          | Màn hình chọn vai trò đăng ký.        |
| `/signup/passenger`      | `PassengerSignUp.tsx`          | Màn hình đăng ký cho hành khách.      |
| `/signup/driver`         | `DriverSignUp.tsx`             | Màn hình đăng ký cho tài xế.          |

### Luồng cho Hành Khách (Passenger - Đã đăng nhập)

| Đường dẫn (URL)                   | Component (`src/pages/passenger/`) | Mô tả                                 |
| :-------------------------------- | :--------------------------------- | :------------------------------------ |
| `/passenger`                      | `PassengerHome.tsx`                | Trang chủ dành cho hành khách.        |
| `/passenger/search-location`      | `SearchLocation.tsx`               | Trang tìm, chọn điểm đến để bắt xe.   |
| `/passenger/booking-options`      | `BookingOptions.tsx`               | Trang chọn phương thức ghép cuốc.     |
| `/passenger/select-driver`        | `SelectDriver.tsx`                 | Trang hiển thị danh sách tài xế.      |
| `/passenger/driver-detail`        | `DriverDetail.tsx`                 | Trang xem chi tiết một tài xế.        |
| `/passenger/booking-confirmation` | `BookingConfirmationWrapper.tsx`   | Trang xác nhận & thanh toán Stripe.   |
| `/passenger/profile`              | `Profile.tsx`                      | Trang thông tin cá nhân & Visa info.  |

---

## 5. Lưu ý quan trọng

1. **Prisma 7 & Supabase**:
   - **Bắt buộc**: Chạy `npx prisma generate` trong thư mục `backend` ngay sau khi `npm install`. Nếu thiếu bước này, code sẽ không nhận diện được các Model (Profile, Ride...), dẫn đến lỗi TypeScript hoặc lỗi Runtime khi chạy server.
   - Chạy `npx prisma generate` lại mỗi khi bạn thay đổi file `schema.prisma`.
   - Sử dụng `npm run db:seed` để khởi tạo dữ liệu mẫu (tài khoản demo, danh sách tài xế).
2. **Xung đột cổng (Port Conflict)**:
   - Mặc định: Backend dùng port **5000**, Frontend dùng port **5173**.
   - Nếu máy bạn đã có ứng dụng khác chạy trên các cổng này, server sẽ báo lỗi hoặc tự động chuyển sang cổng khác. 
   - *Lưu ý:* Nếu port Backend bị đổi, bạn cần cập nhật lại URL gọi API trong code Frontend để tránh lỗi kết nối.
3. **Bảo mật**: Tuyệt đối không push file `.env` chứa Secret Key thật lên Git. File hiện tại đang sử dụng Test Key của Stripe cho mục đích demo.

---

## Git & File bỏ qua (.gitignore)

- Toàn bộ thư mục `node_modules/` và thư mục build (`dist/`, `build/`) đã được cấu hình loại bỏ trong `.gitignore`.
- Các file chứa biến môi trường nhạy cảm như `.env` cũng đã được ignore.
