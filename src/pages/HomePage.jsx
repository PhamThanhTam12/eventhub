import { Link } from "react-router-dom";
export default function HomePage() {
  return (
    <section className="hero">
      <p className="hero-label">Sự kiện dành cho sinh viên</p>
      <h1>Khám phá sự kiện, kết nối đam mê</h1>
      <p className="hero-description">
        Tìm kiếm workshop, hoạt động câu lạc bộ và những trải nghiệm phù hợp với
        bạn.
      </p>
      <Link to="/events" className="button">
        Khám phá sự kiện
      </Link>
    </section>
  );
}
