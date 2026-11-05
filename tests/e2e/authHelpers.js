import { expect } from "@playwright/test";

export async function loginAs(page, role = "user", destination) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(
    role === "admin" ? "admin@eventhub.test" : "user@eventhub.test"
  );
  await page.getByLabel("Mật khẩu", { exact: true }).fill(
    role === "admin" ? "Admin123!" : "User123!"
  );
  await page.getByRole("main").getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  await expect.poll(() => page.evaluate(
    () => localStorage.getItem("eventhub-user-id")
  )).toBe(role === "admin" ? "demo-admin" : "demo-user");
  const target = destination || (role === "admin" ? "/admin/events" : "/bookings");
  if (new URL(page.url()).pathname !== target) await page.goto(target);
  await expect(page).toHaveURL(new RegExp(target + "$"));
}

export async function logoutFromMenu(page, role = "user") {
  await page.getByRole("button", {
    name: role === "admin" ? "Admin" : "Tài khoản", exact: true,
  }).click();
  await page.getByText("Đăng xuất", { exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}
