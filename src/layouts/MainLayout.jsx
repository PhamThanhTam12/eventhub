import { Link, NavLink, Outlet } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";

export default function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar expand="md" bg="white" collapseOnSelect className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
            EventHub
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="main-navbar"
            aria-label="Mở hoặc đóng menu"
          />

          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end eventKey="/">
                Trang chủ
              </Nav.Link>

              <Nav.Link as={NavLink} to="/events" eventKey="/events">
                Sự kiện
              </Nav.Link>
              <Nav.Link as={NavLink} to="/bookings" eventKey="/bookings">
                Danh sách đăng ký
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-4 py-md-5">
        <Container>
          <Outlet />
        </Container>
      </main>

      <footer className="border-top bg-white py-3">
        <Container className="text-center text-body-secondary">
          © {new Date().getFullYear()} EventHub
        </Container>
      </footer>
    </div>
  );
}
