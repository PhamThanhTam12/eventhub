import { Link, Route, Routes } from "react-router-dom";
import { Button } from "react-bootstrap";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import BookingsPage from "./pages/BookingsPage";
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route
          path="*"
          element={
            <section className="text-center py-5">
              <h1 className="mb-4">Không tìm thấy trang</h1>

              <Button as={Link} to="/" variant="primary">
                Về trang chủ
              </Button>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
