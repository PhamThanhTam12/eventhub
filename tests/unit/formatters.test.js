import test from "node:test";
import assert from "node:assert/strict";
import {
  formatDate, formatMoney, formatPrice, fromVietnamDateInput,
  normalizeText, toVietnamDateInput,
} from "../../src/utils/formatters.js";

test("Vietnam event dates round-trip without shifting time in a UTC browser", () => {
  const input = "2030-12-21T09:30";
  const iso = fromVietnamDateInput(input);
  assert.equal(iso, "2030-12-21T02:30:00.000Z");
  assert.equal(toVietnamDateInput(iso), input);
  assert.match(formatDate(iso), /09:30/);
});

test("Impossible dates and missing dates do not crash the UI", () => {
  assert.equal(fromVietnamDateInput("2030-02-31T09:30"), "");
  assert.equal(fromVietnamDateInput("not-a-date"), "");
  assert.equal(toVietnamDateInput(undefined), "");
  assert.equal(formatDate("not-a-date"), "Chưa cập nhật");
});

test("Vietnamese event search accepts accents, uppercase and extra spaces", () => {
  assert.equal(normalizeText("  ĐÊM NHẠC  "), "dem nhac");
  assert.ok(normalizeText("Đêm nhạc sinh viên").includes(normalizeText("dem nhac")));
});

test("Free tickets and missing prices remain distinguishable", () => {
  assert.equal(formatPrice(0), "Miễn phí");
  assert.match(formatMoney(100000), /100\.000/);
  assert.equal(formatMoney(undefined), "Chưa cập nhật");
});
