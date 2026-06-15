import { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const ReleaseProduction = ({ item, onClose }) => {
  const [formData, setFormData] = useState({
    release_count: "",
    new_vendor_id: "",
    remark: "",
  });

  const [vendors, setVendors] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, title: "", items: [] });

  const token = localStorage.getItem("token");
  const created_by = localStorage.getItem("user_id") || "";

  // item.panel_count = current remaining panels (already updated by backend after each release)
  const currentPanels = item?.panel_count || 0;
  const enteredCount = Number(formData.release_count) || 0;
  const remainingAfterRelease = currentPanels - enteredCount;

  useEffect(() => {
    if (item?._id) {
      fetchHistory();
      fetchVendors();
    }
  }, [item]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}users/vendor-list`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setVendors(data || []);
      } else {
        console.log("Vendor fetch failed");
      }
    } catch (error) {
      console.log("Vendor API Error:", error);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/get-production-release-history/${item._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(res.data?.data?.history || []);
    } catch (err) {
      console.error("History Fetch Error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.release_count || enteredCount < 1) {
      alert("Release Count must be at least 1");
      return;
    }

    if (enteredCount > currentPanels) {
      alert(`Cannot release ${enteredCount} panels. You only have ${currentPanels} panels remaining.`);
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        production_id: item._id,
        release_count: enteredCount,
        new_vendor_id: formData.new_vendor_id || undefined,
        created_by,
        remark: formData.remark || undefined,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}production/release-production-panel`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        alert("Panels Released Successfully!");
        setFormData({ release_count: "", new_vendor_id: "", remark: "" });
        fetchHistory();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to release panels";
      alert(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openPopup = (title, items) => {
    setPopup({ show: true, title, items });
  };

  const closePopup = () => {
    setPopup({ show: false, title: "", items: [] });
  };

  return (
    <Fragment>

      {/* ── Info Banner ── */}
      <div className="alert border border-primary mb-3">
        <div className="d-flex flex-wrap gap-4">
          <span>
            <strong className="text-primary">Total Panels:</strong> <b>{item?.panel_count}</b>
          </span>
          <span>
            <strong className="text-primary">Type:</strong> <b>{item?.panel_type}</b>
          </span>
          <span>
            <strong className="text-primary">Capacity:</strong> <b>{item?.panel_capacity}W</b>
          </span>
          <span>
            <strong className="text-primary">Project:</strong> <b>{item?.project}</b>
          </span>
          <span>
            <strong className="text-primary">State:</strong> <b>{item?.state}</b>
          </span>
        </div>
      </div>

      {/* ── Release Form Card ── */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Release Count */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Release Count <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="release_count"
                  placeholder="Enter panels to release"
                  value={formData.release_count}
                  onChange={handleChange}
                  min={1}
                  max={currentPanels}
                  required
                />
                {/* Current available panels */}
                <small className="text-muted d-block mt-1">
                  Available to release: <strong>{currentPanels}</strong> panels
                </small>

                {/* Real-time remaining preview — only show when user has typed something */}
                {enteredCount > 0 && (
                  enteredCount > currentPanels ? (
                    <small className="text-danger fw-semibold d-block">
                      ✗ Exceeds available panels by {enteredCount - currentPanels}
                    </small>
                  ) : (
                    <small className="text-success fw-semibold d-block">
                      ✓ After release: <strong>{remainingAfterRelease}</strong> panels will remain
                    </small>
                  )
                )}
              </div>

              {/* New Vendor Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Assign New Vendor</label>
                <select
                  className="form-control"
                  name="new_vendor_id"
                  value={formData.new_vendor_id}
                  onChange={handleChange}
                >
                  <option value="">— Select Vendor (Optional) —</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.first_name} {vendor.last_name} — {vendor.email}
                    </option>
                  ))}
                </select>
                <small className="text-muted">Leave blank to release without vendor</small>
              </div>

              {/* Remark */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Remark</label>
                <input
                  type="text"
                  className="form-control"
                  name="remark"
                  placeholder="Optional remark"
                  value={formData.remark}
                  onChange={handleChange}
                />
              </div>

              {/* Current Vendor (readonly) */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Current Vendor</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    item?.vendor_details
                      ? `${item.vendor_details.first_name} ${item.vendor_details.last_name}`
                      : "—"
                  }
                  readOnly
                />
              </div>

              {/* Vendor Email (readonly) */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Vendor Email</label>
                <input
                  type="text"
                  className="form-control"
                  value={item?.vendor_details?.email || "—"}
                  readOnly
                />
              </div>

              {/* Vendor WhatsApp (readonly) */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Vendor WhatsApp</label>
                <input
                  type="text"
                  className="form-control"
                  value={item?.vendor_details?.whatsapp_no || "—"}
                  readOnly
                />
              </div>

            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitLoading || enteredCount > currentPanels}
              >
                {submitLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Releasing...
                  </>
                ) : (
                  <>
                    <i className="fa fa-paper-plane me-2" />
                    Release Panel
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Release History Table ── */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Release History</h4>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchHistory}
            disabled={historyLoading}
          >
            <i className="fa fa-refresh me-1" />
            Refresh
          </button>
        </div>
        <div className="card-body">
          {historyLoading ? (
            <div className="text-center py-3">
              <span className="spinner-border spinner-border-sm me-2" />
              Loading history...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Release Date</th>

                    <th>Panel Count Before</th>
                    <th>Panel Count After</th>
                    <th>Panel Numbers</th>
                    <th>Panel Unique No.</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((row, index) => (
                      <tr key={row._id}>
                        <td><strong>{index + 1}</strong></td>
                        <td>{row.released_date || "—"}</td>
                     
                        <td>{row.old_panel_count_before}</td>
                        <td>{row.old_panel_count_after}</td>
                        <td>
                          {row.released_panel_numbers?.length > 0 ? (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                openPopup(
                                  `Panel Numbers (${row.released_panel_numbers.length})`,
                                  row.released_panel_numbers
                                )
                              }
                            >
                              View {row.released_panel_numbers.length}
                            </button>
                          ) : "—"}
                        </td>
                        <td>
                          {row.released_panel_unique_numbers?.length > 0 ? (
                            <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() =>
                                openPopup(
                                  `Panel Unique Numbers (${row.released_panel_unique_numbers.length})`,
                                  row.released_panel_unique_numbers
                                )
                              }
                            >
                              View {row.released_panel_unique_numbers.length}
                            </button>
                          ) : "—"}
                        </td>
                        <td>{row.remark || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-3">
                        No release history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel Numbers Popup Modal ── */}
      {popup.show && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={closePopup}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{popup.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePopup}
                />
              </div>
              <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {popup.items.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {popup.items.map((panelItem, i) => (
                      <span key={i} className="badge bg-secondary fs-6 fw-normal">
                        {panelItem}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center mb-0">No data available</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closePopup}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Fragment>
  );
};

ReleaseProduction.propTypes = {
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    _id: PropTypes.string,
    date: PropTypes.string,
    panel_count: PropTypes.number,
    panel_capacity: PropTypes.string,
    panel_type: PropTypes.string,
    project: PropTypes.string,
    state: PropTypes.string,
    vendor_details: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      email: PropTypes.string,
      whatsapp_no: PropTypes.string,
    }),
  }),
};

ReleaseProduction.defaultProps = {
  item: null,
};

export default ReleaseProduction;