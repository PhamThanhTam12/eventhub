const vietnamTimeZone = "Asia/Ho_Chi_Minh";
const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function formatMoney(value) {
  if (value === null || value === "" || !Number.isFinite(Number(value))) {
    return "Chưa cập nhật";
  }

  return moneyFormatter.format(Number(value));
}

export function formatPrice(value) {
  return value !== null && value !== "" && Number(value) === 0
    ? "Miễn phí"
    : formatMoney(value);
}

export function formatDate(value, full = false) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Chưa cập nhật";

  const options = full
    ? { dateStyle: "full", timeStyle: "short" }
    : {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      };

  return new Intl.DateTimeFormat("vi-VN", {
    ...options,
    timeZone: vietnamTimeZone,
  }).format(date);
}

export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .trim();
}

// datetime-local in the event editor always represents Vietnam time.
export function toVietnamDateInput(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: vietnamTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return values.year + "-" + values.month + "-" + values.day +
    "T" + values.hour + ":" + values.minute;
}

export function fromVietnamDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value || "")) return "";
  const date = new Date(value + ":00+07:00");
  if (Number.isNaN(date.getTime())) return "";

  const iso = date.toISOString();
  return toVietnamDateInput(iso) === value ? iso : "";
}
