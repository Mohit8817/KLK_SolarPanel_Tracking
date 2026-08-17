import { Fragment, useEffect, useMemo, useState } from "react";
import PageHeader from "../Common/PageHeader";
import StateSelect from "../Common/StateSelect";
import FormSubmitButton from "../Common/FormSubmitButton";
import SerialFormatBuilder from "./SerialFormatBuilder";
import { PANEL_CAPACITIES } from "../../constants/indianStates";
import { notifySuccess, notifyError } from "../../utils/toast";
import {
  DEFAULT_SERIAL_FORMAT,
  DEFAULT_SEQUENCE_DIGITS,
  DEFAULT_CAPACITY_DIGITS,
  ALLOWED_SEQUENCE_DIGITS,
  ALLOWED_CAPACITY_DIGITS,
  padSequence,
  formatCapacityForSerial,
  buildSerialPreview,
} from "../../utils/serialNumberFormat";
import { createPanelSerial, getNextStartingNo } from "./GeneratepanelApis";

const INITIAL_FORM = {
  date: "",
  total_panels: "",
  panel_capacity: "",
  panel_type: "",
  panel_category: "",
  prefix: "",
  panel_alot_state: "",
  panel_alot_project: "",
};

const Generatepanel = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [serialFormat, setSerialFormat] = useState([...DEFAULT_SERIAL_FORMAT]);
  const [serialFormatLocked, setSerialFormatLocked] = useState(false);
  const [sequenceDigits, setSequenceDigits] = useState(DEFAULT_SEQUENCE_DIGITS);
  const [sequenceDigitsLocked, setSequenceDigitsLocked] = useState(false);
  const [capacityDigits, setCapacityDigits] = useState(DEFAULT_CAPACITY_DIGITS);
  const [capacityDigitsLocked, setCapacityDigitsLocked] = useState(false);
  const [historyMessage, setHistoryMessage] = useState("");
  const [startingNo, setStartingNo] = useState(1);
  const [startingNoEditable, setStartingNoEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrefixChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setFormData({
      ...formData,
      prefix: value,
    });
  };

  useEffect(() => {
    const canFetch =
      formData.prefix &&
      formData.panel_capacity &&
      formData.panel_type &&
      formData.date;

    if (!canFetch) {
      setStartingNo(1);
      setStartingNoEditable(false);
      setSequenceDigitsLocked(false);
      setCapacityDigitsLocked(false);
      setSerialFormatLocked(false);
      setHistoryMessage("");
      setSerialFormat([...DEFAULT_SERIAL_FORMAT]);
      setCapacityDigits(DEFAULT_CAPACITY_DIGITS);
      return;
    }

    const fetchStartingNo = async () => {
      try {
        const res = await getNextStartingNo({
          prefix: formData.prefix,
          panel_capacity: formData.panel_capacity,
          panel_type: formData.panel_type,
          date: formData.date,
        });
        const data = res.data || {};
        setStartingNo(data.next_starting_no || 1);
        if (data.sequence_digits) {
          setSequenceDigits(data.sequence_digits);
        }
        if (data.capacity_digits) {
          setCapacityDigits(data.capacity_digits);
        }
        if (Array.isArray(data.serial_format) && data.serial_format.length) {
          setSerialFormat(data.serial_format);
        }
        setSequenceDigitsLocked(Boolean(data.sequence_digits_locked));
        setCapacityDigitsLocked(Boolean(data.capacity_digits_locked));
        setSerialFormatLocked(Boolean(data.serial_format_locked));
        setStartingNoEditable(Boolean(data.starting_no_editable));
        setHistoryMessage(data.history_message || "");
      } catch {
        setStartingNo(1);
        setStartingNoEditable(false);
        setSequenceDigitsLocked(false);
        setCapacityDigitsLocked(false);
        setSerialFormatLocked(false);
        setHistoryMessage("");
      }
    };

    fetchStartingNo();
  }, [
    formData.prefix,
    formData.panel_capacity,
    formData.panel_type,
    formData.date,
  ]);

  const preview = useMemo(
    () =>
      buildSerialPreview({
        format: serialFormat,
        formData,
        startingNo,
        totalPanels: formData.total_panels || 1,
        sequenceDigits,
        capacityDigits,
      }),
    [serialFormat, formData, startingNo, sequenceDigits, capacityDigits]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await createPanelSerial({
        ...formData,
        serial_format: preview.normalized,
        sequence_digits: sequenceDigits,
        capacity_digits: capacityDigits,
        ...(startingNoEditable ? { starting_no: startingNo } : {}),
      });
      notifySuccess("Serial numbers generated successfully");
      setFormData(INITIAL_FORM);
      setSerialFormat([...DEFAULT_SERIAL_FORMAT]);
      setSerialFormatLocked(false);
      setSequenceDigits(DEFAULT_SEQUENCE_DIGITS);
      setCapacityDigits(DEFAULT_CAPACITY_DIGITS);
      setSequenceDigitsLocked(false);
      setCapacityDigitsLocked(false);
      setHistoryMessage("");
      setStartingNoEditable(false);
      setStartingNo(1);
    } catch (error) {
      console.log("ERROR:", error?.response?.data);
      notifyError(error?.response?.data?.message || "Failed to generate serial numbers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <PageHeader
        title="Generate Panel Serial Number"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Panel Generation", to: "/generate/panel/list" },
          { label: "Generate" },
        ]}
      />

      <div className="row">
        <div className="col-lg-12">
          <div className="card klk-form-card klk-generate-panel">
            <div className="card-body">
              <form className="form-valide klk-generate-panel__form" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        No of Panels <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="total_panels"
                        value={formData.total_panels}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Capacity (W) <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="panel_capacity"
                        value={formData.panel_capacity}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Capacity</option>
                        {PANEL_CAPACITIES.map((cap) => (
                          <option key={cap} value={String(cap)}>
                            {cap}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="panel_type"
                        value={formData.panel_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="1">Poly</option>
                        <option value="2">Mono</option>
                        <option value="3">Bifacial</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="panel_category"
                        value={formData.panel_category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="1">DCR</option>
                        <option value="2">NON DCR</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Prefix <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="prefix"
                        placeholder="e.g. KLK"
                        value={formData.prefix}
                        onChange={handlePrefixChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        State <span className="text-danger">*</span>
                      </label>
                      <StateSelect
                        name="panel_alot_state"
                        value={formData.panel_alot_state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Alot Project <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="panel_alot_project"
                        placeholder="e.g. JAKEDA"
                        value={formData.panel_alot_project}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Capacity Digits in Serial</label>
                      <select
                        className="form-control"
                        name="capacity_digits"
                        value={capacityDigits}
                        onChange={(e) => setCapacityDigits(Number(e.target.value))}
                        disabled={capacityDigitsLocked}
                      >
                        {ALLOWED_CAPACITY_DIGITS.map((digits) => (
                          <option key={digits} value={digits}>
                            {digits} digits
                            {formData.panel_capacity
                              ? ` → ${formatCapacityForSerial(formData.panel_capacity, digits)}`
                              : ""}
                            {digits === DEFAULT_CAPACITY_DIGITS ? " (default)" : ""}
                          </option>
                        ))}
                      </select>
                      {capacityDigitsLocked ? (
                        <small className="text-muted d-block mt-1">
                          Locked to match existing panels for this prefix/capacity/type/year.
                        </small>
                      ) : (
                        <small className="text-muted d-block mt-1">
                          Pads capacity with leading zeros in the serial number (e.g. 55 → 055 for 3 digits).
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Sequence Digits</label>
                      <select
                        className="form-control"
                        name="sequence_digits"
                        value={sequenceDigits}
                        onChange={(e) => setSequenceDigits(Number(e.target.value))}
                        disabled={sequenceDigitsLocked}
                      >
                        {ALLOWED_SEQUENCE_DIGITS.map((digits) => (
                          <option key={digits} value={digits}>
                            {digits} digits{digits === DEFAULT_SEQUENCE_DIGITS ? " (default)" : ""}
                          </option>
                        ))}
                      </select>
                      {sequenceDigitsLocked ? (
                        <small className="text-muted d-block mt-1">
                          Locked to match existing panels for this prefix/capacity/type/year.
                        </small>
                      ) : (
                        <small className="text-muted d-block mt-1">
                          New series — choose digit length. It will be fixed once panels are generated.
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Starting No</label>
                      {startingNoEditable ? (
                        <input
                          type="number"
                          className="form-control"
                          name="starting_no"
                          min={1}
                          step={1}
                          value={startingNo}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setStartingNo(Number.isNaN(value) || value < 1 ? 1 : value);
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          value={padSequence(startingNo, sequenceDigits)}
                          disabled
                        />
                      )}
                      {startingNoEditable ? (
                        <small className="text-muted d-block mt-1">
                          New series — enter the first sequence number (e.g. 1, 100, 500).
                        </small>
                      ) : (
                        <small className="text-muted d-block mt-1">
                          Auto-calculated from existing panels for this prefix/capacity/type/year.
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {historyMessage && (
                  <div className="alert alert-info py-2 px-3 mb-3 klk-serial-history-note">
                    <i className="fa fa-info-circle me-2" />
                    {historyMessage}
                  </div>
                )}

                <div className="row g-3 klk-generate-panel__format-row">
                  <div className="col-lg-7">
                    <SerialFormatBuilder
                      format={serialFormat}
                      onChange={setSerialFormat}
                      sequenceDigits={sequenceDigits}
                      capacityDigits={capacityDigits}
                      panelCapacity={formData.panel_capacity}
                      locked={serialFormatLocked}
                    />
                  </div>

                  <div className="col-lg-5">
                    <div className="klk-serial-preview">
                      <h6 className="klk-serial-preview__title">Live Preview</h6>
                      <p className="klk-serial-preview__hint">
                        Example of how serial numbers will be generated with your current settings.
                      </p>

                      <div className="klk-serial-preview__example">
                        <span className="klk-serial-preview__label">First</span>
                        <code>{preview.first || "Fill required fields to preview"}</code>
                      </div>

                      {preview.second && (
                        <div className="klk-serial-preview__example">
                          <span className="klk-serial-preview__label">Second</span>
                          <code>{preview.second}</code>
                        </div>
                      )}

                      {preview.last && (
                        <div className="klk-serial-preview__example">
                          <span className="klk-serial-preview__label">Last</span>
                          <code>{preview.last}</code>
                        </div>
                      )}

                      <div className="klk-serial-preview__format">
                        Capacity: {preview.capacityDigits} digits · Sequence: {preview.sequenceDigits} digits · Order:{" "}
                        {preview.normalized
                          .map((part, index) => `${index + 1}. ${part.replace("_", " ")}`)
                          .join(" → ")}
                      </div>
                    </div>
                  </div>
                </div>

                <FormSubmitButton
                  loading={loading}
                  label="Generate Serial No"
                  loadingLabel="Generating..."
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Generatepanel;
