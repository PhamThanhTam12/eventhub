import { Spinner } from "react-bootstrap";

export default function LoadingState({ children = "Đang tải dữ liệu..." }) {
  return (
    <div className="d-flex align-items-center gap-2 py-3" role="status">
      <Spinner animation="border" size="sm" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
