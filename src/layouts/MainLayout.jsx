import { Link, NavLink, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            EventHub
          </Link>
          <nav className="Navigation" aria-label="Điều hướng chính">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Sự kiện
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          © {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
