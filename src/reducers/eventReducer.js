export const initialEventState = {
  events: [],
  isLoading: true,
  error: "",
};

export function eventReducer(state, action) {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, events: action.payload, isLoading: false, error: "" };

    case "LOAD_ERROR":
      return { ...state, isLoading: false, error: action.payload };

    case "ADD_EVENT":
      return { ...state, events: [action.payload, ...state.events] };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };

    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };

    default:
      return state;
  }
}
