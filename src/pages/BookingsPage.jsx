import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Modal, Spinner, Table } from "react-bootstrap";
import { cancelBooking, getBookings } from "../services/bookingService";

const statusLabels = {
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

export default function BookingsPage() {
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
    if (!selectedBooking || isCancelling) {
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
      <h1 className="h2 mb-2">Danh sách đăng ký</h1>

      <p className="text-body-secondary mb-4">
        Tổng cộng {bookings.length} lượt đăng ký.
      </p>

      {bookings.length === 0 ? (
        <Alert variant="info">
          Chưa có đăng ký nào. <Link to="/events">Khám phá sự kiện</Link>
        </Alert>
      ) : (
        <Table responsive striped hover className="align-middle bg-body">
          <thead>
            <tr>
              <th scope="col">Mã</th>
              <th scope="col">Sự kiện</th>
              <th scope="col">Người đăng ký</th>
              <th scope="col">Số vé</th>
              <th scope="col">Tổng tiền</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((item, index) => (
              <tr key={item.id || "missing-" + index}>
                <td>{item.id || "Thiếu mã"}</td>

                <td>
                  <Link to={`/events/${item.eventId}`}>{item.eventTitle}</Link>
                </td>

                <td>
                  <div>{item.fullName}</div>
                  <div className="small text-body-secondary">{item.email}</div>
                </td>

                <td>{item.quantity}</td>

                <td>{currencyFormatter.format(item.totalPrice)}</td>

                <td>
                  <Badge
                    bg={item.status === "confirmed" ? "success" : "secondary"}
                  >
                    {statusLabels[item.status] || "Chưa xác định"}
                  </Badge>
                </td>

                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={!item.id || item.status !== "confirmed"}
                    onClick={() => handleOpenCancel(item)}
                  >
                    Hủy đăng ký
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
          <Modal.Header closeButton={!isCancelling} closeLabel="Đóng">
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

