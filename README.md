# EventHub

Bài assignment frontend React: xem sự kiện, đăng nhập demo, đăng ký/hủy vé và quản lý sự kiện.

## Chạy bài

Dùng Node.js 22.12+ hoặc 24 LTS. Trong Git Bash:

~~~bash
npm ci
cp .env.example .env
npm run dev
~~~

File .env chứa URL gốc của project MockAPI, không thêm /events hoặc /bookings:

~~~env
VITE_API_URL=https://YOUR_PROJECT_ID.mockapi.io
~~~

Khởi động lại Vite sau khi đổi .env. Trước khi nộp bài có thể chạy:

~~~bash
npm run lint
npm run build
~~~

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Người dùng | user@eventhub.test | User123! |
| Admin | admin@eventhub.test | Admin123! |

- Khách xem danh sách và chi tiết; đặt vé cần đăng nhập.
- Người dùng xem/hủy đăng ký theo email tài khoản.
- Admin thêm/sửa/xóa sự kiện và xem tất cả đăng ký; không đăng ký vé bằng tài khoản admin.
- Đăng xuất bằng menu tài khoản trên thanh điều hướng.
- Đây là đăng nhập demo ở frontend; MockAPI không kiểm tra quyền trên server.

## Thư mục chính

~~~text
src/
  App.css      CSS tùy chỉnh, nạp sau CSS Bootstrap trong main.jsx
  components/  Các phần giao diện dùng lại và MainLayout
  context/     Đăng nhập và chế độ sáng/tối
  data/        Tài khoản demo
  pages/       Các trang của ứng dụng
  reducers/    Cập nhật danh sách sự kiện bằng useReducer
  services/    Gọi MockAPI bằng fetch
  utils/       Hàm định dạng ngày, tiền và xử lý dữ liệu
~~~

## MockAPI

Dùng hai resource events và bookings.

**events:** id (Object ID), title, description, image, category, startAt, location (String), price, capacity (Number).

**bookings:** id (Object ID), eventId, eventTitle, fullName, email, phone, status, createdAt (String), quantity, unitPrice, totalPrice (Number).

Giữ id là trường Object ID tự sinh; eventId là String chứa mã sự kiện. Form gửi status là confirmed, khi hủy đổi thành cancelled.

Ngày giờ form quản lý nhập theo giờ Việt Nam. Giá bằng 0 là miễn phí. Các đăng ký cũ có email khác tài khoản demo vẫn xem được bằng tài khoản admin.
