import { apiRequest, getCollection, requireId } from "./apiClient";

export function getEvents(signal) {
  return getCollection("/events", signal);
}

export function getEventById(id, signal) {
  return apiRequest("/events/" + requireId(id), {
    signal,
    allowNotFound: true,
  });
}

export function createEvent(eventData) {
  return apiRequest("/events", { method: "POST", body: eventData });
}

export function updateEvent(id, eventData) {
  return apiRequest("/events/" + requireId(id), {
    method: "PUT",
    body: eventData,
  });
}

export function deleteEvent(id) {
  return apiRequest("/events/" + requireId(id), { method: "DELETE" });
}
