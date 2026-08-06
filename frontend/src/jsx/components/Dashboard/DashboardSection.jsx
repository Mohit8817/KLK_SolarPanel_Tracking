/**
 * @param {{ icon: string, title: string, subtitle?: string, action?: React.ReactNode, accent?: string, bodyClassName?: string, className?: string, children: React.ReactNode }} props
 */
const DashboardSection = ({
  icon,
  title,
  subtitle,
  action,
  accent = "teal",
  bodyClassName = "",
  className = "",
  children,
}) => (
  <div className={`card klk-dash-block klk-dash-block--${accent} klk-dash-section ${className}`.trim()}>
    <div className="klk-dash-block__head">
      <div className="klk-dash-block__head-left">
        <span className="klk-dash-block__icon">
          <i className={`fa-solid ${icon}`} aria-hidden="true" />
        </span>
        <div>
          <h2 className="klk-dash-block__title">{title}</h2>
          {subtitle && <p className="klk-dash-block__sub">{subtitle}</p>}
        </div>
      </div>
      {action || null}
    </div>
    <div className={`klk-dash-block__body ${bodyClassName}`.trim()}>{children}</div>
  </div>
);

export default DashboardSection;
