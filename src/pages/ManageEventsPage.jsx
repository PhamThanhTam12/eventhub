import { useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Modal, Table } from "react-bootstrap";
import EventForm from "../components/EventForm";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../services/eventService";
import { eventReducer, initialEventState } from "../reducers/eventReducer";
import { formatDate, formatPrice } from "../utils/formatters";

export default function ManageEventsPage() {
  const [state, dispatch] = useReducer(eventReducer, initialEventState);
  const { requestVersion } = state;

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      try {
        const data = await getEvents(controller.signal);
        if (!controller.signal.aborted) {
          dispatch({ type: "LOAD_SUCCESS", payload: data });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          dispatch({ type: "LOAD_ERROR", payload: error.message });
        }
      }
    }

    loadEvents();
    return () => controller.abort();
  }, [requestVersion]);

  async function handleSaveEvent(eventData) {
    dispatch({ type: "SAVE_START" });

    try {
      const saved = state.editor.event
        ? await updateEvent(state.editor.event.id, eventData)
        : await createEvent(eventData);

      if (!saved?.id) {
        throw new Error("MockAPI chưa trả mã sự kiện. Hãy kiểm tra trường id kiểu Object ID.");
      }

      dispatch({ type: "SAVE_SUCCESS", payload: saved });
    } catch (error) {
      dispatch({ type: "SAVE_ERROR" });
      throw error;
    }
  }

  async function handleDeleteEvent() {
    if (!state.deleteTarget || state.isDeleting) return;
    dispatch({ type: "DELETE_START" });

    try {
      await deleteEvent(state.deleteTarget.id);
      dispatch({ type: "DELETE_SUCCESS", payload: state.deleteTarget.id });
    } catch (error) {
      dispatch({ type: "DELETE_ERROR", payload: error.message });
    }
  }

  if (state.isLoading) return <LoadingState>Đang tải danh sách sự kiện...</LoadingState>;
  if (state.error) {
    return <ErrorState message={state.error} onRetry={() => dispatch({ type: "LOAD_RETRY" })} />;
  }

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-2">Quản lý sự kiện</h1>
          <p className="text-body-secondary mb-0">Tổng cộng {state.events.length} sự kiện.</p>
        </div>
        <Button onClick={() => dispatch({ type: "OPEN_CREATE" })}>Thêm sự kiện</Button>
      </div>

      {state.notice && (
        <Alert variant="success" dismissible onClose={() => dispatch({ type: "NOTICE_DISMISS" })}>
          {state.notice}
        </Alert>
      )}

      {state.events.length === 0 ? (
        <Alert variant="info">Chưa có sự kiện nào. Hãy thêm sự kiện đầu tiên.</Alert>
      ) : (
        <Table responsive striped hover className="align-middle bg-body">
          <thead>
            <tr>
              <th scope="col">Mã</th><th scope="col">Sự kiện</th>
              <th scope="col">Chủ đề</th><th scope="col">Thời gian</th>
              <th scope="col">Giá vé</th><th scope="col">Sức chứa</th>
              <th scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {state.events.map((event, index) => (
              <tr key={event.id || "missing-" + index}>
                <td>{event.id || "Thiếu mã"}</td>
                <td>
                  <div className="fw-semibold">{event.title}</div>
                  <div className="small text-body-secondary">{event.location}</div>
                </td>
                <td>{event.category}</td>
                <td className="text-nowrap">{formatDate(event.startAt)}</td>
                <td className="text-nowrap">{formatPrice(event.price)}</td>
                <td>{event.capacity}</td>
                <td>
                  <div className="d-flex gap-2">
                    {event.id && (
                      <Button as={Link} to={"/events/" + event.id} variant="outline-primary" size="sm">
                        Xem
                      </Button>
                    )}
                    <Button
                      variant="outline-secondary" size="sm" disabled={!event.id}
                      onClick={() => dispatch({ type: "OPEN_EDIT", payload: event })}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outline-danger" size="sm" disabled={!event.id}
                      onClick={() => dispatch({ type: "OPEN_DELETE", payload: event })}
                    >
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        show={state.editor.isOpen}
        onHide={() => dispatch({ type: "CLOSE_EDITOR" })}
        backdrop="static" keyboard={!state.isSaving} size="lg" centered
        aria-labelledby="event-editor-title"
      >
        <Modal.Header closeButton={!state.isSaving} closeLabel="Đóng">
          <Modal.Title id="event-editor-title">
            {state.editor.event ? "Sửa sự kiện" : "Thêm sự kiện"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {state.editor.isOpen && (
            <EventForm
              key={state.editor.event?.id || "create"}
              event={state.editor.event}
              onSubmit={handleSaveEvent}
              onCancel={() => dispatch({ type: "CLOSE_EDITOR" })}
            />
          )}
        </Modal.Body>
      </Modal>

      {state.deleteTarget && (
        <Modal
          show centered backdrop="static" keyboard={!state.isDeleting}
          onHide={() => dispatch({ type: "CLOSE_DELETE" })}
          aria-labelledby="delete-event-title"
        >
          <Modal.Header closeButton={!state.isDeleting} closeLabel="Đóng">
            <Modal.Title id="delete-event-title">Xóa sự kiện</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {state.deleteError && <Alert variant="danger">{state.deleteError}</Alert>}
            <p>Bạn muốn xóa sự kiện <strong>{state.deleteTarget.title}</strong>?</p>
            <p className="text-body-secondary mb-0">
              Các đăng ký trước đây vẫn được giữ trong danh sách đăng ký.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary" disabled={state.isDeleting}
              onClick={() => dispatch({ type: "CLOSE_DELETE" })}
            >
              Quay lại
            </Button>
            <Button variant="danger" disabled={state.isDeleting} onClick={handleDeleteEvent}>
              {state.isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </section>
  );
}
