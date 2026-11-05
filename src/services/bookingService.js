const API_URL = import.meta.env.VITE_API_URL;

export async function createBooking(bookingData) {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL trong file .env.");
  }

  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error("Không thể tạo đăng ký vé.");
  }

  const data = await response.json();

  return data;
}
export async function getBookings(signal) {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL trong file .env.");
  }

  const response = await fetch(`${API_URL}/bookings`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách đăng ký.");
  }

  const data = await response.json();

  return data;
}

export async function cancelBooking(booking) {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL trong file .env.");
  }

  const response = await fetch(`${API_URL}/bookings/${booking.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...booking,
      status: "cancelled",
    }),
  });

  if (!response.ok) {
    throw new Error("Không thể hủy đăng ký.");
  }

  const data = await response.json();

  return data;
}
