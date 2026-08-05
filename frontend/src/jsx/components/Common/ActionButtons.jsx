import { Link } from "react-router-dom";

const btnClass = "btn btn-xs sharp";

export const ViewAction = ({ to, title = "View", onClick }) =>
  to ? (
    <Link to={to} className={`${btnClass} btn-info me-1`} title={title}>
      <i className="fa fa-eye" />
    </Link>
  ) : (
    <button
      type="button"
      className={`${btnClass} btn-info me-1`}
      title={title}
      onClick={onClick}
    >
      <i className="fa fa-eye" />
    </button>
  );

export const AddAction = ({ onClick, title = "Add" }) => (
  <button
    type="button"
    className={`${btnClass} btn-primary me-1`}
    title={title}
    onClick={onClick}
  >
    <i className="fa fa-plus" />
  </button>
);

export const EditAction = ({ to, onClick, title = "Edit" }) =>
  to ? (
    <Link to={to} className={`${btnClass} btn-warning me-1`} title={title}>
      <i className="fa fa-pencil" />
    </Link>
  ) : (
    <button
      type="button"
      className={`${btnClass} btn-warning me-1`}
      title={title}
      onClick={onClick}
    >
      <i className="fa fa-pencil" />
    </button>
  );

export const ExportAction = ({ onClick, title = "Export" }) => (
  <button
    type="button"
    className={`${btnClass} btn-success me-1`}
    title={title}
    onClick={onClick}
  >
    <i className="fa fa-file-excel" />
  </button>
);

export const DeleteAction = ({ onClick, title = "Delete", disabled }) => (
  <button
    type="button"
    className={`${btnClass} btn-danger me-1`}
    title={title}
    onClick={onClick}
    disabled={disabled}
  >
    <i className="fa fa-trash" />
  </button>
);
