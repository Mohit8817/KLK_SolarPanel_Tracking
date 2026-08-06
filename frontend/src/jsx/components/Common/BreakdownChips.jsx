const BreakdownChips = ({ items = [], labelKey, suffix = "" }) => {
  if (!items.length) {
    return <span className="klk-cap-pill klk-cap-pill--muted">—</span>;
  }

  return (
    <div className="klk-breakdown-list">
      {items.map((item) => (
        <span
          key={`${item[labelKey]}-${item.count}`}
          className={`klk-breakdown-chip klk-breakdown-chip--${labelKey}`}
        >
          <span className="klk-breakdown-chip__label">
            {item[labelKey]}
            {suffix}
          </span>
          <span className="klk-breakdown-chip__count">{item.count.toLocaleString()}</span>
        </span>
      ))}
    </div>
  );
};

export default BreakdownChips;
