import { Link } from "react-router-dom";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";

export default function HomePage() {
  return (
    <Card className="border-0 bg-primary text-white shadow-sm">
      <Card.Body className="p-4 p-md-5">
        <Row>
          <Col lg={9}>
            <Badge bg="light" text="primary" className="mb-3">
              Sự kiện dành cho sinh viên
            </Badge>

            <h1 className="display-5 fw-bold mb-4">
              Khám phá sự kiện, kết nối đam mê.
            </h1>

            <p className="lead mb-4">
              Tìm kiếm workshop, hoạt động câu lạc bộ và những trải nghiệm phù
              hợp với bạn.
            </p>

            <Button as={Link} to="/events" variant="light" size="lg">
              Khám phá sự kiện
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
