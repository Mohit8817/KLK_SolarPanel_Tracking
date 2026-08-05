const FormField = ({ label, required, error, hint, children, className = "" }) => (
  <div className={`form-group mb-3 klk-field ${className}`}>
    {label && (
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
    )}
    {children}
    {error && <div className="invalid-feedback d-block">{error}</div>}
    {hint && !error && <small className="text-muted d-block mt-1">{hint}</small>}
  </div>
);

export default FormField;
