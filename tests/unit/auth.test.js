import test from "node:test";
import assert from "node:assert/strict";
import {
  authenticateDemo, canAccessBooking, getDemoUserById, getLoginDestination,
} from "../../src/utils/auth.js";

test("Login normalizes email, checks passwords and returns no password in session", () => {
  const user = authenticateDemo(" USER@EVENTHUB.TEST ", "User123!");
  assert.equal(user.role, "user");
  assert.equal(user.email, "user@eventhub.test");
  assert.equal("password" in user, false);
  assert.throws(() => authenticateDemo("user@eventhub.test", "wrong"), /không đúng/);
  assert.throws(() => authenticateDemo("user@eventhub.test", "User123! "), /không đúng/);
});

test("Session restoration derives account role from the demo account ID", () => {
  assert.equal(getDemoUserById("demo-admin").role, "admin");
  assert.equal(getDemoUserById("unknown-id"), null);
  const user = getDemoUserById("demo-user");
  user.role = "admin";
  assert.equal(getDemoUserById("demo-user").role, "user");
});

test("Ordinary users see their own email bookings while admins can see all", () => {
  const user = getDemoUserById("demo-user");
  const admin = getDemoUserById("demo-admin");
  assert.equal(canAccessBooking(user, { email: " USER@EVENTHUB.TEST " }), true);
  assert.equal(canAccessBooking(user, { email: "someone@example.test" }), false);
  assert.equal(canAccessBooking(user, {}), false);
  assert.equal(canAccessBooking(null, { email: user.email }), false);
  assert.equal(canAccessBooking(admin, { email: "someone@example.test" }), true);
});

test("Post-login navigation stays inside the app and avoids login loops or admin paths for users", () => {
  const user = getDemoUserById("demo-user");
  const admin = getDemoUserById("demo-admin");
  for (const path of [
    "https://example.test", "//example.test", "/\\example.test", "/login", "/LOGIN?x=1",
    "\n/events", undefined,
  ]) {
    assert.equal(getLoginDestination(path, user), "/bookings");
  }
  assert.equal(getLoginDestination("/admin/events", user), "/bookings");
  assert.equal(getLoginDestination("/admin/events", admin), "/admin/events");
  assert.equal(getLoginDestination("/events/2?source=home", user), "/events/2?source=home");
});
