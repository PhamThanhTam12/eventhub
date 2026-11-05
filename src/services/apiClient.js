const API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function requireId(id) {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new ApiError("Bản ghi thiếu mã. Hãy kiểm tra trường id kiểu Object ID trên MockAPI.");
  }

  return encodeURIComponent(String(id));
}

export async function apiRequest(
  path,
  { method = "GET", body, signal, allowNotFound = false } = {}
) {
  if (!API_URL) {
    throw new ApiError("Chưa cấu hình VITE_API_URL. Hãy tạo file .env theo .env.example.");
  }

  let response;

  try {
    response = await fetch(API_URL + path, {
      method,
      signal,
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Không kết nối được dữ liệu. Vui lòng kiểm tra mạng và thử lại.");
  }

  if (response.status === 404 && allowNotFound) return null;

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "Bản ghi không tồn tại hoặc đã được xóa."
        : "Yêu cầu chưa thành công. Vui lòng thử lại.",
      response.status
    );
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    throw new ApiError("Không đọc được dữ liệu trả về. Vui lòng thử lại.");
  }
}

export async function getCollection(path, signal) {
  const data = await apiRequest(path, { signal });

  if (!Array.isArray(data)) {
    throw new ApiError("Danh sách dữ liệu không hợp lệ. Vui lòng kiểm tra resource trên MockAPI.");
  }

  return data;
}
