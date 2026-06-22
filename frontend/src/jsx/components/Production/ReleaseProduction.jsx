import { Fragment, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Badge } from "react-bootstrap";



const ReleaseProduction = ({ item, onClose }) => {
  const [formData, setFormData] = useState({
    new_vendor_id: "",
    new_project: item?.project || "",
    new_state: item?.state || "",
    remark: "",
  });

  const [vendors, setVendors] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, title: "", items: [] });

  const [panelList, setPanelList] = useState([]);
  const [panelListLoading, setPanelListLoading] = useState(false);
  const [startPanelId, setStartPanelId] = useState("");
  const [endPanelId, setEndPanelId] = useState("");
  const [currentPanels, setCurrentPanels] = useState(item?.panel_count || 0);

  const token = localStorage.getItem("token");
  const created_by = localStorage.getItem("user_id") || "";

  useEffect(() => {
    if (item?._id) {
      fetchHistory();
      fetchVendors();
      fetchPanelList();
      setCurrentPanels(item?.panel_count || 0);
      setFormData({
        new_vendor_id: "",
        new_project: item?.project || "",
        new_state: item?.state || "",
        remark: "",
      });
      setStartPanelId("");
      setEndPanelId("");
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
      setHistory(res.data?.data || []);
    } catch (err) {
      console.error("History Fetch Error:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPanelList = async () => {
    setPanelListLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/productionlot/${item._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = res?.data?.data || [];
      // sorting
      const sorted = [...list].sort(
        (a, b) => (a.panel_no || 0) - (b.panel_no || 0)
      );
      setPanelList(sorted);
    } catch (err) {
      console.log("Panel List Fetch Error:", err);
      setPanelList([]);
    } finally {
      setPanelListLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startIndex = useMemo(
    () => panelList.findIndex((p) => p._id === startPanelId),
    [panelList, startPanelId]
  );

  const endOptions = useMemo(() => {
    if (startIndex === -1) return [];
    return panelList.slice(startIndex);
  }, [panelList, startIndex]);

  const endIndex = useMemo(
    () => panelList.findIndex((p) => p._id === endPanelId),
    [panelList, endPanelId]
  );

  const enteredCount =
    startIndex !== -1 && endIndex !== -1 ? endIndex - startIndex + 1 : 0;

  const remainingAfterRelease = currentPanels - enteredCount;

  const handleStartChange = (e) => {
    setStartPanelId(e.target.value);
    setEndPanelId("");
  };

  const handleEndChange = (e) => {
    setEndPanelId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startPanelId || !endPanelId) {
      alert("Please select both Starting No and Ending No");
      return;
    }

    if (enteredCount < 1) {
      alert("Selected range is invalid");
      return;
    }

    if (enteredCount > currentPanels) {
      alert(`Cannot release ${enteredCount} panels. You only have ${currentPanels} panels remaining.`);
      return;
    }

    setSubmitLoading(true);
    try {
      const releasedPanels = panelList.slice(startIndex, endIndex + 1);

      const payload = {
        production_id: item._id,
        release_count: enteredCount,
        start_panel_no: releasedPanels[0]?.panel_no,
        end_panel_no: releasedPanels[releasedPanels.length - 1]?.panel_no,
        panel_ids: releasedPanels.map((p) => p._id),
        panel_unique_numbers: releasedPanels.map((p) => p.panel_unique_no),
        new_vendor_id: formData.new_vendor_id || undefined,
        new_project: formData.new_project || undefined,
        new_state: formData.new_state || undefined,
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

        setCurrentPanels((prev) => prev - enteredCount);

        setFormData({
          new_vendor_id: "",
          new_project: item?.project || "",
          new_state: item?.state || "",
          remark: "",
        });
        setStartPanelId("");
        setEndPanelId("");
        fetchHistory();
        fetchPanelList();
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
            <strong className="text-primary">Total Panels:</strong>{" "}
            <b>{currentPanels}</b>
          </span>
          <span>
            <strong className="text-primary">Type:</strong>{" "}
            <b>
              {{
                "1": "Polly",
                "2": "Mono",
                "3": "Bifacial",
              }[item.panel_type] || "NA"}
            </b>
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
          <span>
            <strong className="text-primary">Vendor name:</strong> <b>{item.vendor_details.first_name} {item.vendor_details.last_name}</b>
          </span>
          <span>
            <strong className="text-primary">vendor Email:</strong> <b>{item?.vendor_details?.email || "—"} </b>
          </span>
        </div>
      </div>

      {/* ── Release Form Card ── */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Starting No <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  value={startPanelId}
                  onChange={handleStartChange}
                  disabled={panelListLoading || panelList.length === 0}
                  required
                >
                  <option value="">
                    {panelListLoading ? "Loading panels..." : "— Select Starting Panel —"}
                  </option>
                  {panelList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.panel_unique_no}
                    </option>
                  ))}
                </select>
                {!panelListLoading && panelList.length === 0 && (
                  <small className="text-danger d-block mt-1">
                    No panels found for this production
                  </small>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Ending No <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  value={endPanelId}
                  onChange={handleEndChange}
                  disabled={!startPanelId}
                  required
                >
                  <option value="">— Select Ending Panel —</option>
                  {endOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.panel_unique_no}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">Panel Count</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={enteredCount > 0 ? enteredCount : ""}
                  placeholder="0"
                  readOnly
                  disabled
                />
                {enteredCount > 0 && (
                  enteredCount > currentPanels ? (
                    <small className="text-danger fw-semibold d-block mt-1">
                      ✗ Exceeds by {enteredCount - currentPanels}
                    </small>
                  ) : (
                    <small className="text-success fw-semibold d-block mt-1">
                      ✓ {remainingAfterRelease} will remain
                    </small>
                  )
                )}
              </div>

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
            </div>

            {/* ── New Project / New State / Remark ── */}
            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <label className="form-label fw-semibold">New Project</label>
                <input
                  type="text"
                  className="form-control"
                  name="new_project"
                  placeholder="Project"
                  value={formData.new_project}
                  onChange={handleChange}
                />
                <small className="text-muted">Prefilled with current project — change if needed</small>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">New State</label>
                <select
                  className="form-control"
                  name="new_state"
                  value={formData.new_state}
                  onChange={handleChange}
                >
                  <option value="">— Select State —</option>

                  {/* States */}
                  <option value="Andhra_Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal_Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal_Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya_Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil_Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar_Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West_Bengal">West Bengal</option>

                  {/* Union Territories */}
                  <option value="Andaman_Nicobar">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra_Nagar_Haveli_Daman_Diu">
                    Dadra and Nagar Haveli and Daman and Diu
                  </option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu_Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
                <small className="text-muted">Prefilled with current state — change if needed</small>
              </div>

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
                disabled={
                  submitLoading ||
                  !startPanelId ||
                  !endPanelId ||
                  enteredCount < 1 ||
                  enteredCount > currentPanels
                }
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
          <h4 className="card-title mb-0 ">Release History</h4>
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
                    <th>Panel Unique No.</th>
                    <th>Assign</th>
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
                          {row.panels?.length > 0 ? (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                openPopup(
                                  `Panel Unique Numbers (${row.panels.length})`,
                                  row.panels.map((p) => p.panel_unique_no)
                                )
                              }
                            >
                              View {row.panels.length}
                            </button>
                          ) : "—"}
                        </td>


                        <td>
                          {row.status === 1 ? (
                            <div className="d-flex flex-column gap-1">
                              <Badge bg="success">Vendor Assign</Badge>
                              {row.vendor_name && (
                                <small className="text-muted fw-semibold">{row.vendor_name}
                                  fakdfhakjh</small>
                              )}
                            </div>
                          ) : (
                            <Badge bg="warning">Production</Badge>
                          )}
                        </td>

                        <td>{row.remark || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
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
                      <span key={i} className="badge bg-primary fs-6 fw-normal">
                        {panelItem}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center mb-0">No data available</p>
                )}
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