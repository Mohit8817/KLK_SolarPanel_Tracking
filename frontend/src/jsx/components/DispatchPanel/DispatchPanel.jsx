import { Fragment, useState, useRef, useEffect } from "react";
import PageHeader from "../Common/PageHeader";
import ScannedPanelList from "../Common/ScannedPanelList";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/toast";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

const DispatchPanel = () => {
  const scannerRef = useRef(null);
  const inputRef = useRef(null);
  const scanTimerRef = useRef(null);
  const lastScannedRef = useRef("");

  const STORAGE_KEY = "dispatchPanelData";

  const [scanning, setScanning] = useState(false);
  const [dispatchStarted, setDispatchStarted] = useState(false);
  const [manualPanel, setManualPanel] = useState("");
  const [scannerInput, setScannerInput] = useState("");

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

  /* ================= STORAGE ================= */
  useEffect(() => {
    return () => stopScan();
  }, []);

  /* ================= BEEP ================= */
  const playBeep = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAAAA"
    );
    audio.play().catch(() => {});
  };

  /* ================= FORCE FOCUS ================= */
  const forceFocus = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /* ================= START CAMERA ================= */
  const startScan = async () => {
    if (!dispatchStarted || !dispatchData.dispatchType) {
      notifyWarning("Please start dispatch and select panel type first.");
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

  /* ================= SAVE PANEL ================= */
  const savePanel = async (panelCode) => {
    if (!panelCode) return;

    if (!dispatchData.dispatchType) {
      notifyWarning("Select DCR or NON_DCR first");
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

    const panel_type = dispatchData.dispatchType === "DCR" ? 1 : 2;

    try {
      const token = localStorage.getItem("token");
      const dispatch_id = localStorage.getItem("dispatch_main_id");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/scan-panel`,
        { panel_no: panelCode, dispatch_id, panel_type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDispatchData((prev) =>
        panel_type === 1
          ? { ...prev, dcrPanels: [...prev.dcrPanels, panelCode] }
          : { ...prev, nonDcrPanels: [...prev.nonDcrPanels, panelCode] }
      );

      playBeep();
      forceFocus();

      setTimeout(() => {
        lastScannedRef.current = "";
      }, 200);
    } catch (err) {
      notifyError(err.response?.data?.message || "Scan failed");
      lastScannedRef.current = "";
    }
  };

  const removePanel = (panelCode, type) => {
    setDispatchData((prev) =>
      type === "DCR"
        ? { ...prev, dcrPanels: prev.dcrPanels.filter((p) => p !== panelCode) }
        : { ...prev, nonDcrPanels: prev.nonDcrPanels.filter((p) => p !== panelCode) }
    );
    notifyWarning(`Removed ${panelCode} from scan list`);
  };

  const totalScanned =
    dispatchData.dcrPanels.length + dispatchData.nonDcrPanels.length;
  const targetCount = Number(dispatchData.dispatch_panel_count) || 0;
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dispatchType") {
      localStorage.setItem("dispatch_panel_type", value === "DCR" ? 1 : 2);
    }

    setDispatchData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= START DISPATCH ================= */
  const handleStartDispatch = async (e) => {
    e.preventDefault();

    try {
      const sessionUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const payload = {
        ...dispatchData,
        company_id: sessionUser?.company_id,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/create-dispatch-panel`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("dispatch_main_id", res.data.data.dispatch_id);
      setDispatchStarted(true);
      notifySuccess("Dispatch started — begin scanning panels");
      forceFocus();
    } catch (error) {
  console.log("Start Dispatch Error:", error);
  console.log("Response:", error.response);
  notifyError(error.response?.data?.message || "Failed to start dispatch");
}
  };

  /* ================= END DISPATCH ================= */
const handleEndDispatch = async (e) => {
  e.preventDefault();
  await stopScan();

  const totalPanels =
    dispatchData.dcrPanels.length +
    dispatchData.nonDcrPanels.length;

  if (totalPanels === 0) {
    notifyWarning("No panels scanned");
    return;
  }

  notifySuccess(`Dispatch completed with ${totalPanels} panels`);

  /* ===== FULL RESET ===== */
  localStorage.removeItem("dispatch_main_id");
  localStorage.removeItem("dispatch_panel_type");
  localStorage.removeItem(STORAGE_KEY);

  setDispatchStarted(false);

  setDispatchData({
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

  setManualPanel("");
  setScannerInput("");

  window.location.href = "/dispatch/list";
};

  const scanProgress =
    targetCount > 0 ? Math.min((totalScanned / targetCount) * 100, 100) : 0;

  return (
    <Fragment>
      <PageHeader
        title="Dispatch Panel"
        subtitle="Scan panels with gun or QR camera after starting dispatch"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Dispatch", to: "/dispatch/list" },
          { label: "Create Dispatch" },
        ]}
      />

      <div className="row">
        <div className="col-lg-12">
          <div className="card klk-form-card klk-dispatch-form">
            <div className="card-body">
              {/* ── Dispatch details ── */}
              <div className="klk-dispatch-details">
              <form onSubmit={handleStartDispatch}>
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
                        disabled={dispatchStarted}
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
                        disabled={dispatchStarted}
                        required
                      >
                        <option value="">Select State / UT</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">
                          Dadra and Nagar Haveli and Daman and Diu
                        </option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
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
                        disabled={dispatchStarted}
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
                        disabled={dispatchStarted}
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
                        disabled={dispatchStarted}
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
                        disabled={dispatchStarted}
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
                        disabled={dispatchStarted}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="klk-dispatch-details__actions">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={dispatchStarted}
                  >
                    {dispatchStarted ? "Dispatch Started" : "Start Dispatch"}
                  </button>
                </div>
              </form>
              </div>

              {/* ── Scan panels ── */}
              <div className="klk-form-section">
                <div className="klk-form-section__head">
                  <h5 className="klk-form-section__title">Scan Panels</h5>
                  <span
                    className={`klk-dispatch-status ${
                      dispatchStarted
                        ? "klk-dispatch-status--active"
                        : "klk-dispatch-status--idle"
                    }`}
                  >
                    <i className={`fa fa-${dispatchStarted ? "check-circle" : "lock"}`} />
                    {dispatchStarted ? "Scanning enabled" : "Waiting to start"}
                  </span>
                </div>

                {!dispatchStarted && (
                  <div className="klk-scan-locked__overlay">
                    <i className="fa fa-info-circle" />
                    Fill dispatch details above and click Start Dispatch to enable scanning
                  </div>
                )}

                <div className={`klk-scan-locked${!dispatchStarted ? " is-disabled" : ""}`}>
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
                        autoFocus={dispatchStarted}
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
                        onBlur={dispatchStarted ? forceFocus : undefined}
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

                  {dispatchStarted && (
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
                  )}

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
                            onRemove={
                              dispatchStarted ? (code) => removePanel(code, "DCR") : undefined
                            }
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
                            onRemove={
                              dispatchStarted ? (code) => removePanel(code, "NON_DCR") : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="klk-form-actions klk-dispatch-actions">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleEndDispatch}
                  disabled={!dispatchStarted || totalScanned === 0}
                >
                  End Dispatch
                  {dispatchStarted && totalScanned > 0 && (
                    <span className="badge bg-light text-success">
                      {totalScanned} panel{totalScanned !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DispatchPanel;
