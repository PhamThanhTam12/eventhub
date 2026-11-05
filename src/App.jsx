import { Link, Route, Routes } from "react-router-dom";
import { Button } from "react-bootstrap";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import BookingsPage from "./pages/BookingsPage";
import ManageEventsPage from "./pages/ManageEventsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/admin/events" element={<ManageEventsPage />} />
        <Route
          path="*"
          element={
            <section className="text-center py-5">
              <p className="text-primary fw-bold">404</p>
              <h1 className="h2 mb-3">Không tìm thấy trang</h1>
              <p className="text-body-secondary mb-4">Đường dẫn này không có trên EventHub.</p>
              <Button as={Link} to="/">Về trang chủ</Button>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
