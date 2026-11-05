import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    setExpanded(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="site-shell d-flex flex-column min-vh-100 bg-body-tertiary">
      <a className="visually-hidden-focusable p-2" href="#main-content">
        Đến nội dung chính
      </a>

      <Navbar
        expand="xl" collapseOnSelect className="site-navbar py-3"
        expanded={expanded} onToggle={setExpanded}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
            <span className="brand-mark" aria-hidden="true">E</span>
            EventHub
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" aria-expanded={expanded} label="Mở hoặc đóng menu" />
          <Navbar.Collapse id="main-navbar">
            <Nav navbar={false} variant="pills" className="ms-auto flex-column flex-xl-row align-items-xl-center gap-1">
              <Nav.Link className="px-3 rounded-3" as={NavLink} to="/" end eventKey="/">Trang chủ</Nav.Link>
              <Nav.Link className="px-3 rounded-3" as={NavLink} to="/events" eventKey="/events">Sự kiện</Nav.Link>
              {user && (
                <Nav.Link className="px-3 rounded-3" as={NavLink} to="/bookings" eventKey="/bookings">
                  {user.role === "admin" ? "Danh sách đăng ký" : "Vé của tôi"}
                </Nav.Link>
              )}
              {user?.role === "admin" && (
                <Nav.Link className="px-3 rounded-3" as={NavLink} to="/admin/events" eventKey="/admin/events">
                  Quản lý sự kiện
                </Nav.Link>
              )}
            </Nav>

            <div className="d-flex align-items-center gap-2 ms-xl-3 mt-3 mt-xl-0">
              <Button
                variant="outline-secondary" size="sm" onClick={toggleTheme}
                aria-label={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
              >
                {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
              </Button>

              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="primary" size="sm" className="rounded-pill px-3" id="account-menu">
                    {user.role === "admin" ? "Admin" : "Tài khoản"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>{user.name}</Dropdown.Header>
                    <Dropdown.ItemText className="small text-body-secondary">
                      {user.email}
                    </Dropdown.ItemText>
                    <Dropdown.ItemText className="small">
                      Vai trò: {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  as={Link} to="/login" size="sm" className="rounded-pill px-3"
                  state={{ from: location.pathname + location.search + location.hash }}
                  onClick={() => setExpanded(false)}
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="main-content" className="flex-grow-1 py-4 py-md-5" tabIndex={-1}>
        <Container><Outlet /></Container>
      </main>

      <footer className="site-footer border-top bg-body py-4">
        <Container className="d-flex flex-wrap justify-content-between gap-2 small text-body-secondary">
          <span>© {new Date().getFullYear()} EventHub</span>
          <span>Khám phá sự kiện, kết nối đam mê.</span>
        </Container>
      </footer>
    </div>
  );
}
