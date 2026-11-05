import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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
      <Col md={8} lg={6} xl={5}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <Badge bg="secondary" className="mb-3">Bản demo</Badge>
            <h1 className="h2 mb-2">Đăng nhập</h1>
            <p className="text-body-secondary mb-4">
              Đăng nhập để đặt vé và theo dõi đăng ký của bạn.
            </p>

            {submitError && <Alert variant="danger">{submitError}</Alert>}

            <Form noValidate onSubmit={formik.handleSubmit}>
              <fieldset disabled={formik.isSubmitting}>
                <FormField
                  formik={formik} name="email" label="Email" type="email"
                  autoComplete="username" placeholder="Email tài khoản"
                />
                <FormField
                  formik={formik} name="password" label="Mật khẩu" type="password"
                  autoComplete="current-password"
                />
                <Button type="submit" className="w-100">
                  {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </fieldset>
            </Form>
            <p className="small text-body-secondary mt-3 mb-0">
              Sử dụng tài khoản demo được cung cấp trong README của project.
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
