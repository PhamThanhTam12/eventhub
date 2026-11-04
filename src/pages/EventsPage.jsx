import { useEffect, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import EventCard from "../components/EventCard";
import { getEvents } from "../services/eventService";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      try {
        const data = await getEvents(controller.signal);
        setEvents(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(
            "Không tải được danh sách sự kiện. Bạn hãy thử tải lại trang.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Đang tải sự kiện...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <section>
      <h1 className="h2 mb-2">Khám phá sự kiện</h1>

      <p className="text-body-secondary mb-4">
        Tìm hoạt động phù hợp với sở thích của bạn.
      </p>

      {events.length === 0 ? (
        <Alert variant="info" role="status">
          Chưa có sự kiện nào.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {events.map((item) => (
            <Col key={item.id}>
              <EventCard event={item} />
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}
