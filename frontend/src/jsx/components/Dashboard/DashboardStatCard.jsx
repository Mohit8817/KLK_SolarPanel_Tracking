import { Link } from "react-router-dom";

/**
 * @param {{ label: string, value: number|string, hint?: string, icon?: string, accent?: string, to?: string }} props
 */
const DashboardStatCard = ({ label, value, hint, icon, accent = "teal", to }) => {
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value ?? 0;

  const content = (
    <div className={`klk-metric klk-metric--${accent}`}>
      {icon && (
        <span className="klk-metric__icon">
          <i className={`fa-solid ${icon}`} aria-hidden="true" />
        </span>
      )}
      <div className="klk-metric__body">
        <span className="klk-metric__value">{displayValue}</span>
        <span className="klk-metric__label">{label}</span>
        {hint && <span className="klk-metric__hint">{hint}</span>}
      </div>
      {to && (
        <i className="fa-solid fa-arrow-right klk-metric__chev" aria-hidden="true" />
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="klk-metric-link">{content}</Link>;
  }
  return content;
};

export default DashboardStatCard;
