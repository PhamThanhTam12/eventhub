export const initialEventState = {
  events: [],
  isLoading: true,
  error: "",
  requestVersion: 0,
  notice: "",
  editor: { isOpen: false, event: null },
  isSaving: false,
  deleteTarget: null,
  isDeleting: false,
  deleteError: "",
};

// Reducer only updates state. HTTP requests remain in the page/service layer.
export function eventReducer(state, action) {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, events: action.payload, isLoading: false, error: "" };
    case "LOAD_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "LOAD_RETRY":
      return {
        ...state, isLoading: true, error: "",
        requestVersion: state.requestVersion + 1,
      };
    case "OPEN_CREATE":
      return { ...state, editor: { isOpen: true, event: null }, notice: "" };
    case "OPEN_EDIT":
      return { ...state, editor: { isOpen: true, event: action.payload }, notice: "" };
    case "CLOSE_EDITOR":
      return state.isSaving ? state : { ...state, editor: { isOpen: false, event: null } };
    case "SAVE_START":
      return { ...state, isSaving: true };
    case "SAVE_ERROR":
      return { ...state, isSaving: false };
    case "SAVE_SUCCESS": {
      const exists = state.events.some((event) => event.id === action.payload.id);
      return {
        ...state,
        events: exists
          ? state.events.map((event) => event.id === action.payload.id ? action.payload : event)
          : [action.payload, ...state.events],
        notice: state.editor.event ? "Đã cập nhật sự kiện." : "Đã thêm sự kiện.",
        editor: { isOpen: false, event: null },
        isSaving: false,
      };
    }
    case "OPEN_DELETE":
      return { ...state, deleteTarget: action.payload, deleteError: "", notice: "" };
    case "CLOSE_DELETE":
      return state.isDeleting ? state : { ...state, deleteTarget: null, deleteError: "" };
    case "DELETE_START":
      return { ...state, isDeleting: true, deleteError: "" };
    case "DELETE_SUCCESS":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
        deleteTarget: null,
        isDeleting: false,
        deleteError: "",
        notice: "Đã xóa sự kiện.",
      };
    case "DELETE_ERROR":
      return { ...state, isDeleting: false, deleteError: action.payload };
    case "NOTICE_DISMISS":
      return { ...state, notice: "" };
    default:
      return state;
  }
}
