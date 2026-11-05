import { Badge, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import EventImage from "./EventImage";
import { formatDate, formatPrice } from "../utils/formatters";

export default function EventCard({ event }) {
  return (
    <Card as="article" className="h-100 border-0 shadow-sm overflow-hidden">
      <div className="ratio ratio-16x9">
        <EventImage
          src={event.image} alt={event.title}
          loading="lazy" className="w-100 h-100 object-fit-cover"
        />
      </div>
      <Card.Body className="d-flex flex-column p-4">
        <Badge bg="primary" className="align-self-start">{event.category}</Badge>
        <Card.Title as="h2" className="h5 mt-3 mb-3 text-break">{event.title}</Card.Title>
        <Card.Text className="small text-body-secondary mb-2">
          <strong>Thời gian:</strong>{" "}
          <time dateTime={event.startAt}>{formatDate(event.startAt)}</time>
        </Card.Text>
        <Card.Text className="small text-body-secondary mb-2">
          <strong>Địa điểm:</strong> {event.location}
        </Card.Text>
        <Card.Text className="fs-5 fw-bold text-primary mt-auto pt-3 mb-0">
          {formatPrice(event.price)}
        </Card.Text>
        {event.id && (
          <Button as={Link} to={"/events/" + event.id} className="mt-3">
            Xem chi tiết
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
