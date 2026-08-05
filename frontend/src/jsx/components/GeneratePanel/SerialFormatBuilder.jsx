import {
  DEFAULT_SERIAL_FORMAT,
  SERIAL_FORMAT_PARTS,
  normalizeSerialFormat,
  padSequence,
  DEFAULT_SEQUENCE_DIGITS,
} from "../../utils/serialNumberFormat";

const SerialFormatBuilder = ({
  format,
  onChange,
  sequenceDigits = DEFAULT_SEQUENCE_DIGITS,
  locked = false,
}) => {
  const normalized = normalizeSerialFormat(format);

  const isEnabled = (id) => normalized.includes(id);

  const setEnabled = (id, enabled) => {
    if (id === "sequence") return;

    let next = [...normalized];
    if (enabled) {
      if (!next.includes(id)) {
        next.splice(next.length - 1, 0, id);
      }
    } else {
      next = next.filter((part) => part !== id);
    }

    onChange(normalizeSerialFormat(next));
  };

  const movePart = (id, direction) => {
    if (id === "sequence") return;

    const next = [...normalized];
    const index = next.indexOf(id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= next.length - 1) return;

    [next[index], next[target]] = [next[target], next[index]];
    onChange(normalizeSerialFormat(next));
  };

  const orderedParts = SERIAL_FORMAT_PARTS.slice().sort((a, b) => {
    const ai = normalized.indexOf(a.id);
    const bi = normalized.indexOf(b.id);
    return ai - bi;
  });

  return (
    <div className={`klk-serial-format${locked ? " is-locked" : ""}`}>
      <div className="klk-serial-format__head">
        <h6 className="klk-serial-format__title">Serial Number Format</h6>
        {!locked && (
          <button
            type="button"
            className="btn btn-link btn-sm p-0"
            onClick={() => onChange([...DEFAULT_SERIAL_FORMAT])}
          >
            Reset to default
          </button>
        )}
      </div>

      <p className="klk-serial-format__hint">
        {locked
          ? "Format is locked to match existing panels for this prefix/capacity/type/year."
          : "Choose which parts to include and drag order with arrows. Sequence number is always last."}
      </p>

      <div className="klk-serial-format__list">
        {orderedParts.map((part) => {
          const enabled = isEnabled(part.id);
          const orderIndex = normalized.indexOf(part.id);

          return (
            <div
              key={part.id}
              className={`klk-serial-format__item${enabled ? " is-enabled" : ""}${
                part.locked ? " is-locked" : ""
              }`}
            >
              <span className="klk-serial-format__order">
                {enabled ? orderIndex + 1 : "—"}
              </span>

              <div className="klk-serial-format__meta">
                <strong>{part.label}</strong>
                <span className="text-muted">
                  e.g.{" "}
                  {part.id === "sequence"
                    ? padSequence(1, sequenceDigits)
                    : part.sample}
                </span>
              </div>

              <div className="klk-serial-format__actions">
                {!part.locked && !locked && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => movePart(part.id, -1)}
                      disabled={!enabled || orderIndex <= 0}
                      aria-label={`Move ${part.label} up`}
                    >
                      <i className="fa fa-arrow-up" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => movePart(part.id, 1)}
                      disabled={!enabled || orderIndex >= normalized.length - 2}
                      aria-label={`Move ${part.label} down`}
                    >
                      <i className="fa fa-arrow-down" />
                    </button>
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(part.id, e.target.checked)}
                        id={`serial-part-${part.id}`}
                      />
                    </div>
                  </>
                )}
                {(part.locked || locked) && (
                  <span className="badge bg-light text-muted">
                    {part.locked ? "Always included" : "Locked"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="klk-serial-format__flow">
        {normalized.map((part, index) => {
          const meta = SERIAL_FORMAT_PARTS.find((p) => p.id === part);
          return (
            <span key={part} className="klk-serial-format__chip">
              {index + 1}. {meta?.label || part}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default SerialFormatBuilder;
