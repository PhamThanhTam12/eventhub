import { Link, Navigate, useLocation } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";
import useAuth from "../hooks/useAuth";

export default function RequireAuth({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login" replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  }

  if (role && user.role !== role) {
    return (
      <section>
        <Alert variant="warning">
          <h1 className="h4">Không có quyền truy cập</h1>
          <p className="mb-0">Trang này chỉ dành cho quản trị viên.</p>
        </Alert>
        <Button as={Link} to="/events">Khám phá sự kiện</Button>
      </section>
    );
  }

  return children;
}
