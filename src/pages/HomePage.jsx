import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Row } from "react-bootstrap";
import EventCard from "../components/EventCard";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { getEvents } from "../services/eventService";

export default function HomePage() {
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
          console.error(error);
          setError("Không tải được dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadEvents();
    return () => controller.abort();
  }, []);

  const stats = [
    { label: "Sự kiện để khám phá", value: events.length },
    { label: "Chủ đề đa dạng", value: new Set(events.map((event) => event.category)).size },
    { label: "Sự kiện miễn phí", value: events.filter((event) => Number(event.price) === 0).length },
  ];

  return (
    <>
      <Card className="border-0 bg-primary text-white shadow-sm">
        <Card.Body className="p-4 p-md-5">
          <Row>
            <Col lg={9}>
              <Badge bg="light" text="primary" className="mb-3">Dành cho cộng đồng sinh viên</Badge>
              <h1 className="display-5 fw-bold mb-4">Khám phá sự kiện, kết nối đam mê.</h1>
              <p className="lead mb-4">
                Tìm workshop, gặp gỡ những người cùng sở thích và đăng ký cho trải nghiệm tiếp theo của bạn.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} to="/events" variant="light" size="lg">Khám phá sự kiện</Button>
                <Button as={Link} to="/bookings" variant="outline-light" size="lg">
                  Xem đăng ký
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {!isLoading && !error && (
        <Row className="g-3 my-4">
          {stats.map((stat) => (
            <Col sm={4} key={stat.label}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="fs-2 fw-bold text-primary">{stat.value}</div>
                  <div className="text-body-secondary">{stat.label}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <section className="mt-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="h3 mb-2">Sự kiện nổi bật</h2>
            <p className="text-body-secondary mb-0">Chọn một sự kiện và bắt đầu kết nối.</p>
          </div>
          <Button as={Link} to="/events" variant="outline-primary">Xem tất cả</Button>
        </div>
        {isLoading ? <LoadingState>Đang tải sự kiện...</LoadingState> : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : events.length === 0 ? (
          <Alert variant="info">Sự kiện mới sẽ được cập nhật tại đây.</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {events.slice(0, 3).map((event, index) => (
              <Col key={event.id || "missing-" + index}><EventCard event={event} /></Col>
            ))}
          </Row>
        )}
      </section>
    </>
  );
}
