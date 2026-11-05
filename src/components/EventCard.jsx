import { Badge, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    <Card className="h-100 border-0 shadow-sm overflow-hidden">
      <div className="ratio ratio-16x9">
        <Card.Img
          variant="top"
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="w-100 h-100 object-fit-cover"
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Badge bg="primary" className="align-self-start">
          {event.category}
        </Badge>

        <Card.Title as="h2" className="h5 mt-3 mb-3 text-break">
          {event.title}
        </Card.Title>

        <Card.Text className="small text-body-secondary mb-2">
          <strong>Thời gian:</strong>{" "}
          <time dateTime={event.startAt}>{formattedDate}</time>
        </Card.Text>

        <Card.Text className="small text-body-secondary mb-2">
          <strong>Địa điểm:</strong> {event.location}
        </Card.Text>

        <Card.Text className="fs-5 fw-bold text-primary mt-auto pt-3 mb-0">
          {formattedPrice}
        </Card.Text>
        <Button
          as={Link}
          to={`/events/${event.id}`}
          variant="primary"
          className="mt-3"
        >
          Xem chi tiết
        </Button>
      </Card.Body>
    </Card>
  );
}
