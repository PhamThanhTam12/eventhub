import { Link, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="*"
          element={
            <section>
              <h1>Không tìm thấy trang</h1>
              <Link to="/" className="button">
                Quay lại trang chủ
              </Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
