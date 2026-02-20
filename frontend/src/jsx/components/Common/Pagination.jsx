import { Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const CommonPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  size = "sm",
  gutter = true,
  variant = "",
  bg = true,
  circle = true,
}) => {

  let items = [];

  const pageLimit = 2; 
  const startPage = Math.max(1, currentPage - pageLimit);
  const endPage = Math.min(totalPages, currentPage + pageLimit);

  // First Page
  if (startPage > 1) {
    items.push(
      <Pagination.Item
        key={1}
        active={1 === currentPage}
        onClick={() => onPageChange(1)}
      >
        1
      </Pagination.Item>
    );

    if (startPage > 2) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }
  }

  // Middle Pages
  for (let number = startPage; number <= endPage; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => onPageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // Last Page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    items.push(
      <Pagination.Item
        key={totalPages}
        active={totalPages === currentPage}
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );
  }

  return (
    <Pagination
      size={size}
      className={`mt-3 justify-content-end flex-wrap
        ${gutter ? "pagination-gutter" : ""} 
        ${variant && `pagination-${variant}`} 
        ${!bg && "no-bg"} 
        ${circle && "pagination-circle"}
      `}
    >

      {/* Prev */}
      <li className="page-item page-indicator">
        <Link
          className={`page-link ${currentPage === 1 ? "disabled" : ""}`}
          to="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) onPageChange(currentPage - 1);
          }}
        >
          <i className="la la-angle-left" />
        </Link>
      </li>

      {items}

      {/* Next */}
      <li className="page-item page-indicator">
        <Link
          className={`page-link ${currentPage === totalPages ? "disabled" : ""}`}
          to="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) onPageChange(currentPage + 1);
          }}
        >
          <i className="la la-angle-right" />
        </Link>
      </li>

    </Pagination>
  );
};

CommonPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  size: PropTypes.string,
  gutter: PropTypes.bool,
  variant: PropTypes.string,
  bg: PropTypes.bool,
  circle: PropTypes.bool,
};

export default CommonPagination;