# Kiểm tra với project MockAPI thật

Bộ E2E tự động sử dụng dữ liệu giả riêng trong trình duyệt. Các bước dưới đây dùng để kiểm tra cấu hình project MockAPI của bạn.

## Chuẩn bị

- Đã sao chép .env.example thành .env và khởi động lại Vite.
- Hai resource events/bookings có trường mặc định id kiểu Object ID.
- eventId trong bookings là String.
- status của đăng ký do form tạo là confirmed hoặc cancelled.

## Danh sách và chi tiết

- Trang chủ hiện các số liệu và sự kiện từ API.
- /events tìm được tên có hoặc không dấu.
- Chủ đề và mức giá có thể kết hợp; xóa bộ lọc khôi phục danh sách.
- Trang chi tiết đúng ID; tải lại trực tiếp đường dẫn vẫn lấy được dữ liệu.
- ID không tồn tại hiện thông báo.
- Thử chế độ sáng/tối và tải lại trang.

## Quản lý sự kiện

Đăng nhập bằng admin@eventhub.test / Admin123! trước khi kiểm tra.

1. Vào Quản lý sự kiện, tạo một sự kiện tên dễ nhận biết để thử bài.
2. Kiểm tra dữ liệu trống, URL ảnh sai, giá âm, sức chứa bằng 0 đều bị chặn.
3. Nhập dữ liệu hợp lệ, lưu và xem bản ghi mới trên MockAPI.
4. Mở Sửa, kiểm tra giờ Việt Nam giữ nguyên.
5. Sửa tên/giá, lưu rồi tải lại để xác nhận dữ liệu được giữ.
6. Mở Xóa rồi Quay lại: bản ghi vẫn còn.
7. Mở lại và Xác nhận xóa: bản ghi biến mất cả sau khi tải lại.

## Đặt và hủy vé

Đăng nhập bằng user@eventhub.test / User123!; email trên form được gắn với tài khoản này.

1. Chọn một sự kiện; thử email, điện thoại và số lượng không hợp lệ.
2. Chọn 2 vé, kiểm tra tổng tiền = giá một vé nhân 2.
3. Submit hợp lệ; MockAPI trả một id mới cho đăng ký.
4. Mở Danh sách đăng ký, kiểm tra tên sự kiện, số vé và tổng tiền.
5. Hủy rồi tải lại: trạng thái vẫn Đã hủy.
6. Bản ghi đã hủy vẫn được giữ; nút hủy không gửi lại.
7. Có thể đăng ký thêm sau thông báo thành công.

## Responsive và lỗi

- Ở điện thoại, menu thu gọn hoạt động.
- Lưới sự kiện còn một cột; bảng cuộn ngang bên trong vùng bảng.
- Form và modal vẫn đọc/nhập được.
- Mất kết nối hiển thị thông báo; các nút gửi được mở lại sau khi lỗi.
- Các trang có nút Thử lại tải lại dữ liệu.
- Trước khi nộp: npm run lint, npm test và npm run build đều thành công.

## Đăng nhập và phân vai trò

- Khách mở /bookings hoặc /admin/events được chuyển sang /login.
- Đăng nhập sai mật khẩu hiện thông báo, không tạo phiên.
- User chỉ thấy Vé của tôi, không thấy menu quản lý.
- User gõ /admin/events vẫn không được mở form thêm/sửa/xóa.
- Admin xem toàn bộ đăng ký và mở được quản lý sự kiện.
- Email trên form đặt vé lấy từ tài khoản, không chỉnh sửa qua ô nhập.
- Đăng xuất rồi mở lại đường dẫn riêng tư phải đăng nhập.
- Tải lại khi còn đăng nhập vẫn giữ tài khoản.
- Trên điện thoại, menu tài khoản và đăng xuất dùng được; menu chính thu gọn sau khi đăng xuất.
