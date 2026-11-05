const API_URL = import.meta.env.VITE_API_URL;
export async function getEvents(signal) {
  if (!API_URL) {
    throw new Error("Chưa cấu hình API trong file .env");
  }
  const response = await fetch(`${API_URL}/events`, { signal });
  if (!response.ok) {
    throw new Error("Không thể tải danh sách sự kiện");
  }
  const data = await response.json();
  return data;
}

export async function getEventById(signal, id) {
  if (!API_URL) {
    throw new Error("Chưa cấu hình API trong file .env");
  }
  const response = await fetch(`${API_URL}/events/${id}`, { signal });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Không thể tải danh sách sự kiện");
  }
  const data = await response.json();
  return data;
}
