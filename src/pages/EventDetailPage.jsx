import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { getEventById } from "../services/eventService";

export default function EventDetailPage() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getEventById(id, controller.signal);
        setEvent(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(
            "Không tải được thông tin sự kiện. Bạn hãy thử tải lại trang.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Đang tải thông tin sự kiện...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <section>
        <Alert variant={error ? "danger" : "warning"}>
          {error || "Sự kiện không tồn tại hoặc đã được xóa."}
        </Alert>

        <Button as={Link} to="/events" variant="outline-secondary">
          Quay lại danh sách
        </Button>
      </section>
    );
  }

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(event.startAt));

  const formattedPrice =
    event.price === 0
      ? "Miễn phí"
      : new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(event.price);

  return (
    <section>
      <Button
        as={Link}
        to="/events"
        variant="outline-secondary"
        className="mb-4"
      >
        Quay lại danh sách
      </Button>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="ratio ratio-16x9">
              <Card.Img
                variant="top"
                src={event.image}
                alt={event.title}
                className="w-100 h-100 object-fit-cover"
              />
            </div>

            <Card.Body className="p-4">
              <Badge bg="primary" className="mb-3">
                {event.category}
              </Badge>

              <h1 className="h2 mb-4">{event.title}</h1>

              <h2 className="h5">Giới thiệu sự kiện</h2>

              <Card.Text className="text-body-secondary text-break">
                {event.description}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-bold py-3">
              Thông tin sự kiện
            </Card.Header>

            <ListGroup variant="flush">
              <ListGroup.Item className="py-3">
                <div className="small text-body-secondary mb-1">Thời gian</div>
                <time dateTime={event.startAt}>{formattedDate}</time>
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
                <div className="fs-4 fw-bold text-primary">
                  {formattedPrice}
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
