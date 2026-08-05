import { INDIAN_STATES } from "../../constants/indianStates";

const StateSelect = ({
  name = "state",
  value,
  onChange,
  required = false,
  disabled = false,
  className = "form-control",
  placeholder = "Select State",
  isInvalid = false,
}) => (
  <select
    className={`${className}${isInvalid ? " is-invalid" : ""}`}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
  >
    <option value="">{placeholder}</option>
    {INDIAN_STATES.map((s) => (
      <option key={s.value} value={s.value}>
        {s.label}
      </option>
    ))}
  </select>
);

export default StateSelect;
