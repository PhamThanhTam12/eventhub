import { Alert, Button } from "react-bootstrap";

export default function ErrorState({ message, onRetry }) {
  return (
    <Alert variant="danger">
      <p className={onRetry ? "mb-3" : "mb-0"}>{message}</p>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </Alert>
  );
}
