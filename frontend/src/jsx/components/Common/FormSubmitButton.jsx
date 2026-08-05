import { Spinner } from "react-bootstrap";

const FormSubmitButton = ({
  loading,
  label,
  loadingLabel = "Saving...",
  className = "btn btn-primary",
  disabled,
}) => (
  <div className="klk-form-actions">
    <button
      type="submit"
      className={`${className} klk-form-actions__btn`.trim()}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  </div>
);

export default FormSubmitButton;
