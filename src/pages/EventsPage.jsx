import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { getEvents } from "../services/eventService";
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
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

  const categories = [...new Set(events.map((item) => item.category))];

  const filteredEvents = events.filter((item) => {
    const matchesKeyword = item.title
      .toLowerCase()
      .includes(keyword.trim().toLowerCase());

    const matchesCategory = category === "all" || item.category === category;

    const matchesPrice =
      priceType === "all" ||
      (priceType === "free" && item.price === 0) ||
      (priceType === "paid" && item.price > 0);

    return matchesKeyword && matchesCategory && matchesPrice;
  });

  function handleResetFilters() {
    setKeyword("");
    setCategory("all");
    setPriceType("all");
  }
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
      <Form role="search" className="mb-4" onSubmit={(e) => e.preventDefault()}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="event-keyword">
              <Form.Label>Tìm sự kiện</Form.Label>

              <Form.Control
                type="search"
                placeholder="Nhập tên sự kiện..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="event-category">
              <Form.Label>Chủ đề</Form.Label>

              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">Tất cả chủ đề</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="event-price">
              <Form.Label>Giá vé</Form.Label>

              <Form.Select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
              >
                <option value="all">Tất cả mức giá</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <span className="text-body-secondary">
            {filteredEvents.length} / {events.length} sự kiện
          </span>

          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleResetFilters}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Form>
      {filteredEvents.length === 0 ? (
        <Alert variant="info" role="status">
          {events.length === 0
            ? "Chưa có sự kiện nào."
            : "Không tìm thấy sự kiện phù hợp."}
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredEvents.map((item) => (
            <Col key={item.id}>
              <EventCard event={item} />
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}
