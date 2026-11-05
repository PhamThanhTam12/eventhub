import { Link, NavLink, Outlet } from "react-router-dom";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import useTheme from "../hooks/useTheme";

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <a className="visually-hidden-focusable p-2" href="#main-content">
        Đến nội dung chính
      </a>

      <Navbar expand="lg" bg="body" collapseOnSelect className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
            EventHub
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" label="Mở hoặc đóng menu" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto align-items-lg-center gap-lg-1">
              <Nav.Link as={NavLink} to="/" end eventKey="/">Trang chủ</Nav.Link>
              <Nav.Link as={NavLink} to="/events" eventKey="/events">Sự kiện</Nav.Link>
              <Nav.Link as={NavLink} to="/bookings" eventKey="/bookings">
                Danh sách đăng ký
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/events" eventKey="/admin/events">
                Quản lý sự kiện
              </Nav.Link>
            </Nav>
            <Button
              variant="outline-secondary" size="sm"
              className="ms-lg-3 my-2 my-lg-0"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
            >
              {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="main-content" className="flex-grow-1 py-4 py-md-5" tabIndex={-1}>
        <Container><Outlet /></Container>
      </main>

      <footer className="border-top bg-body py-4">
        <Container className="d-flex flex-wrap justify-content-between gap-2 small text-body-secondary">
          <span>© {new Date().getFullYear()} EventHub</span>
          <span>Khám phá sự kiện, kết nối đam mê.</span>
        </Container>
      </footer>
    </div>
  );
}
