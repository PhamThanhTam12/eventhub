import test from "node:test";
import assert from "node:assert/strict";
import { eventReducer, initialEventState } from "../../src/reducers/eventReducer.js";

test("Saving an edited event replaces its row without duplicating or mutating others", () => {
  const original = [{ id: "1", title: "First" }, { id: "2", title: "Second" }];
  const state = {
    ...initialEventState, events: original, isLoading: false,
    editor: { isOpen: true, event: original[0] }, isSaving: true,
  };
  const result = eventReducer(state, {
    type: "SAVE_SUCCESS", payload: { id: "1", title: "Updated" },
  });
  assert.equal(result.events.length, 2);
  assert.equal(result.events[0].title, "Updated");
  assert.equal(original[0].title, "First");
  assert.strictEqual(result.events[1], original[1]);
  assert.equal(result.editor.isOpen, false);
  assert.equal(result.isSaving, false);
});

test("A failed delete keeps both the event and confirmation dialog for retry", () => {
  const event = { id: "1", title: "Keep me" };
  const state = {
    ...initialEventState, events: [event], deleteTarget: event, isDeleting: true,
  };
  const result = eventReducer(state, { type: "DELETE_ERROR", payload: "Try again" });
  assert.deepEqual(result.events, [event]);
  assert.equal(result.deleteTarget.id, "1");
  assert.equal(result.isDeleting, false);
  assert.equal(result.deleteError, "Try again");
});

test("Successful deletion removes only the selected event", () => {
  const state = {
    ...initialEventState,
    events: [{ id: "1" }, { id: "2" }],
    deleteTarget: { id: "1" },
    isDeleting: true,
  };
  const result = eventReducer(state, { type: "DELETE_SUCCESS", payload: "1" });
  assert.deepEqual(result.events, [{ id: "2" }]);
  assert.equal(result.deleteTarget, null);
  assert.equal(result.isDeleting, false);
});
