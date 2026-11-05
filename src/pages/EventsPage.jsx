import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import EventCard from "../components/EventCard";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { getEvents } from "../services/eventService";
import { normalizeText } from "../utils/formatters";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [priceType, setPriceType] = useState("all");

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


  const categories = [...new Set(events.map((event) => event.category).filter(Boolean))];
  const filteredEvents = events.filter((event) => {
    const matchesKeyword = normalizeText(event.title).includes(normalizeText(keyword));
    const matchesCategory = category === "all" || event.category === category;
    const matchesPrice = priceType === "all" ||
      (priceType === "free" && Number(event.price) === 0) ||
      (priceType === "paid" && Number(event.price) > 0);
    return matchesKeyword && matchesCategory && matchesPrice;
  });

  function handleResetFilters() {
    setKeyword("");
    setCategory("all");
    setPriceType("all");
  }

  return (
    <section>
      <h1 className="h2 mb-2">Khám phá sự kiện</h1>
      <p className="text-body-secondary mb-4">Tìm hoạt động phù hợp với sở thích của bạn.</p>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form role="search" onSubmit={(event) => event.preventDefault()}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="event-keyword">
                  <Form.Label>Tìm sự kiện</Form.Label>
                  <Form.Control
                    type="search" placeholder="Nhập tên sự kiện..."
                    value={keyword} onChange={(event) => setKeyword(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="event-category">
                  <Form.Label>Chủ đề</Form.Label>
                  <Form.Select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="all">Tất cả chủ đề</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="event-price">
                  <Form.Label>Giá vé</Form.Label>
                  <Form.Select value={priceType} onChange={(event) => setPriceType(event.target.value)}>
                    <option value="all">Tất cả mức giá</option>
                    <option value="free">Miễn phí</option>
                    <option value="paid">Có phí</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              <span className="text-body-secondary" aria-live="polite">
                {isLoading ? "Đang tải..." : filteredEvents.length + " / " + events.length + " sự kiện"}
              </span>
              <Button type="button" variant="outline-secondary" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {isLoading ? <LoadingState>Đang tải sự kiện...</LoadingState> : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : filteredEvents.length === 0 ? (
        <Alert variant="info" role="status">
          {events.length === 0 ? "Chưa có sự kiện nào." : "Không tìm thấy sự kiện phù hợp."}
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredEvents.map((event, index) => (
            <Col key={event.id || "missing-" + index}><EventCard event={event} /></Col>
          ))}
        </Row>
      )}
    </section>
  );
}
