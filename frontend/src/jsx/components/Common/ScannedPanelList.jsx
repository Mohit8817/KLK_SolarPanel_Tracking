const ScannedPanelList = ({ panels = [], variant = "success", onRemove, emptyText = "No panels scanned yet" }) => {
  if (!panels.length) {
    return <p className="text-muted small mb-0">{emptyText}</p>;
  }

  return (
    <div className="klk-scanned-list">
      {panels.map((panel, index) => (
        <span key={`${panel}-${index}`} className={`badge bg-${variant} klk-scanned-badge`}>
          {panel}
          {onRemove && (
            <button
              type="button"
              className="klk-scanned-remove"
              onClick={() => onRemove(panel)}
              aria-label={`Remove ${panel}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

export default ScannedPanelList;
