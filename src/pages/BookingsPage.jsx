import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Modal, Row, Spinner, Table } from "react-bootstrap";
import { cancelBooking, getBookings } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { canAccessBooking } from "../utils/auth";

const statusLabels = {
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      try {
        const data = await getBookings(controller.signal);
        setBookings(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Lỗi tải đăng ký:", error);
          setError(
            "Không tải được danh sách đăng ký. Bạn hãy thử tải lại trang.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      controller.abort();
    };
  }, []);

  function handleOpenCancel(booking) {
    setSelectedBooking(booking);
    setCancelError("");
  }

  function handleCloseCancel() {
    if (isCancelling) {
      return;
    }

    setSelectedBooking(null);
    setCancelError("");
  }

  async function handleCancelBooking() {
    if (!selectedBooking || isCancelling || !canAccessBooking(user, selectedBooking)) {
      return;
    }

    setIsCancelling(true);
    setCancelError("");

    try {
      const updatedBooking = await cancelBooking(selectedBooking);

      setBookings((current) =>
        current.map((item) =>
          item.id === updatedBooking.id ? updatedBooking : item,
        ),
      );

      setSelectedBooking(null);
    } catch (error) {
      console.error("Lỗi hủy đăng ký:", error);
      setCancelError("Chưa hủy được đăng ký. Bạn hãy thử lại.");
    } finally {
      setIsCancelling(false);
    }
  }

  const visibleBookings = bookings.filter((booking) => canAccessBooking(user, booking));

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Đang tải danh sách đăng ký...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="small fw-bold text-primary text-uppercase mb-2">
            {user.role === "admin" ? "Góc quản trị" : "Hành trình của bạn"}
          </p>
          <h1 className="h2 fw-bold mb-2">{user.role === "admin" ? "Danh sách đăng ký" : "Vé của tôi"}</h1>
          <p className="text-body-secondary mb-0">Tổng cộng {visibleBookings.length} lượt đăng ký.</p>
        </div>
        <Button as={Link} to={user.role === "admin" ? "/admin/events" : "/events"} className="rounded-pill px-4">
          {user.role === "admin" ? "Quản lý sự kiện" : "Khám phá sự kiện"} <span aria-hidden="true">→</span>
        </Button>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: "Tổng lượt đăng ký", value: visibleBookings.length, color: "primary" },
          { label: "Đăng ký đã xác nhận", value: visibleBookings.filter((item) => item.status === "confirmed").length, color: "success" },
          { label: "Đăng ký đã hủy", value: visibleBookings.filter((item) => item.status === "cancelled").length, color: "secondary" },
        ].map((stat) => (
          <Col sm={4} key={stat.label}>
            <Card className="border-0 rounded-4 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="small text-body-secondary mb-2">{stat.label}</div>
                <div className={"h2 fw-bold mb-0 text-" + stat.color}>{stat.value}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {visibleBookings.length === 0 ? (
        <Alert variant="info">
          Chưa có đăng ký nào. <Link to="/events">Khám phá sự kiện</Link>
        </Alert>
      ) : (
        <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
          <Card.Header className="bg-body border-bottom py-3 px-4 fw-bold">Thông tin đăng ký</Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-nowrap">
                <tr>
                  <th scope="col" className="ps-4 py-3">Mã</th>
                  <th scope="col">Sự kiện</th>
                  <th scope="col">Người đăng ký</th>
                  <th scope="col">Số vé</th>
                  <th scope="col">Tổng tiền</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {visibleBookings.map((item, index) => (
                  <tr key={item.id || "missing-" + index}>
                    <td className="ps-4"><Badge bg="primary-subtle" text="primary-emphasis" className="rounded-pill">{item.id || "Thiếu mã"}</Badge></td>

                    <td>
                      <Link className="fw-semibold text-decoration-none" to={`/events/${item.eventId}`}>{item.eventTitle}</Link>
                    </td>

                    <td>
                      <div>{item.fullName}</div>
                      <div className="small text-body-secondary">{item.email}</div>
                    </td>

                    <td>{item.quantity}</td>

                    <td>{currencyFormatter.format(item.totalPrice)}</td>

                    <td>
                      <Badge
                        className="rounded-pill px-3 py-2"
                        bg={item.status === "confirmed" ? "success" : "secondary"}
                      >
                        {statusLabels[item.status] || "Chưa xác định"}
                      </Badge>
                    </td>

                    <td>
                      <Button
                        variant="outline-danger"
                        className="rounded-pill text-nowrap" size="sm"
                        disabled={!item.id || item.status !== "confirmed" || !canAccessBooking(user, item)}
                        onClick={() => handleOpenCancel(item)}
                      >
                        Hủy đăng ký
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {selectedBooking && (
        <Modal
          show
          centered
          backdrop="static"
          keyboard={!isCancelling}
          onHide={handleCloseCancel}
          aria-labelledby="cancel-booking-title"
        >
          <Modal.Header className="bg-danger-subtle" closeButton={!isCancelling} closeLabel="Đóng">
            <Modal.Title id="cancel-booking-title">Hủy đăng ký vé</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {cancelError && <Alert variant="danger">{cancelError}</Alert>}

            <p>
              Bạn muốn hủy đăng ký tham gia{" "}
              <strong>{selectedBooking.eventTitle}</strong>?
            </p>

            <p className="mb-0 text-body-secondary">
              Mã đăng ký: {selectedBooking.id}
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              disabled={isCancelling}
              onClick={handleCloseCancel}
            >
              Quay lại
            </Button>

            <Button
              variant="danger"
              disabled={isCancelling}
              onClick={handleCancelBooking}
            >
              {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </section>
  );
}

