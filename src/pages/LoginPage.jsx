import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { getLoginDestination } from "../utils/auth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().trim().required("Vui lòng nhập email.")
        .email("Email không hợp lệ."),
      password: Yup.string().required("Vui lòng nhập mật khẩu."),
    }),
    onSubmit: async (values) => {
      setSubmitError("");

      try {
        const sessionUser = login(values.email, values.password);
        navigate(getLoginDestination(location.state?.from, sessionUser), { replace: true });
      } catch (error) {
        setSubmitError(error.message);
      }
    },
  });

  if (user) {
    return <Navigate to={getLoginDestination(location.state?.from, user)} replace />;
  }

  return (
    <Row className="justify-content-center">
      <Col xl={11}>
        <Row className="g-0 rounded-4 overflow-hidden shadow-sm">
          <Col lg={6} className="d-none d-lg-block">
            <div className="h-100 bg-primary bg-gradient text-white p-4 p-xl-5">
              <Badge bg="light" text="primary" className="rounded-pill px-3 py-2 mb-4">
                EVENTHUB
              </Badge>
              <h2 className="display-6 fw-bold mb-4">
                Gặp gỡ.<br />Học hỏi.<br />Kết nối.
              </h2>
              <p className="text-white text-opacity-75 mb-4">
                Những trải nghiệm mới bắt đầu từ một sự kiện phù hợp với bạn.
              </p>
              <div className="d-flex align-items-start gap-3 mb-3">
                <span className="bg-white bg-opacity-25 rounded-circle px-2 py-1" aria-hidden="true">✓</span>
                <div>
                  <div className="fw-semibold">Khám phá điều bạn thích</div>
                  <div className="small text-white text-opacity-75">Workshop, âm nhạc và nhiều hoạt động sinh viên.</div>
                </div>
              </div>
              <div className="d-flex align-items-start gap-3 mb-4">
                <span className="bg-white bg-opacity-25 rounded-circle px-2 py-1" aria-hidden="true">✓</span>
                <div>
                  <div className="fw-semibold">Giữ mọi đăng ký trong tầm tay</div>
                  <div className="small text-white text-opacity-75">Dễ dàng theo dõi những sự kiện sắp tham gia.</div>
                </div>
              </div>
              <Button as={Link} to="/events" variant="outline-light" className="rounded-pill px-4">
                Khám phá sự kiện <span aria-hidden="true">→</span>
              </Button>
            </div>
          </Col>
          <Col lg={6} className="bg-body">
            <Card className="h-100 border-0 rounded-0">
              <Card.Body className="d-flex flex-column justify-content-center p-4 p-xl-5">
                <p className="small fw-bold text-primary text-uppercase mb-2">Chào mừng trở lại</p>
                <h1 className="h2 fw-bold mb-3">Đăng nhập</h1>
                <p className="text-body-secondary mb-4">
                  Tiếp tục hành trình khám phá và theo dõi đăng ký của bạn.
                </p>

                {submitError && <Alert variant="danger" className="rounded-3">{submitError}</Alert>}

                <Form noValidate onSubmit={formik.handleSubmit}>
                  <fieldset disabled={formik.isSubmitting}>
                    <FormField
                      formik={formik} name="email" label="Email" type="email"
                      autoComplete="username" placeholder="Nhập email của bạn"
                    />
                    <FormField
                      formik={formik} name="password" label="Mật khẩu" type="password"
                      autoComplete="current-password" placeholder="Nhập mật khẩu"
                    />
                    <Button type="submit" size="lg" className="w-100 rounded-3 mt-2">
                      {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                  </fieldset>
                </Form>
                <p className="small text-body-secondary text-center mt-4 mb-0">
                  Một tài khoản, nhiều trải nghiệm đáng nhớ.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
