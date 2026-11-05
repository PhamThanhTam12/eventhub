# EventHub

Ứng dụng frontend React dành cho assignment: khám phá sự kiện, đăng ký vé, theo dõi đăng ký và quản lý sự kiện. Giao diện dùng React Bootstrap; dữ liệu lưu trên MockAPI.

## Chạy project

Yêu cầu: Node.js 22.12+ hoặc Node.js 24 LTS, npm và Git.

Trong Git Bash hoặc Terminal:

~~~bash
npm ci
cp .env.example .env
npm run dev
~~~

Với PowerShell, dùng **Copy-Item .env.example .env** để sao chép cấu hình.

Nội dung **.env**:

~~~env
VITE_API_URL=https://YOUR_PROJECT_ID.mockapi.io
~~~

Dùng URL gốc của project, không thêm **/events** hoặc **/bookings**. Nếu project có prefix **/api/v1**, đưa prefix đó vào URL gốc. File **.env.example** trong repo đã có URL của project assignment hiện tại.

Khởi động lại Vite sau khi thay đổi .env. Biến VITE_ được đưa vào frontend để cấu hình ứng dụng.

~~~bash
npm run build
npm run preview
~~~

## Chức năng và đường dẫn

| Đường dẫn | Chức năng |
| --- | --- |
| / | Giới thiệu, số liệu từ dữ liệu hiện có, sự kiện nổi bật |
| /events | Danh sách, tìm kiếm có/không dấu, lọc chủ đề và giá vé |
| /events/:id | Chi tiết công khai; đăng nhập để đặt vé và tính tiền |
| /login | Đăng nhập tài khoản demo |
| /bookings | Người dùng xem/hủy vé của mình; admin xem toàn bộ |
| /admin/events | Chỉ admin: thêm, sửa, xóa sự kiện |
| Đường dẫn khác | Trang 404 |

Chế độ sáng/tối dùng Context, lưu lựa chọn trong localStorage. Mọi trang có trạng thái tải, rỗng hoặc lỗi phù hợp; ảnh không tải được có ảnh thay thế.

## Đăng nhập và vai trò demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Người dùng | user@eventhub.test | User123! |
| Admin | admin@eventhub.test | Admin123! |

- Khách xem trang chủ, danh sách và chi tiết. Đặt vé cần đăng nhập.
- Người dùng không thấy menu quản lý; gõ trực tiếp /admin/events sẽ nhận trang không có quyền.
- Email đặt vé gắn với tài khoản đăng nhập. Vé của tôi lọc theo email; admin xem toàn bộ resource bookings.
- Đăng nhập từ chi tiết sẽ quay lại sự kiện đã chọn.
- Phiên demo lưu ID tài khoản trong localStorage, không lưu mật khẩu. Đăng xuất xóa ID và mở trang đăng nhập.
- Các đăng ký cũ có email khác tài khoản demo vẫn được admin xem trong danh sách.

Đây là xác thực mô phỏng cho frontend assignment: tài khoản demo nằm trong src/data/demoAccounts.js, và RequireAuth điều khiển route/giao diện. MockAPI vẫn là API công khai, không kiểm tra phiên hoặc quyền trên server. Không cần tạo thêm resource users.

## Thiết lập MockAPI

Tạo hai resource **events** và **bookings** trong cùng project.

**Quan trọng với mã bản ghi:** giữ trường mặc định có tên **id**, kiểu **Object ID**. Trường **eventId** trong bookings phải là **String**. Không đổi tên trường Object ID thành eventId.

### Resource events

| Trường | Kiểu |
| --- | --- |
| id | Object ID tự sinh |
| title | String |
| description | String |
| image | String, URL ảnh http/https |
| category | String |
| startAt | String, ngày giờ ISO |
| location | String |
| price | Number, 0 nếu miễn phí |
| capacity | Number, số nguyên dương |

Form quản lý nhập giờ Việt Nam và chuyển sang ISO khi lưu. Mở lại form sửa sẽ chuyển đúng về giờ Việt Nam. Ví dụ 09:30 UTC+07 tương ứng 02:30 UTC.

### Resource bookings

| Trường | Kiểu |
| --- | --- |
| id | Object ID tự sinh |
| eventId | String, ID sự kiện |
| eventTitle | String |
| fullName | String |
| email | String |
| phone | String, giữ số 0 đầu |
| quantity | Number |
| unitPrice | Number |
| totalPrice | Number |
| status | String: confirmed hoặc cancelled |
| createdAt | String, ngày giờ ISO |

Tạo đăng ký qua form của ứng dụng để có dữ liệu đúng. Dữ liệu tự Generate có thể chứa các chuỗi như **status 1**, không thuộc hai trạng thái ứng dụng sử dụng.

Hủy dùng PUT để đổi status thành cancelled và giữ lịch sử. Xóa sự kiện không xóa các đăng ký cũ: các bản ghi giữ tên và giá vé tại thời điểm đăng ký. Số vé trong một lần đăng ký được kiểm tra từ 1 đến capacity; ứng dụng không tính tồn vé cộng dồn của mọi bản ghi.

### API đang sử dụng

| Method | Endpoint | Thao tác |
| --- | --- | --- |
| GET | /events | Lấy sự kiện |
| GET | /events/:id | Lấy chi tiết |
| POST | /events | Tạo sự kiện |
| PUT | /events/:id | Sửa sự kiện |
| DELETE | /events/:id | Xóa sự kiện |
| GET | /bookings | Lấy đăng ký |
| POST | /bookings | Tạo đăng ký |
| PUT | /bookings/:id | Hủy đăng ký |

## Cấu trúc và kiến thức React

~~~text
src/
  components/  EventCard, BookingForm, EventForm, FormField...
  contexts/    ThemeContext/Provider, AuthContext/Provider
  hooks/       useFetch, useTheme, useAuth
  layouts/     MainLayout
  pages/       Các trang và điều hướng
  reducers/    eventReducer cho quản lý sự kiện
  services/    apiClient, eventService, bookingService
  utils/       Định dạng tiền, ngày giờ và tìm kiếm
~~~

| Kiến thức | Áp dụng |
| --- | --- |
| Components, props, list & keys | EventCard, FormField và danh sách |
| useState | Từ khóa, bộ lọc, form và hộp xác nhận |
| useEffect và cleanup | Gọi API, hủy GET khi rời trang, lưu theme |
| useContext | Chia sẻ theme và tài khoản/vai trò đăng nhập |
| useReducer | Các chuyển trạng thái tải/thêm/sửa/xóa ở trang quản lý |
| Custom hook | useFetch dùng lại trên trang chủ, danh sách và chi tiết |
| React Router | Routes, NavLink, useParams, Navigate và RequireAuth |
| Formik + Yup | Form đăng nhập, đặt vé và quản lý sự kiện |
| Fetch, async/await | GET, POST, PUT, DELETE với MockAPI |
| React Bootstrap | Navbar, Card, Form, Table, Modal, Alert, Spinner |

Xem giải thích luồng tại [docs/learning-guide.md](docs/learning-guide.md).

## Kiểm tra

~~~bash
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
~~~

Bộ kiểm thử trình duyệt dùng API giả trong chính browser và không ghi vào project MockAPI thật. Nó kiểm tra tìm kiếm/lọc, validation, tổng tiền, ID đăng ký, hủy và tải lại, CRUD sự kiện, múi giờ, lỗi/retry, ảnh lỗi, theme, menu mobile và dữ liệu cũ thiếu mã. Các ca đăng nhập kiểm tra sai mật khẩu, quyền theo URL, phiên khi tải lại/đăng xuất, quay về sự kiện và tách vé giữa các tài khoản.

Nếu đã có Chromium trong môi trường Linux, có thể chỉ định executable bằng biến **PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH**. Trên máy cá nhân, cài browser bằng lệnh Playwright ở trên.

Kiểm tra trực tiếp với MockAPI thật theo [docs/test-checklist.md](docs/test-checklist.md).
