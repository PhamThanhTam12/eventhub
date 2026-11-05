const API_URL = import.meta.env.VITE_API_URL;

function checkConfig() {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL trong file .env.");
  }
}

export async function getEvents(signal) {
  checkConfig();

  const response = await fetch(API_URL + "/events", { signal });
  if (!response.ok) throw new Error("Không thể tải danh sách sự kiện.");

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Dữ liệu sự kiện không hợp lệ.");
  return data;
}

export async function getEventById(id, signal) {
  checkConfig();

  const response = await fetch(API_URL + "/events/" + encodeURIComponent(id), { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Không thể tải thông tin sự kiện.");

  return response.json();
}

export async function createEvent(eventData) {
  checkConfig();

  const response = await fetch(API_URL + "/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) throw new Error("Không thể tạo sự kiện. Vui lòng thử lại.");
  return response.json();
}

export async function updateEvent(id, eventData) {
  checkConfig();
  if (!id) throw new Error("Sự kiện chưa có mã để sửa.");

  const response = await fetch(API_URL + "/events/" + encodeURIComponent(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) throw new Error("Không thể sửa sự kiện. Vui lòng thử lại.");
  return response.json();
}

export async function deleteEvent(id) {
  checkConfig();
  if (!id) throw new Error("Sự kiện chưa có mã để xóa.");

  const response = await fetch(API_URL + "/events/" + encodeURIComponent(id), {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Không thể xóa sự kiện. Vui lòng thử lại.");
}
