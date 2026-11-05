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
      <Button as={Link} to="/events" variant="outline-secondary" className="mb-4">
        Quay lại danh sách
      </Button>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="ratio ratio-16x9">
              <EventImage
                src={event.image} alt={event.title}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <Card.Body className="p-4">
              <Badge bg="primary" className="mb-3">{event.category}</Badge>
              <h1 className="h2 mb-4">{event.title}</h1>
              <h2 className="h5">Giới thiệu sự kiện</h2>
              <Card.Text className="text-body-secondary text-break">{event.description}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-body fw-bold py-3">Thông tin sự kiện</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="py-3">
                <div className="small text-body-secondary mb-1">Thời gian</div>
                <time dateTime={event.startAt}>{formatDate(event.startAt, true)}</time>
              </ListGroup.Item>
              <ListGroup.Item className="py-3">
                <div className="small text-body-secondary mb-1">Địa điểm</div>
                <div>{event.location}</div>
              </ListGroup.Item>
              <ListGroup.Item className="py-3">
                <div className="small text-body-secondary mb-1">Sức chứa</div>
                <div>{event.capacity} người</div>
              </ListGroup.Item>
              <ListGroup.Item className="py-3">
                <div className="small text-body-secondary mb-1">Giá vé</div>
                <div className="fs-4 fw-bold text-primary">{formatPrice(event.price)}</div>
              </ListGroup.Item>
            </ListGroup>
            <Card.Body className="border-top">
              {!event.id ? (
                <Alert variant="warning" className="mb-0">
                  Sự kiện chưa có mã để đăng ký. Vui lòng thử lại sau.
                </Alert>
              ) : user ? (
                <BookingForm key={user.id + ":" + event.id} event={event} />
              ) : (
                <div>
                  <p className="text-body-secondary">Đăng nhập để đăng ký tham gia sự kiện này.</p>
                  <Button
                    as={Link} to="/login" className="w-100"
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
