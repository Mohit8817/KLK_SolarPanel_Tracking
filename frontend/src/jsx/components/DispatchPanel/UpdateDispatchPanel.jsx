import { Fragment, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../Common/PageHeader";
import ScannedPanelList from "../Common/ScannedPanelList";
import { PageLoader } from "../Common/LoadingState";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/toast";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const UpdateDispatchPanel = () => {
  const { id } = useParams();

  const scannerRef = useRef(null);
  const inputRef = useRef(null);
  const scanTimerRef = useRef(null);
  const lastScannedRef = useRef("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerInput, setScannerInput] = useState("");
  const [manualPanel, setManualPanel] = useState("");

  const [dispatchData, setDispatchData] = useState({
    dispatch_id: "",
    state: "",
    truck_no: "",
    driver_no: "",
    driver_name: "",
    challan_no: "",
    dispatch_panel_count: "",
    dispatchType: "",
    dcrPanels: [],
    nonDcrPanels: [],
  });

  useEffect(() => {
    fetchDispatchDetails();
    return () => stopScan();
  }, []);

  const forceFocus = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const fetchDispatchDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const dispatchRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dispatchInfo = dispatchRes.data?.data || {};

      const panelRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel-lot/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const panels = panelRes.data?.data || [];

      const dcr = panels
        .filter((p) => Number(p.dispatch_panel_type) === 1)
        .map((p) => p.panel_unique_no);

      const nonDcr = panels
        .filter((p) => Number(p.dispatch_panel_type) === 2)
        .map((p) => p.panel_unique_no);

      setDispatchData({
        dispatch_id: dispatchInfo.dispatch_id || "",
        state: dispatchInfo.state || "",
        truck_no: dispatchInfo.truck_no || "",
        driver_no: dispatchInfo.driver_no || "",
        driver_name: dispatchInfo.driver_name || "",
        challan_no: dispatchInfo.challan_no || "",
        dispatch_panel_count: dispatchInfo.dispatch_panel_count || "",
        dispatchType: "",
        dcrPanels: dcr,
        nonDcrPanels: nonDcr,
      });
    } catch (err) {
      console.log("Fetch error:", err.response?.data || err.message);
      notifyError("Failed to load dispatch details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dispatchType") {
      localStorage.setItem("dispatch_panel_type", value === "DCR" ? 1 : 2);
    }

    setDispatchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const savePanel = async (panelCode) => {
    if (!panelCode) return;

    if (!dispatchData.dispatchType) {
      notifyWarning("Select DCR or NON-DCR first");
      return;
    }

    if (lastScannedRef.current === panelCode) return;
    lastScannedRef.current = panelCode;

    if (
      dispatchData.dcrPanels.includes(panelCode) ||
      dispatchData.nonDcrPanels.includes(panelCode)
    ) {
      notifyWarning("Panel already scanned");
      lastScannedRef.current = "";
      return;
    }

    const totalPanels =
      dispatchData.dcrPanels.length + dispatchData.nonDcrPanels.length;

    const targetCount = Number(dispatchData.dispatch_panel_count) || 0;
    if (targetCount > 0 && totalPanels >= targetCount) {
      notifyWarning("Dispatch panel count already reached");
      lastScannedRef.current = "";
      return;
    }

    const panel_type = dispatchData.dispatchType === "DCR" ? 1 : 2;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/scan-panel`,
        {
          panel_no: panelCode,
          dispatch_id: id,
          panel_type,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDispatchData((prev) =>
        panel_type === 1
          ? { ...prev, dcrPanels: [...prev.dcrPanels, panelCode] }
          : { ...prev, nonDcrPanels: [...prev.nonDcrPanels, panelCode] }
      );

      forceFocus();
      setTimeout(() => {
        lastScannedRef.current = "";
      }, 200);
    } catch (err) {
      notifyError(err.response?.data?.message || "Scan failed");
      lastScannedRef.current = "";
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/update-dispatch-panel/${id}`,
        dispatchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notifySuccess("Dispatch updated successfully");
    } catch (err) {
      notifyError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const startScan = async () => {
    if (!dispatchData.dispatchType) {
      notifyWarning("Please select panel type first.");
      return;
    }

    if (scannerRef.current) return;

    setScanning(true);

    try {
      const qr = new Html5Qrcode("reader");
      scannerRef.current = qr;

      await qr.start(
        { facingMode: "environment" },
        {
          fps: 25,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: true,
        },
        (decodedText) => {
          savePanel(decodedText);
        }
      );
    } catch (err) {
      console.log("Camera failed:", err);
      notifyError("Camera start failed");
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const totalScanned =
    dispatchData.dcrPanels.length + dispatchData.nonDcrPanels.length;
  const targetCount = Number(dispatchData.dispatch_panel_count) || 0;
  const scanProgress =
    targetCount > 0 ? Math.min((totalScanned / targetCount) * 100, 100) : 0;

  if (loading) {
    return <PageLoader message="Loading dispatch..." />;
  }

  return (
    <Fragment>
      <PageHeader
        title="Update Dispatch"
        subtitle="Edit dispatch details and scan additional panels"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Dispatch", to: "/dispatch/list" },
          { label: "Update Dispatch" },
        ]}
      />

      <div className="row">
        <div className="col-lg-12">
          <div className="card klk-form-card klk-dispatch-form">
            <div className="card-body">
              <form onSubmit={handleUpdate}>
                <div className="klk-dispatch-details">
                <div className="row">
                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        Dispatch ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="dispatch_id"
                        value={dispatchData.dispatch_id}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        State <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="state"
                        value={dispatchData.state}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select State / UT</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        Truck No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="truck_no"
                        value={dispatchData.truck_no}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        Driver No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="driver_no"
                        value={dispatchData.driver_no}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        Driver Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="driver_name"
                        value={dispatchData.driver_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        Challan No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="challan_no"
                        value={dispatchData.challan_no}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">
                        Dispatch Panel Count <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="dispatch_panel_count"
                        value={dispatchData.dispatch_panel_count}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
                </div>

                <div className="klk-form-section">
                  <div className="klk-form-section__head">
                    <h5 className="klk-form-section__title">Scan Panels</h5>
                    <span className="klk-dispatch-status klk-dispatch-status--active">
                      <i className="fa fa-check-circle" />
                      Scanning enabled
                    </span>
                  </div>

                  <div className="klk-panel-type-block">
                    <label className="form-label d-block">
                      Panel Type <span className="text-danger">*</span>
                    </label>
                    <div className="klk-panel-type">
                      {["DCR", "NON_DCR"].map((type) => {
                        const isActive = dispatchData.dispatchType === type;
                        return (
                          <label
                            key={type}
                            className={`klk-panel-type__btn${isActive ? " is-active" : ""}`}
                          >
                            <input
                              type="radio"
                              name="dispatchType"
                              value={type}
                              checked={isActive}
                              onChange={handleChange}
                            />
                            {type.replace("_", "-")}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="klk-scan-tools">
                    <div className="klk-scan-tools__field">
                      <label>Scanner gun</label>
                      <input
                        ref={inputRef}
                        type="text"
                        className="form-control"
                        placeholder="Scan barcode here"
                        value={scannerInput}
                        autoFocus
                        onChange={(e) => {
                          const value = e.target.value;
                          setScannerInput(value);

                          if (scanTimerRef.current) {
                            clearTimeout(scanTimerRef.current);
                          }

                          scanTimerRef.current = setTimeout(() => {
                            const finalValue = value.trim();
                            if (!finalValue) return;

                            setScannerInput("");
                            savePanel(finalValue);
                          }, 70);
                        }}
                        onBlur={forceFocus}
                      />
                    </div>

                    <div className="klk-scan-tools__field">
                      <label>QR camera</label>
                      <div className="klk-scan-tools__actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={startScan}
                        >
                          <i className="fa fa-camera me-1" />
                          {scanning ? "Camera on" : "Start camera"}
                        </button>
                        {scanning && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={stopScan}
                          >
                            Stop
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="klk-scan-tools__field">
                      <label>Manual entry</label>
                      <div className="klk-scan-tools__manual">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Panel number"
                          value={manualPanel}
                          onChange={(e) => setManualPanel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              savePanel(manualPanel.trim());
                              setManualPanel("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            savePanel(manualPanel.trim());
                            setManualPanel("");
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {scanning && (
                    <div className="klk-qr-reader">
                      <div id="reader" />
                    </div>
                  )}

                  <div className="klk-scan-stats">
                    <div className="klk-scan-counter">
                      <i className="fa fa-barcode" />
                      {totalScanned} scanned
                      {targetCount > 0 &&
                        ` · ${Math.max(targetCount - totalScanned, 0)} remaining`}
                    </div>
                    {targetCount > 0 && (
                      <div className="klk-dispatch-progress">
                        <div
                          className="klk-dispatch-progress__bar"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="row g-3 klk-scanned-panels-row">
                    <div className="col-md-6">
                      <div className="klk-scanned-panel-box">
                        <div className="klk-scanned-panel-box__title">
                          DCR Panels ({dispatchData.dcrPanels.length})
                        </div>
                        <div className="klk-scanned-panel-box__body">
                          <ScannedPanelList
                            panels={dispatchData.dcrPanels}
                            variant="success"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="klk-scanned-panel-box">
                        <div className="klk-scanned-panel-box__title">
                          NON-DCR Panels ({dispatchData.nonDcrPanels.length})
                        </div>
                        <div className="klk-scanned-panel-box__body">
                          <ScannedPanelList
                            panels={dispatchData.nonDcrPanels}
                            variant="info"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="klk-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary klk-form-actions__btn"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Dispatch"}
                    {totalScanned > 0 && (
                      <span className="badge bg-light text-primary ms-1">
                        {totalScanned} panel{totalScanned !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UpdateDispatchPanel;
