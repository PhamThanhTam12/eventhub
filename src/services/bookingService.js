const API_URL = import.meta.env.VITE_API_URL;

function checkConfig() {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL trong file .env.");
  }
}

export async function createBooking(bookingData) {
  checkConfig();

  const response = await fetch(API_URL + "/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) throw new Error("Không thể tạo đăng ký vé.");
  return response.json();
}

export async function getBookings(signal) {
  checkConfig();

  const response = await fetch(API_URL + "/bookings", { signal });
  if (!response.ok) throw new Error("Không thể tải danh sách đăng ký.");

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Dữ liệu đăng ký không hợp lệ.");
  return data;
}

export async function cancelBooking(booking) {
  checkConfig();
  if (!booking.id) throw new Error("Đăng ký chưa có mã để hủy.");

  const response = await fetch(API_URL + "/bookings/" + encodeURIComponent(booking.id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...booking, status: "cancelled" }),
  });

  if (!response.ok) throw new Error("Không thể hủy đăng ký. Vui lòng thử lại.");
  return response.json();
}
