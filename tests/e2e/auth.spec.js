import { test, expect } from "@playwright/test";
import { mockApi } from "./mockApi";
import { loginAs, logoutFromMenu } from "./authHelpers";

test("Guests browse events but must sign in for bookings or management", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/admin/events");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Đăng nhập", exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("login-desktop.png"), fullPage: true });
  expect(api.requests.filter((item) => item.path === "/events")).toHaveLength(0);
  await expect(page.getByRole("link", { name: "Quản lý sự kiện", exact: true })).toHaveCount(0);
  await page.goto("/bookings");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/events/2");
  await expect(page.getByRole("heading", { name: "Ngày hội định hướng nghề nghiệp" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Đăng nhập để đăng ký" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Xác nhận đăng ký", exact: true })).toHaveCount(0);
});

test("Login validates fields, rejects wrong credentials and blocks ordinary users from admin URLs", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/login");
  const submit = page.getByRole("main").getByRole("button", { name: "Đăng nhập", exact: true });
  await submit.click();
  await expect(page.getByText("Vui lòng nhập email.", { exact: true })).toBeVisible();
  await expect(page.getByText("Vui lòng nhập mật khẩu.", { exact: true })).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("user@eventhub.test");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("wrong-password");
  await submit.click();
  await expect(page.getByRole("alert")).toContainText("Email hoặc mật khẩu không đúng.");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("user@eventhub.test");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("User123!");
  await submit.click();
  await expect(page).toHaveURL(/\/bookings$/);
  await expect(page.getByRole("heading", { name: "Vé của tôi" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Quản lý sự kiện", exact: true })).toHaveCount(0);
  const eventRequests = api.requests.filter((item) => item.path === "/events").length;
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "Không có quyền truy cập" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thêm sự kiện" })).toHaveCount(0);
  expect(api.requests.filter((item) => item.path === "/events")).toHaveLength(eventRequests);
});

test("Login returns to the selected event, persists after reload and logout protects previous routes", async ({ page }) => {
  await mockApi(page);
  await page.goto("/events/2");
  await page.getByRole("button", { name: "Đăng nhập để đăng ký" }).click();
  await page.getByLabel("Email", { exact: true }).fill("user@eventhub.test");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("User123!");
  await page.getByRole("main").getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/events\/2$/);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("user@eventhub.test");
  await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute("readonly", "");
  await page.reload();
  await expect(page.getByRole("button", { name: "Tài khoản", exact: true })).toBeVisible();
  const savedSession = await page.evaluate(() => ({
    id: localStorage.getItem("eventhub-user-id"),
    allValues: Object.values(localStorage).join(" "),
  }));
  expect(savedSession.id).toBe("demo-user");
  expect(savedSession.allValues).not.toContain("User123!");
  await logoutFromMenu(page);
  await expect(page.getByRole("navigation").getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible();
  await page.goto("/bookings");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("eventhub-user-id"))).toBeNull();
});

test("Ordinary users see and cancel only their bookings while admin sees every booking", async ({ page }) => {
  const api = await mockApi(page);
  api.bookings = [
    {
      id: "1", eventId: "1", eventTitle: "My booking", fullName: "My account",
      email: "user@eventhub.test", phone: "0900000000", quantity: 1,
      unitPrice: 0, totalPrice: 0, status: "confirmed",
    },
    {
      id: "2", eventId: "2", eventTitle: "Other booking", fullName: "Another account",
      email: "other@example.test", phone: "0900000001", quantity: 1,
      unitPrice: 50000, totalPrice: 50000, status: "confirmed",
    },
  ];
  await loginAs(page, "user");
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByText("My booking", { exact: true })).toBeVisible();
  await expect(page.getByText("Other booking", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath("user-bookings.png"), fullPage: true });
  await page.getByRole("button", { name: "Hủy đăng ký", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận hủy", exact: true }).click();
  await expect(page.getByText("Đã hủy", { exact: true })).toBeVisible();
  expect(api.bookings.find((item) => item.id === "2").status).toBe("confirmed");

  await logoutFromMenu(page);
  await loginAs(page, "admin", "/bookings");
  await expect(page.getByRole("heading", { name: "Danh sách đăng ký" })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("Other booking", { exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("admin-bookings.png"), fullPage: true });
  await expect(page.getByRole("link", { name: "Quản lý sự kiện", exact: true })).toBeVisible();
});

test("An unknown stored account ID is treated as logged out", async ({ page }) => {
  await mockApi(page);
  await page.addInitScript(() => localStorage.setItem("eventhub-user-id", "not-a-real-demo-account"));
  await page.goto("/admin/events");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Đăng nhập", exact: true })).toBeVisible();
});

test("Mobile user menu can log out without leaving navigation expanded", async ({ page }) => {
  await mockApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, "user");
  await page.getByRole("button", { name: "Mở hoặc đóng menu" }).click();
  await logoutFromMenu(page);
  await expect(page.getByRole("button", { name: "Mở hoặc đóng menu" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Mở hoặc đóng menu" }).click();
  await expect(page.getByRole("navigation").getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible();
  await expect(page.locator("#main-navbar")).toHaveClass(/\bshow\b/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("login-mobile.png"), fullPage: true });
});
