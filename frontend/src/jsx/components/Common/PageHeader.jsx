import { Link } from "react-router-dom";

/**
 * @param {{ title?: string, subtitle?: string, breadcrumbs?: { label: string, to?: string }[], action?: React.ReactNode }} props
 */
const PageHeader = ({ title, subtitle, breadcrumbs = [], action }) => {
  return (
    <div className="row page-titles mx-0 w-100 align-items-center klk-page-header g-2">
      <div className="col min-w-0">
        {breadcrumbs.length > 0 && (
          <ol className="breadcrumb mb-1">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li
                  key={`${crumb.label}-${i}`}
                  className={`breadcrumb-item${isLast ? " active" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {title && <h4 className="klk-page-header__title mb-0">{title}</h4>}
        {subtitle && (
          <p className="text-muted mb-0 mt-1 klk-page-header__subtitle">{subtitle}</p>
        )}
      </div>
      {action && <div className="col-auto">{action}</div>}
    </div>
  );
};

export default PageHeader;
