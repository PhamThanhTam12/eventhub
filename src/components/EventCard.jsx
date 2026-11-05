import { Badge, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import EventImage from "./EventImage";
import { formatDate, formatPrice } from "../utils/formatters";

export default function EventCard({ event }) {
  return (
    <Card as="article" className="h-100 border-0 rounded-4 shadow-sm overflow-hidden">
      <div className="position-relative">
        <div className="ratio ratio-16x9">
          <EventImage
            src={event.image} alt={event.title}
            loading="lazy" className="w-100 h-100 object-fit-cover"
          />
        </div>
        <Badge bg="primary" className="position-absolute top-0 start-0 m-3 rounded-pill px-3 py-2">
          {event.category}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column p-4">
        <div className="small fw-semibold text-primary mb-2">
          <time dateTime={event.startAt}>{formatDate(event.startAt)}</time>
        </div>
        <Card.Title as="h2" className="h5 fw-bold mb-3 text-break">
          {event.title}
        </Card.Title>
        <Card.Text className="small text-body-secondary mb-4">
          <span className="fw-semibold">Địa điểm:</span> {event.location}
        </Card.Text>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 border-top pt-3 mt-auto">
          <div>
            <div className="small text-body-secondary">Giá vé</div>
            <div className={"fs-5 fw-bold " + (Number(event.price) === 0 ? "text-success" : "text-primary")}>
              {formatPrice(event.price)}
            </div>
          </div>
          {event.id && (
            <Button as={Link} to={"/events/" + event.id} variant="outline-primary" className="rounded-pill px-3">
              Xem chi tiết <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
