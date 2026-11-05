import { test, expect } from "@playwright/test";
import { mockApi } from "./mockApi";

let pageErrors;
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
});
test.afterEach(() => expect(pageErrors).toEqual([]));

async function fillEventForm(page, title = "Workshop TypeScript") {
  await page.getByLabel("Tên sự kiện", { exact: true }).fill(title);
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("Công nghệ");
  await page.getByLabel("Thời gian bắt đầu (giờ Việt Nam)").fill("2030-12-21T09:30");
  await page.getByLabel("Địa điểm", { exact: true }).fill("Phòng B201");
  await page.getByLabel("URL ảnh", { exact: true }).fill("https://images.unsplash.com/new-test.jpg");
  await page.getByLabel("Mô tả", { exact: true }).fill("Thực hành TypeScript với nhiều ví dụ dành cho sinh viên.");
  await page.getByLabel("Giá vé (đồng)", { exact: true }).fill("75000");
  await page.getByLabel("Sức chứa", { exact: true }).fill("30");
}

test("Search, categories, prices, empty results and reset", async ({ page }) => {
  await mockApi(page);
  await page.goto("/events");
  await expect(page.getByRole("article")).toHaveCount(3);
  await page.getByLabel("Tìm sự kiện").fill("dem nhac");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Đêm nhạc");
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("Nghề nghiệp");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await page.getByLabel("Giá vé", { exact: true }).selectOption("free");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByLabel("Tìm sự kiện").fill("not-an-event");
  await expect(page.getByText("Không tìm thấy sự kiện phù hợp.")).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page.getByRole("article")).toHaveCount(3);
  await page.screenshot({ path: test.info().outputPath("events-desktop.png"), fullPage: true });
});

test("Booking validation, amount, generated ID and cancellation survive reload", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/events/2");
  await page.getByRole("button", { name: "Xác nhận đăng ký", exact: true }).click();
  await expect(page.getByText("Vui lòng nhập họ tên.", { exact: true })).toBeVisible();
  await page.getByLabel("Họ và tên").fill("Nguyễn Văn An");
  await page.getByLabel("Email", { exact: true }).fill("wrong-email");
  await page.getByLabel("Số điện thoại").fill("123");
  await page.getByRole("button", { name: "Xác nhận đăng ký", exact: true }).click();
  await expect(page.getByText("Email không hợp lệ.", { exact: true })).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("student@example.test");
  await page.getByLabel("Số điện thoại").fill("0900000000");
  await page.getByLabel("Số lượng vé").fill("101");
  await page.getByRole("button", { name: "Xác nhận đăng ký", exact: true }).click();
  await expect(page.getByText("Tối đa 100 vé.", { exact: true })).toBeVisible();
  await page.getByLabel("Số lượng vé").fill("2");
  await expect(page.getByText("Tổng tiền:", { exact: false })).toContainText("100.000");
  await page.getByRole("button", { name: "Xác nhận đăng ký", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đăng ký thành công!" })).toBeVisible();
  expect(api.bookings).toHaveLength(1);
  expect(api.bookings[0]).toMatchObject({
    id: "1", eventId: "2", quantity: 2, unitPrice: 50000,
    totalPrice: 100000, status: "confirmed",
  });
  expect(api.requests.find((item) => item.method === "POST").body).not.toHaveProperty("id");

  await page.getByRole("button", { name: "Xem đăng ký", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Nguyễn Văn An" });
  await expect(row).toContainText("Đã xác nhận");
  await row.getByRole("button", { name: "Hủy đăng ký" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Quay lại" }).click();
  expect(api.bookings[0].status).toBe("confirmed");
  await row.getByRole("button", { name: "Hủy đăng ký" }).click();
  api.delays["PUT /bookings/1"] = 400;
  await page.getByRole("button", { name: "Xác nhận hủy", exact: true }).click();
  await expect(page.getByRole("button", { name: "Đang hủy..." })).toBeDisabled();
  await expect(row).toContainText("Đã hủy");
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Nguyễn Văn An" })).toContainText("Đã hủy");
  expect(api.bookings[0]).toMatchObject({ eventId: "2", quantity: 2, totalPrice: 100000 });
});

test("Create, edit and delete events preserve Vietnam time and refresh data", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/admin/events");
  await page.getByRole("button", { name: "Thêm sự kiện", exact: true }).click();
  await page.getByRole("button", { name: "Tạo sự kiện", exact: true }).click();
  await expect(page.getByText("Vui lòng nhập tên sự kiện.", { exact: true })).toBeVisible();
  await fillEventForm(page);
  await page.getByRole("button", { name: "Tạo sự kiện", exact: true }).click();
  await expect(page.getByText("Đã thêm sự kiện.", { exact: true })).toBeVisible();
  const created = api.events.find((item) => item.id === "10");
  expect(created).toMatchObject({
    startAt: "2030-12-21T02:30:00.000Z", price: 75000, capacity: 30,
  });
  const row = page.getByRole("row").filter({ hasText: "Workshop TypeScript" });
  await row.getByRole("button", { name: "Sửa", exact: true }).click();
  await expect(page.getByLabel("Thời gian bắt đầu (giờ Việt Nam)")).toHaveValue("2030-12-21T09:30");
  await page.getByLabel("Tên sự kiện", { exact: true }).fill("Workshop TypeScript nâng cao");
  await page.getByLabel("Giá vé (đồng)", { exact: true }).fill("80000");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã cập nhật sự kiện.", { exact: true })).toBeVisible();
  expect(api.events.find((item) => item.id === "10")).toMatchObject({
    title: "Workshop TypeScript nâng cao", price: 80000,
    startAt: "2030-12-21T02:30:00.000Z",
  });
  await row.getByRole("button", { name: "Xóa", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Quay lại" }).click();
  expect(api.events).toHaveLength(4);
  await row.getByRole("button", { name: "Xóa", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận xóa" }).click();
  await expect(page.getByText("Đã xóa sự kiện.", { exact: true })).toBeVisible();
  expect(api.events).toHaveLength(3);
  await page.reload();
  await expect(page.getByRole("row")).toHaveCount(4);
  await page.getByRole("link", { name: "Sự kiện", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(3);
});

test("A failed save retains form values and allows retry", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/admin/events");
  await page.getByRole("button", { name: "Thêm sự kiện", exact: true }).click();
  await fillEventForm(page, "Sự kiện thử lại");
  api.failNext = "POST /events";
  await page.getByRole("button", { name: "Tạo sự kiện", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Vui lòng thử lại");
  await expect(page.getByLabel("Tên sự kiện", { exact: true })).toHaveValue("Sự kiện thử lại");
  await expect(page.getByRole("button", { name: "Tạo sự kiện", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Tạo sự kiện", exact: true }).click();
  await expect(page.getByText("Đã thêm sự kiện.", { exact: true })).toBeVisible();
  expect(api.events.filter((item) => item.title === "Sự kiện thử lại")).toHaveLength(1);
});

test("Missing events, unknown routes and broken images have useful fallbacks", async ({ page }) => {
  const api = await mockApi(page);
  api.events[0].image = "https://broken.example.test/image.png";
  await page.route("https://broken.example.test/**", (route) => route.abort());
  await page.goto("/events/1");
  await expect(page.getByRole("img", { name: "Workshop React cơ bản" }))
    .toHaveAttribute("src", "/event-placeholder.svg");
  await page.goto("/events/99999");
  await expect(page.getByText("Sự kiện không tồn tại hoặc đã được xóa.")).toBeVisible();
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
});

test("Theme persists after reload and mobile navigation remains usable", async ({ page }) => {
  await mockApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("article")).toHaveCount(3);
  await page.getByRole("button", { name: "Mở hoặc đóng menu" }).click();
  await page.getByRole("button", { name: "Bật chế độ tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  await page.getByRole("button", { name: "Mở hoặc đóng menu" }).click();
  await page.getByRole("link", { name: "Sự kiện", exact: true }).click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole("link", { name: "Danh sách đăng ký", exact: true })).not.toBeVisible();
  const noHorizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth
  );
  expect(noHorizontalOverflow).toBe(true);
  await page.screenshot({ path: test.info().outputPath("events-mobile-dark.png"), fullPage: true });
});

test("Read failures can be retried and empty bookings show a useful message", async ({ page }) => {
  const api = await mockApi(page);
  api.failAlways = "GET /events";
  await page.goto("/events");
  await expect(page.getByRole("alert")).toContainText("Vui lòng thử lại");
  api.failAlways = null;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(3);
  await page.goto("/bookings");
  await expect(page.getByRole("alert")).toContainText("Chưa có đăng ký nào.");
});

test("Legacy records with missing IDs or unknown status cannot send invalid cancellation requests", async ({ page }) => {
  const api = await mockApi(page);
  api.bookings = [
    { eventId: "1", eventTitle: "Legacy no ID", fullName: "Demo", email: "demo@example.test",
      quantity: 1, totalPrice: 0, status: "confirmed" },
    { id: "2", eventId: "1", eventTitle: "Legacy status", fullName: "Demo",
      email: "demo@example.test", quantity: 1, totalPrice: 0, status: "status 1" },
  ];
  await page.goto("/bookings");
  await expect(page.getByText("Thiếu mã", { exact: true })).toBeVisible();
  const buttons = page.getByRole("button", { name: "Hủy đăng ký" });
  await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toBeDisabled();
  await expect(buttons.nth(1)).toBeDisabled();
  expect(api.requests.filter((item) => item.method === "PUT")).toHaveLength(0);
});
