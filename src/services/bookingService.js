import { apiRequest, getCollection, requireId } from "./apiClient";

export function createBooking(bookingData) {
  return apiRequest("/bookings", { method: "POST", body: bookingData });
}

export function getBookings(signal) {
  return getCollection("/bookings", signal);
}

export function cancelBooking(booking) {
  return apiRequest("/bookings/" + requireId(booking.id), {
    method: "PUT",
    body: { ...booking, status: "cancelled" },
  });
}
