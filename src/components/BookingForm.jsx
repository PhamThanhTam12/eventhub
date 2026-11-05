import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Form } from "react-bootstrap";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";

export default function BookingForm({ event }) {
  const { user } = useAuth();
  const [savedBooking, setSavedBooking] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      quantity: 1,
    },

    validationSchema: Yup.object({
      fullName: Yup.string()
        .trim()
        .required("Vui lòng nhập họ tên.")
        .min(2, "Họ tên cần ít nhất 2 ký tự.")
        .max(100, "Họ tên tối đa 100 ký tự."),

      email: Yup.string()
        .trim()
        .required("Vui lòng nhập email.")
        .email("Email không hợp lệ."),

      phone: Yup.string()
        .trim()
        .required("Vui lòng nhập số điện thoại.")
        .matches(/^0\d{9}$/, "Nhập 10 chữ số, bắt đầu bằng số 0."),

      quantity: Yup.number()
        .typeError("Số vé phải là số.")
        .required("Vui lòng nhập số vé.")
        .integer("Số vé phải là số nguyên.")
        .min(1, "Cần đăng ký ít nhất 1 vé.")
        .max(event.capacity, `Tối đa ${event.capacity} vé.`),
    }),

    onSubmit: async (values) => {
      setSubmitError("");
      if (!user) {
        setSubmitError("Vui lòng đăng nhập trước khi đăng ký.");
        return;
      }

      try {
        const quantity = Number(values.quantity);

        const data = await createBooking({
          eventId: event.id,
          eventTitle: event.title,
          fullName: values.fullName.trim(),
          email: user.email,
          phone: values.phone.trim(),
          quantity,
          unitPrice: event.price,
          totalPrice: event.price * quantity,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        });

        if (!data?.id) {
          throw new Error("MockAPI chưa trả mã đăng ký. Hãy kiểm tra trường id kiểu Object ID.");
        }
        setSavedBooking(data);
      } catch (error) {
        console.error("Lỗi đăng ký vé:", error);
        setSubmitError("Đăng ký chưa thành công. Bạn hãy thử lại.");
      }
    },
  });

  if (savedBooking) {
    return (
      <Alert variant="success" className="mb-0">
        <h2 className="h5">Đăng ký thành công!</h2>

        <p className="mb-1">
          Mã đăng ký: <strong>{savedBooking.id}</strong>
        </p>

        <p className="mb-0">
          {savedBooking.quantity} vé — {savedBooking.eventTitle}
        </p>

        <Button as={Link} to="/bookings" variant="success" size="sm" className="mt-3 me-2">
          Xem đăng ký
        </Button>

        <Button
          type="button"
          variant="outline-success"
          size="sm"
          className="mt-3"
          onClick={() => {
            formik.resetForm();
            setSubmitError("");
            setSavedBooking(null);
          }}
        >
          Đăng ký thêm
        </Button>
      </Alert>
    );
  }

  const totalPrice =
    event.price * Math.max(0, Number(formik.values.quantity) || 0);

  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalPrice);

  return (
    <section>
      <h2 className="h5 mb-3">Đăng ký tham gia</h2>

      {submitError && <Alert variant="danger">{submitError}</Alert>}

      <Form noValidate onSubmit={formik.handleSubmit}>
        <fieldset disabled={formik.isSubmitting}>
          <Form.Group controlId="booking-fullName" className="mb-3">
            <Form.Label>Họ và tên</Form.Label>

            <Form.Control
              type="text"
              autoComplete="name"
              {...formik.getFieldProps("fullName")}
              isInvalid={
                formik.touched.fullName && Boolean(formik.errors.fullName)
              }
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.fullName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="booking-email" className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              autoComplete="email"
              readOnly
              {...formik.getFieldProps("email")}
              isInvalid={formik.touched.email && Boolean(formik.errors.email)}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.email}
            </Form.Control.Feedback>
            <Form.Text>Email lấy từ tài khoản đang đăng nhập.</Form.Text>
          </Form.Group>

          <Form.Group controlId="booking-phone" className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>

            <Form.Control
              type="tel"
              autoComplete="tel"
              {...formik.getFieldProps("phone")}
              isInvalid={formik.touched.phone && Boolean(formik.errors.phone)}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.phone}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="booking-quantity" className="mb-3">
            <Form.Label>Số lượng vé</Form.Label>

            <Form.Control
              type="number"
              min={1}
              max={event.capacity}
              step={1}
              {...formik.getFieldProps("quantity")}
              isInvalid={
                formik.touched.quantity && Boolean(formik.errors.quantity)
              }
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.quantity}
            </Form.Control.Feedback>

            <Form.Text>
              Tối đa {event.capacity} vé cho mỗi lần đăng ký.
            </Form.Text>
          </Form.Group>

          <p className="fw-bold text-primary fs-5">
            Tổng tiền: {formattedTotal}
          </p>

          <Button type="submit" className="w-100">
            {formik.isSubmitting ? "Đang đăng ký..." : "Xác nhận đăng ký"}
          </Button>
        </fieldset>
      </Form>
    </section>
  );
}

