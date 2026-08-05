import { Spinner } from "react-bootstrap";

export const PageLoader = ({ message = "Loading..." }) => (
  <div className="klk-page-loader text-center py-5">
    <Spinner animation="border" variant="primary" role="status" />
    <p className="text-muted mt-3 mb-0">{message}</p>
  </div>
);

export const InlineLoader = ({ message = "Loading..." }) => (
  <span className="text-muted small">
    <Spinner animation="border" size="sm" className="me-2" />
    {message}
  </span>
);

export const EmptyState = ({ message = "No records found", action }) => (
  <div className="klk-empty-state text-center py-5">
    <i className="fa fa-inbox fa-2x text-muted mb-3 d-block" />
    <p className="text-muted mb-0">{message}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export const ErrorState = ({ message = "Failed to load data", onRetry }) => (
  <div className="klk-error-state text-center py-5">
    <i className="fa fa-exclamation-circle fa-2x text-danger mb-3 d-block" />
    <p className="text-muted mb-3">{message}</p>
    {onRetry && (
      <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
        <i className="fa fa-refresh me-1" /> Retry
      </button>
    )}
  </div>
);
