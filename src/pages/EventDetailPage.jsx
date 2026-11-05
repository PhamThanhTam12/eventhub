import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import BookingForm from "../components/BookingForm";
import ErrorState from "../components/ErrorState";
import EventImage from "../components/EventImage";
import LoadingState from "../components/LoadingState";
import { getEventById } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatPrice } from "../utils/formatters";

export default function EventDetailPage() {
  const { id } = useParams();
  return <EventDetailContent key={id} id={id} />;
}

// Reset the detail state when the event ID on the URL changes.
function EventDetailContent({ id }) {
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      try {
        const data = await getEventById(id, controller.signal);
        setEvent(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setError("Không tải được thông tin sự kiện. Vui lòng thử lại.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadEvent();
    return () => controller.abort();
  }, [id]);

  if (isLoading) return <LoadingState>Đang tải thông tin sự kiện...</LoadingState>;

  if (error || !event) {
    return (
      <section>
        {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : (
          <Alert variant="warning">Sự kiện không tồn tại hoặc đã được xóa.</Alert>
        )}
        <Button as={Link} to="/events" variant="outline-secondary">Quay lại danh sách</Button>
      </section>
    );
  }

  return (
    <section>
      <Button as={Link} to="/events" variant="link" className="text-decoration-none px-0 mb-3">
        <span aria-hidden="true">← </span>Quay lại danh sách
      </Button>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
            <div className="position-relative">
              <div className="ratio ratio-16x9">
                <EventImage
                  src={event.image} alt={event.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <Badge bg="primary" className="position-absolute top-0 start-0 m-3 rounded-pill px-3 py-2">
                {event.category}
              </Badge>
            </div>
            <Card.Body className="p-4 p-xl-5">
              <p className="section-eyebrow small fw-bold text-primary text-uppercase mb-2">Trải nghiệm cùng EventHub</p>
              <h1 className="h2 fw-bold mb-4">{event.title}</h1>
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2">
                  {event.category}
                </span>
                <span className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2">
                  {formatPrice(event.price)}
                </span>
                <span className="badge rounded-pill bg-body-secondary text-body-secondary px-3 py-2">
                  {event.capacity} người
                </span>
              </div>
              <div className="border-top pt-4">
                <h2 className="h5 fw-bold mb-3">Giới thiệu sự kiện</h2>
                <Card.Text className="text-body-secondary text-break mb-0">
                  {event.description}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="info-panel border-0 rounded-4 shadow-sm overflow-hidden">
            <Card.Header className="bg-primary bg-gradient text-white border-0 p-4">
              <div className="small text-uppercase text-white text-opacity-75 mb-1">Thông tin sự kiện</div>
              <div className="h3 fw-bold mb-0">{formatPrice(event.price)}</div>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="p-4">
                <div className="small fw-semibold text-body-secondary mb-2">THỜI GIAN</div>
                <time dateTime={event.startAt}>{formatDate(event.startAt, true)}</time>
              </ListGroup.Item>
              <ListGroup.Item className="px-4 py-3">
                <div className="small fw-semibold text-body-secondary mb-1">ĐỊA ĐIỂM</div>
                <div>{event.location}</div>
              </ListGroup.Item>
              <ListGroup.Item className="px-4 py-3">
                <div className="small fw-semibold text-body-secondary mb-1">SỨC CHỨA</div>
                <div>{event.capacity} người</div>
              </ListGroup.Item>
            </ListGroup>

            <Card.Body className="border-top p-4">
              {!event.id ? (
                <Alert variant="warning" className="mb-0">
                  Sự kiện chưa có mã để đăng ký. Vui lòng thử lại sau.
                </Alert>
              ) : user?.role === "admin" ? (
                <div className="bg-primary-subtle rounded-4 p-3">
                  <h2 className="h5 fw-bold text-primary-emphasis">Góc quản trị</h2>
                  <p className="small text-body-secondary">
                    Bạn đang xem thông tin với vai trò quản trị viên.
                    Việc đăng ký tham gia dành cho tài khoản người dùng.
                  </p>
                  <Button as={Link} to="/admin/events" className="w-100 rounded-3">
                    Đến trang quản lý
                  </Button>
                </div>
              ) : user?.role === "user" ? (
                <BookingForm key={user.id + ":" + event.id} event={event} />
              ) : (
                <div className="text-center">
                  <h2 className="h5 fw-bold">Sẵn sàng tham gia?</h2>
                  <p className="small text-body-secondary">
                    Đăng nhập để đăng ký và lưu vé cho sự kiện này.
                  </p>
                  <Button
                    as={Link} to="/login" className="w-100 rounded-3"
                    state={{ from: "/events/" + event.id }}
                  >
                    Đăng nhập để đăng ký
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
