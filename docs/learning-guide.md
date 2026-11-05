# Hướng dẫn đọc code EventHub

## 1. Dòng chảy của một trang React

**main.jsx** nạp CSS Bootstrap, ThemeProvider, BrowserRouter và AuthProvider. **App.jsx** chọn page theo URL. **MainLayout** bao quanh page bằng navbar, vùng Outlet và footer.

Các page gọi service hoặc hook để lấy dữ liệu. Dữ liệu được truyền xuống component con bằng props. Ví dụ **EventDetailPage** truyền object event xuống **BookingForm**; form lấy id, title, price và capacity từ object này.

## 2. Form đăng ký

Trong **BookingForm.jsx**:

- useFormik tạo values, errors, touched, handleSubmit và isSubmitting.
- initialValues khai báo bốn ô: fullName, email, phone, quantity.
- Yup định nghĩa các điều kiện hợp lệ.
- getFieldProps nối ô nhập với values/onChange/onBlur.
- Người dùng bấm submit; Formik kiểm tra rồi mới gọi onSubmit(values).
- onSubmit kết hợp dữ liệu người nhập với prop event và gọi createBooking.
- createBooking gửi POST; MockAPI tự thêm id.
- setSavedBooking lưu bản ghi trả về, React hiển thị thông báo thành công.

**formik.errors** là lỗi nhập liệu. **submitError** là lỗi gửi yêu cầu. Chúng phục vụ hai bước khác nhau.

**quantity** trong object payload là cách viết gọn của **quantity: quantity**. Các tên bên trái là tên trường dữ liệu do dự án quy ước.

## 3. Service và Fetch

**services/apiClient.js** đọc VITE_API_URL và cung cấp apiRequest.

- GET mặc định lấy dữ liệu.
- POST tạo bản ghi.
- PUT cập nhật bản ghi.
- DELETE xóa bản ghi.
- JSON.stringify chuyển object gửi lên thành JSON.
- response.json đọc phần nội dung trả về.
- response.ok kiểm tra kết quả HTTP; Fetch không tự báo lỗi cho mọi HTTP 4xx/5xx.
- AbortError được giữ nguyên để cleanup nhận biết.
- requireId chặn yêu cầu có ID rỗng, thay vì gửi đến /undefined.

**eventService.js** và **bookingService.js** đặt tên các thao tác theo nghiệp vụ để component dễ đọc.

## 4. Custom hook useFetch

**hooks/useFetch.js** gom phần GET, loading, error, cleanup và retry dùng chung.

Hook lưu cả khóa của yêu cầu cùng với kết quả. Khi đổi URL hoặc bấm retry, khóa đổi: giao diện hiển thị đang tải thay vì dùng dữ liệu của yêu cầu cũ.

AbortController hủy yêu cầu khi rời trang. Hook kiểm tra tín hiệu trước khi cập nhật state, tránh ghi dữ liệu từ request đã bị hủy.

Hook không giữ cache giữa các lần mở page, nên sau khi quản lý sự kiện rồi quay lại danh sách, ứng dụng lấy dữ liệu mới.

## 5. Context và theme

**ThemeContext.js** tạo nơi chia sẻ dữ liệu.

**ThemeProvider.jsx** giữ state light/dark. toggleTheme đổi state. useEffect đưa lựa chọn vào thuộc tính data-bs-theme trên html để Bootstrap đổi giao diện, đồng thời ghi localStorage.

**useTheme.js** dùng useContext để đọc theme và toggleTheme trong MainLayout. Lựa chọn vẫn giữ khi tải lại trang.

## 6. Reducer và quản lý sự kiện

**eventReducer.js** nhận hai đầu vào: state hiện tại và action. Nó trả object state mới; không gọi API và không sửa trực tiếp mảng cũ.

Ví dụ:

~~~js
dispatch({
  type: "LOAD_SUCCESS",
  payload: data,
});
~~~

Tên type phải khớp case trong reducer. payload là dữ liệu đi kèm do mình quy ước.

| Nhóm action | Việc xảy ra |
| --- | --- |
| LOAD_SUCCESS / LOAD_ERROR / LOAD_RETRY | Tải danh sách và thử lại |
| OPEN_CREATE / OPEN_EDIT / CLOSE_EDITOR | Điều khiển form thêm/sửa |
| SAVE_START / SAVE_SUCCESS / SAVE_ERROR | Trạng thái lưu và cập nhật dòng |
| OPEN_DELETE / CLOSE_DELETE | Điều khiển hộp xác nhận |
| DELETE_START / DELETE_SUCCESS / DELETE_ERROR | Trạng thái xóa và cập nhật bảng |
| NOTICE_DISMISS | Đóng thông báo thành công |

**ManageEventsPage** gọi service rồi dispatch kết quả. Khi lưu thành công, reducer thay dòng có cùng id hoặc thêm bản ghi mới. Khi xóa thành công, reducer dùng filter để bỏ đúng bản ghi.

## 7. EventForm và FormField

**EventForm** dùng lại cho cả thêm và sửa. Có prop event thì lấy thông tin hiện tại làm initialValues; không có thì dùng giá trị mặc định.

**FormField** gom nhãn, input, feedback và liên kết aria-describedby. Nó vẫn dùng getFieldProps, touched và errors giống form đăng ký đã học.

Các trường số được chuyển bằng Number trước khi POST/PUT. Ngày giờ nhập theo Việt Nam được chuyển thành ISO; mở form sửa chuyển ngược lại. Cách này không phụ thuộc múi giờ của máy chạy bài.

## 8. React Bootstrap và JSX

Component viết hoa như Button, Form.Control, Modal đến từ react-bootstrap. Thẻ viết thường như section, p, fieldset là HTML trong JSX.

Props như variant, size, isInvalid cấu hình component. className như mb-3, d-flex, text-primary là class tiện ích có trong Bootstrap.

Form của React Bootstrap cung cấp giao diện; Formik quản lý dữ liệu và submit; Yup kiểm tra quy tắc.

Modal chỉ hiển thị khi state tương ứng bật. Trong lúc đang lưu/xóa/hủy, các nút được khóa để tránh gửi lặp.

## 9. Đăng ký và hủy

**BookingsPage** lấy danh sách từ resource bookings. Mỗi dòng dùng id của bản ghi đăng ký, không dùng eventId thay thế.

Khi xác nhận hủy:

1. cancelBooking gửi PUT với trạng thái cancelled.
2. API trả bản ghi cập nhật.
3. setBookings nhận mảng hiện tại, map qua từng bản ghi.
4. Dòng có cùng id được thay; những dòng khác giữ nguyên.
5. Modal đóng và nhãn trạng thái được cập nhật.

Các bản ghi cũ thiếu id được hiển thị là Thiếu mã và không gửi yêu cầu hủy đến URL sai.

## 10. AuthContext và phân quyền giao diện

**data/demoAccounts.js** chứa tài khoản demo. **utils/auth.js** kiểm tra email/mật khẩu, tạo object phiên không có password và xác định quyền xem đăng ký theo email.

**AuthProvider** lưu user trong state, chia sẻ user/login/logout qua Context. localStorage chỉ lưu ID. Khi tải lại, provider tìm ID trong danh sách demo để lấy lại thông tin và vai trò.

**LoginPage** dùng Formik/Yup. Thành công sẽ quay về đường dẫn đang cần đăng nhập hoặc trang mặc định theo vai trò. Đường dẫn trả về được kiểm tra để chỉ điều hướng trong ứng dụng.

**RequireAuth** bọc route riêng tư. Chưa đăng nhập thì Navigate tới /login. Đăng nhập sai vai trò thì hiện trang không có quyền; component quản lý không được render nên không chạy yêu cầu tải dữ liệu.

**MainLayout** lấy user qua useAuth để hiện menu đúng vai trò và cung cấp đăng xuất. **EventDetailPage** hiện lời mời đăng nhập cho khách. **BookingForm** lấy email từ tài khoản thay vì cho chọn chủ sở hữu tùy ý.

**BookingsPage** dùng canAccessBooking để lọc danh sách: admin xem tất cả, user chỉ thấy email của mình. Hàm hủy cũng kiểm tra quyền giao diện trước khi gọi service.

Các bước trên là mô phỏng frontend. MockAPI không xác minh session hay role của request; việc ẩn menu/chặn route không tạo ra phân quyền bảo mật cho API công khai.
