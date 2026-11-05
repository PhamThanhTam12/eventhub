import { demoAccounts } from "../data/demoAccounts.js";

export const AUTH_STORAGE_KEY = "eventhub-user-id";

function toSessionUser(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function getDemoUserById(id) {
  const account = demoAccounts.find((item) => item.id === id);
  return account ? toSessionUser(account) : null;
}

export function authenticateDemo(email, password) {
  const account = demoAccounts.find(
    (item) => item.email === normalizeEmail(email) && item.password === password
  );

  if (!account) throw new Error("Email hoặc mật khẩu không đúng.");
  return toSessionUser(account);
}

export function canAccessBooking(user, booking) {
  if (!user || !booking) return false;
  if (user.role === "admin") return true;

  const ownerEmail = normalizeEmail(booking.email);
  return user.role === "user" && Boolean(ownerEmail) &&
    ownerEmail === normalizeEmail(user.email);
}

export function getLoginDestination(from, user) {
  const fallback = user?.role === "admin" ? "/admin/events" : "/bookings";

  if (
    typeof from !== "string" || !from.startsWith("/") ||
    from.startsWith("//") || from.includes("\\") ||
    Array.from(from).some((character) => character.charCodeAt(0) < 32)
  ) return fallback;

  const path = from.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "");
  if (path === "/login") return fallback;
  if ((path === "/admin" || path.startsWith("/admin/")) && user?.role !== "admin") {
    return fallback;
  }

  return from;
}
