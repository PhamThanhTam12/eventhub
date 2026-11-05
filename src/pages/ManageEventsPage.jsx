import { useEffect, useReducer, useState } from "react";
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
  const [editor, setEditor] = useState({ isOpen: false, event: null });
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      try {
        const data = await getEvents(controller.signal);
        if (!controller.signal.aborted) {
          dispatch({ type: "LOAD_SUCCESS", payload: data });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          dispatch({ type: "LOAD_ERROR", payload: error.message });
        }
      }
    }

    loadEvents();
    return () => controller.abort();
  }, []);

  function closeEditor() {
    if (!isSaving) setEditor({ isOpen: false, event: null });
  }

  async function handleSaveEvent(eventData) {
    setIsSaving(true);

    try {
      const saved = editor.event
        ? await updateEvent(editor.event.id, eventData)
        : await createEvent(eventData);

      if (!saved?.id) {
        throw new Error("MockAPI chưa trả mã sự kiện. Hãy kiểm tra trường id kiểu Object ID.");
      }

      dispatch({
        type: editor.event ? "UPDATE_EVENT" : "ADD_EVENT",
        payload: saved,
      });
      setNotice(editor.event ? "Đã cập nhật sự kiện." : "Đã thêm sự kiện.");
      setEditor({ isOpen: false, event: null });
    } finally {
      setIsSaving(false);
    }
  }

  function openDelete(event) {
    setDeleteTarget(event);
    setDeleteError("");
    setNotice("");
  }

  function closeDelete() {
    if (!isDeleting) {
      setDeleteTarget(null);
      setDeleteError("");
    }
  }

  async function handleDeleteEvent() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteEvent(deleteTarget.id);
      dispatch({ type: "DELETE_EVENT", payload: deleteTarget.id });
      setDeleteTarget(null);
      setNotice("Đã xóa sự kiện.");
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (state.isLoading) return <LoadingState>Đang tải danh sách sự kiện...</LoadingState>;
  if (state.error) {
    return <ErrorState message={state.error} onRetry={() => window.location.reload()} />;
  }

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-2">Quản lý sự kiện</h1>
          <p className="text-body-secondary mb-0">Tổng cộng {state.events.length} sự kiện.</p>
        </div>
        <Button
          onClick={() => {
            setEditor({ isOpen: true, event: null });
            setNotice("");
          }}
        >
          Thêm sự kiện
        </Button>
      </div>

      {notice && (
        <Alert variant="success" dismissible onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      {state.events.length === 0 ? (
        <Alert variant="info">Chưa có sự kiện nào. Hãy thêm sự kiện đầu tiên.</Alert>
      ) : (
        <Table responsive striped hover className="align-middle bg-body">
          <thead>
            <tr>
              <th scope="col">Mã</th>
              <th scope="col">Sự kiện</th>
              <th scope="col">Chủ đề</th>
              <th scope="col">Thời gian</th>
              <th scope="col">Giá vé</th>
              <th scope="col">Sức chứa</th>
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
                      onClick={() => {
                        setEditor({ isOpen: true, event });
                        setNotice("");
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outline-danger" size="sm" disabled={!event.id}
                      onClick={() => openDelete(event)}
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
        show={editor.isOpen}
        onHide={closeEditor}
        backdrop="static" keyboard={!isSaving} size="lg" centered
        aria-labelledby="event-editor-title"
      >
        <Modal.Header closeButton={!isSaving} closeLabel="Đóng">
          <Modal.Title id="event-editor-title">
            {editor.event ? "Sửa sự kiện" : "Thêm sự kiện"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editor.isOpen && (
            <EventForm
              key={editor.event?.id || "create"}
              event={editor.event}
              onSubmit={handleSaveEvent}
              onCancel={closeEditor}
            />
          )}
        </Modal.Body>
      </Modal>

      {deleteTarget && (
        <Modal
          show centered backdrop="static" keyboard={!isDeleting}
          onHide={closeDelete}
          aria-labelledby="delete-event-title"
        >
          <Modal.Header closeButton={!isDeleting} closeLabel="Đóng">
            <Modal.Title id="delete-event-title">Xóa sự kiện</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteError && <Alert variant="danger">{deleteError}</Alert>}
            <p>Bạn muốn xóa sự kiện <strong>{deleteTarget.title}</strong>?</p>
            <p className="text-body-secondary mb-0">
              Các đăng ký trước đây vẫn được giữ trong danh sách đăng ký.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary" disabled={isDeleting}
              onClick={closeDelete}
            >
              Quay lại
            </Button>
            <Button variant="danger" disabled={isDeleting} onClick={handleDeleteEvent}>
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </section>
  );
}
