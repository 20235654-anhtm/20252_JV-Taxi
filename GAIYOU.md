# JV - Taxi

**JV - Taxi** là nền tảng ứng dụng gọi xe dành riêng cho cộng đồng người Nhật Bản tại Hà Nội, giúp kết nối hành khách người Nhật với các tài xế taxi có khả năng giao tiếp bằng tiếng Nhật.

## 1. Vấn đề & Bối cảnh
* **Người Nhật đang sinh sống tại Hà Nội:** Gặp khó khăn trong việc tìm kiếm tài xế taxi biết nói tiếng Nhật.
* **Tài xế taxi biết nói tiếng Nhật tại Hà Nội:** Không có cơ hội làm công việc phát huy được năng lực tiếng Nhật của bản thân.

## 2. Đối tượng người dùng mục tiêu
* **Nhóm Khách hàng:** Người Nhật đang sinh sống và lưu trú tại Hà Nội.
* **Nhóm Cung cấp dịch vụ:** Tài xế taxi biết tiếng Nhật.

## 3. Các vấn đề & Giải pháp
| Người dùng | Vấn đề / Trạng thái lý tưởng | Giải pháp cụ thể |
| --- | --- | --- |
| Hành khách | Có thể tìm thấy tài xế gần mình trong thời gian ngắn nhất | Tìm thấy tài xế gần vị trí hiện tại |
| Hành khách | Có thể đặt xe phù hợp với yêu cầu của bản thân | Xem thông tin tài xế trước khi đặt xe |
| Tài xế | Người tìm tài xế nắm bắt ngay thông tin về tài xế | Đăng tải thông tin cá nhân, trình độ tiếng Nhật, bằng lái xe |
| Hành khách | Ngoài khả năng giao tiếp bằng tiếng Nhật, cần biết các khía cạnh khác của dịch vụ (thái độ, an toàn) | Đánh giá dịch vụ sau khi trải nghiệm với các tiêu chí: trình độ giao tiếp, thái độ cư xử, sự an toàn |
| Hành khách, tài xế | Tài xế và khách hàng có thể liên lạc, trao đổi trực tiếp với nhau | Trò chuyện qua tin nhắn và gọi điện thoại trực tiếp trên ứng dụng theo thời gian thực |
| Hành khách | Khách hàng có thể thanh toán bằng nhiều phương thức | Thanh toán bằng thẻ tín dụng, tiền mặt, chuyển khoản, v.v. |
| Quản trị viên | Chỉ cho phép những tài xế đáng tin cậy đăng ký vào hệ thống | Phê duyệt bằng lái xe và bằng cấp tiếng Nhật của tài xế |
| Quản trị viên | Nắm bắt thông tin người dùng để ngăn ngừa rắc rối | Quản lý tập trung thông tin tài khoản của khách và tài xế |

## 4. Danh sách các vai trò (Roles)
1. **Hành khách (Người tìm tài xế):** Người Nhật đang sống hoặc lưu trú tại Hà Nội đang tìm kiếm taxi có tài xế biết tiếng Nhật.
2. **Tài xế:** Tài xế taxi biết tiếng Nhật, đăng ký và công khai thông tin của mình.
3. **Khách (Guest):** Hành khách hoặc tài xế chưa đăng nhập vào hệ thống.
4. **Quản trị viên (Admin):** Người thực hiện vận hành và quản lý toàn bộ hệ thống, chịu trách nhiệm quản lý người dùng (hành khách/tài xế) và phê duyệt tài xế.

## 5. Danh sách các tính năng
* **Tìm kiếm tài xế:** Lọc và hiển thị danh sách tài xế dựa trên vị trí hiện tại hoặc các tiêu chí mong muốn.
* **Hiển thị bản đồ:** Lấy vị trí GPS hiện tại với độ chính xác cao và hiển thị di chuyển trên bản đồ theo thời gian thực.
* **Xem thông tin tài xế:** Xem ảnh đại diện, trình độ tiếng Nhật, loại xe và các đánh giá.
* **Yêu cầu đặt xe:** Lựa chọn giữa "Hệ thống tự động ghép cuốc" hoặc "Chỉ định trực tiếp tài xế" (có phụ phí 15,000 VND). Tài xế có 3 phút để xác nhận.
* **Quản lý doanh thu tài xế:** Tài xế kiểm tra doanh thu theo ngày và tuần.
* **Đánh giá dịch vụ:** Hành khách đánh giá dịch vụ tài xế theo 3 tiêu chí: giao tiếp, thái độ, an toàn (1-5 sao và bình luận).
* **Gửi và nhận tin nhắn:** Trò chuyện trực tiếp (real-time) giữa hành khách và tài xế.
* **Gọi điện thoại qua ứng dụng:** Gọi điện thoại trực tiếp (voice call) mà không lộ số điện thoại cá nhân.
* **Thanh toán trực tuyến:** Thanh toán tự động qua thẻ tín dụng đã đăng ký hoặc các hình thức khác.
* **Quản lý lịch sử chuyến đi:** Quản lý danh sách và chi tiết các chuyến đi trong quá khứ của cả hai bên.
* **Đăng nhập / Đăng ký:** Tạo tài khoản mới hoặc đăng nhập.
* **Cập nhật hồ sơ:** Thay đổi và quản lý thông tin cá nhân, giấy tờ.
* **Quản lý người dùng (Admin):** Xem thông tin người dùng và chặn (block) tài khoản khi cần.
* **Phê duyệt tài xế (Admin):** Kiểm tra và phê duyệt các giấy tờ của tài xế.
* **Đặt lại mật khẩu:** Gửi mã qua email và cho phép thiết lập lại mật khẩu mới.

## 6. Danh sách các màn hình
* **Chung:** 
  * Màn hình đăng nhập / Màn hình yêu cầu đăng nhập
  * Màn hình chọn vai trò (Hành khách/Tài xế) khi đăng ký
  * Màn hình đăng ký hành khách / Màn hình đăng ký tài xế
  * Màn hình quên mật khẩu / Thiết lập lại mật khẩu / Hoàn tất thiết lập
  * Màn hình không tìm thấy tài khoản / Khóa tài khoản
* **Hành khách:**
  * Trang chủ (Bản đồ & thanh tìm kiếm)
  * Màn hình tìm kiếm và kết quả
  * Màn hình danh sách tài xế & Chi tiết tài xế
  * Màn hình chọn phương thức ghép cuốc
  * Màn hình trong chuyến đi
  * Màn hình thanh toán & Chỉnh sửa phương thức thanh toán
  * Màn hình viết đánh giá
  * Màn hình thông tin cá nhân & Chỉnh sửa thông tin
  * Màn hình lịch sử chuyến đi & Chi tiết chuyến đi
  * Màn hình trò chuyện & Màn hình gọi điện
* **Tài xế:**
  * Màn hình quản lý của tài xế (Dashboard: Bật/tắt trạng thái, nhận yêu cầu)
  * Màn hình trong chuyến đi
  * Màn hình thông tin cá nhân & Chỉnh sửa thông tin (Bằng lái, chứng chỉ tiếng Nhật)
  * Màn hình lịch sử chuyến đi & Chi tiết chuyến đi
  * Màn hình trò chuyện & Màn hình gọi điện
* **Quản trị viên (Admin):**
  * Màn hình chính của admin (Thống kê)
  * Màn hình quản lý tài khoản hành khách
  * Màn hình quản lý tài khoản tài xế & Chi tiết, block tài khoản
  * Màn hình phê duyệt tài xế (Chi tiết tài xế mới đăng ký để duyệt)
