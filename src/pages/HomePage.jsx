import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Row } from "react-bootstrap";
import EventCard from "../components/EventCard";
import EventImage from "../components/EventImage";
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

  const featuredEvent = events.find((event) => event.id);

  return (
    <>
      <Card className="event-hero border-0 rounded-4 bg-primary bg-gradient text-white overflow-hidden shadow-sm">
        <Card.Body className="p-4 p-lg-5">
          <Row className="g-4 g-xl-5 align-items-center">
            <Col lg={7}>
              <Badge bg="light" text="primary" className="rounded-pill px-3 py-2 mb-4">
                Không gian kết nối của bạn
              </Badge>
              <h1 className="display-5 fw-bold mb-4">Khám phá sự kiện,<br />kết nối đam mê.</h1>
              <p className="lead text-white text-opacity-75 mb-4">
                Từ một buổi workshop đến một đêm nhạc đáng nhớ.
                Tìm trải nghiệm tiếp theo và những người cùng sở thích với bạn.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} to="/events" variant="light" size="lg" className="rounded-pill px-4">
                  Khám phá sự kiện <span aria-hidden="true">→</span>
                </Button>
                <Button as={Link} to="/bookings" variant="outline-light" size="lg" className="rounded-pill px-4">
                  Xem đăng ký
                </Button>
              </div>
              <p className="small text-white text-opacity-75 mt-4 mb-0">
                Workshop · Âm nhạc · Nghề nghiệp · Cộng đồng
              </p>
            </Col>
            <Col lg={5}>
              <div className="hero-feature bg-white bg-opacity-10 rounded-4 p-3 border border-white border-opacity-25">
                {featuredEvent ? (
                  <>
                    <div className="ratio ratio-4x3 rounded-3 overflow-hidden mb-3">
                      <EventImage src={featuredEvent.image} alt={featuredEvent.title} className="w-100 h-100 object-fit-cover" />
                    </div>
                    <Badge bg="light" text="primary" className="rounded-pill mb-2">Gợi ý cho bạn</Badge>
                    <h2 className="h4 fw-bold mb-2">{featuredEvent.title}</h2>
                    <p className="small text-white text-opacity-75 mb-3">{featuredEvent.location}</p>
                    <Button as={Link} to={"/events/" + featuredEvent.id} variant="outline-light" className="rounded-pill px-4">
                      Tìm hiểu sự kiện <span aria-hidden="true">→</span>
                    </Button>
                  </>
                ) : (
                  <div className="py-5 text-center">
                    <span className="display-3" aria-hidden="true">✦</span>
                    <h2 className="h4 fw-bold mt-3">Một cuộc hẹn mới đang chờ</h2>
                    <p className="mb-0 text-white text-opacity-75">Gặp gỡ, học hỏi và tạo thêm kỷ niệm.</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {!isLoading && !error && (
        <Row className="g-3 my-4">
          {stats.map((stat) => (
            <Col sm={4} key={stat.label}>
              <Card className="stat-card h-100 border-0 rounded-4 shadow-sm">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div className="fs-2 fw-bold text-primary bg-primary-subtle rounded-3 px-3 py-1">{stat.value}</div>
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
            <p className="section-eyebrow small text-primary fw-bold text-uppercase mb-2">Đừng bỏ lỡ</p>
            <h2 className="h3 fw-bold mb-2">Sự kiện nổi bật</h2>
            <p className="text-body-secondary mb-0">Chọn một sự kiện và bắt đầu kết nối.</p>
          </div>
          <Button as={Link} to="/events" variant="outline-primary" className="rounded-pill px-4">Xem tất cả</Button>
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
