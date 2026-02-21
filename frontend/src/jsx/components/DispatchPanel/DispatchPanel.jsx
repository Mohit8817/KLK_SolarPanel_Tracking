import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

const DispatchPanel = () => {
  const scannerRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const lastScannedRef = useRef("");

  const [scanning, setScanning] = useState(false);
  const [dispatchStarted, setDispatchStarted] = useState(false);
  const [manualPanel, setManualPanel] = useState("");
  const [scannerInput, setScannerInput] = useState("");

  const STORAGE_KEY = "dispatchPanelData";

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

  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setDispatchData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, []);

  /* ---------------- SAVE TO LOCAL STORAGE ---------------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dispatchData));
  }, [dispatchData]);

  /* ---------------- STOP SCANNER ON UNMOUNT ---------------- */
  useEffect(() => {
    return () => stopScan();
  }, []);

  /* ---------------- START QR SCANNER ---------------- */
  const startScan = async () => {
    if (!dispatchStarted) return;

    setScanning(true);

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          savePanel(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.log("Camera start failed:", err);
      setScanning(false);
    }
  };

  /* ---------------- STOP QR SCANNER ---------------- */
  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  /* ---------------- SAVE PANEL ---------------- */
  const savePanel = async (panelCode) => {
    if (!panelCode) return;

    // prevent rapid duplicate scans
    if (lastScannedRef.current === panelCode) return;
    lastScannedRef.current = panelCode;

    setTimeout(() => {
      lastScannedRef.current = "";
    }, 500);

    if (
      dispatchData.dcrPanels.includes(panelCode) ||
      dispatchData.nonDcrPanels.includes(panelCode)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const dispatch_id = localStorage.getItem("dispatch_main_id");
      const panel_type = localStorage.getItem("dispatch_panel_type");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/scan-panel`,
        {
          panel_no: panelCode,
          dispatch_id,
          panel_type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDispatchData((prev) => {
        if (panel_type == 1) {
          return { ...prev, dcrPanels: [...prev.dcrPanels, panelCode] };
        }
        return { ...prev, nonDcrPanels: [...prev.nonDcrPanels, panelCode] };
      });
    } catch (err) {
      console.log("Scan error:", err.response?.data?.message);
    }
  };

  /* ---------------- SCANNER GUN INPUT ---------------- */
  const handleScannerInput = async (panelCode) => {
    if (!panelCode) return;
    await savePanel(panelCode);
  };

  /* ---------------- MANUAL ADD ---------------- */
  const handleManualAdd = async () => {
    if (!manualPanel.trim()) return;
    await savePanel(manualPanel.trim());
    setManualPanel("");
  };

  /* ---------------- INPUT CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dispatchType") {
      const typeValue = value === "DCR" ? 1 : 2;
      localStorage.setItem("dispatch_panel_type", typeValue);
    }

    setDispatchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- START DISPATCH ---------------- */
  const handleStartDispatch = async (e) => {
    e.preventDefault();

    try {
      const sessionUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      const company_id = sessionUser?.company_id;

      const payload = {
        dispatch_id: dispatchData.dispatch_id,
        state: dispatchData.state,
        truck_no: dispatchData.truck_no,
        driver_no: dispatchData.driver_no,
        driver_name: dispatchData.driver_name,
        challan_no: dispatchData.challan_no,
        dispatch_panel_count: dispatchData.dispatch_panel_count,
        company_id,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/create-dispatch-panel`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.setItem("dispatch_main_id", res.data.data.dispatch_id);

      setDispatchStarted(true);
      console.log("Dispatch Started");
    } catch (error) {
      console.log("Failed to start dispatch");
    }
  };

  /* ---------------- END DISPATCH ---------------- */
  const handleEndDispatch = (e) => {
    e.preventDefault();

    localStorage.removeItem("dispatch_main_id");
    localStorage.removeItem("dispatch_panel_type");
    localStorage.removeItem("dispatchPanelData");

    window.location.href = "/view-dispatch";
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Dispatch Panel"
        motherMenu="Panel Dispatch"
        pageContent="Panel Dispatch"
      />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Panel Dispatch</h4>
            </div>

            <div className="card-body">

              {/* START DISPATCH FORM */}
              <form onSubmit={handleStartDispatch}>
                <div className="row">
                  {[
                    "dispatch_id",
                    "state",
                    "truck_no",
                    "driver_no",
                    "driver_name",
                    "challan_no",
                  ].map((field) => (
                    <div className="col-md-6 mb-3" key={field}>
                      <label className="form-label">
                        {field.replace(/_/g, " ").toUpperCase()}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name={field}
                        value={dispatchData[field]}
                        onChange={handleChange}
                        disabled={dispatchStarted}
                        required
                      />
                    </div>
                  ))}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Dispatch Panel Count *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="dispatch_panel_count"
                      value={dispatchData.dispatch_panel_count}
                      onChange={handleChange}
                      disabled={dispatchStarted}
                      required
                    />
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-success px-5"
                    disabled={dispatchStarted}
                  >
                    Start Dispatch
                  </button>
                </div>
              </form>

              <hr />

              {/* SCANNING SECTION */}
              <form onSubmit={handleEndDispatch}>

                <div className="text-center my-3">
                  <label className="form-label">Panel Type *</label>
                  <div className="d-flex justify-content-center gap-3">
                    {["DCR", "NON_DCR"].map((type) => {
                      const isActive = dispatchData.dispatchType === type;
                      return (
                        <label
                          key={type}
                          className={`btn ${
                            isActive
                              ? "btn-outline-success"
                              : "btn-outline-danger"
                          }`}
                          style={{ width: "150px" }}
                        >
                          <input
                            type="radio"
                            name="dispatchType"
                            value={type}
                            hidden
                            checked={isActive}
                            onChange={handleChange}
                          />
                          {type}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="row mb-3 text-center">

                  {/* SCANNER GUN INPUT */}
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Scan panel with scanner"
                      value={scannerInput}
                      autoFocus
                      disabled={!dispatchStarted}
                      onChange={(e) => setScannerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = scannerInput.trim();
                          if (value) {
                            handleScannerInput(value);
                            setScannerInput("");
                          }
                        }
                      }}
                    />
                  </div>

                  {/* QR BUTTON */}
                  <div className="col-md-4">
                    <button
                      type="button"
                      className="btn btn-primary px-5"
                      onClick={startScan}
                      disabled={!dispatchStarted}
                    >
                      Scan Panel QR
                    </button>
                  </div>

                  {/* MANUAL INPUT */}
                  <div className="col-md-4 d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Panel No"
                      value={manualPanel}
                      disabled={!dispatchStarted}
                      onChange={(e) => setManualPanel(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleManualAdd}
                      disabled={!dispatchStarted}
                    >
                      Add
                    </button>
                  </div>

                </div>

                {scanning && (
                  <div className="text-center mb-3">
                    <div id="reader" style={{ width: 320, margin: "auto" }} />
                    <button
                      type="button"
                      className="btn btn-danger mt-2"
                      onClick={stopScan}
                    >
                      Stop Camera
                    </button>
                  </div>
                )}

                {/* PANEL LIST */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <label>DCR Panels ({dispatchData.dcrPanels.length})</label>
                    <div className="border rounded p-3">
                      {dispatchData.dcrPanels.map((p, i) => (
                        <span key={i} className="badge bg-success me-2 mb-2">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label>
                      NON-DCR Panels ({dispatchData.nonDcrPanels.length})
                    </label>
                    <div className="border rounded p-3">
                      {dispatchData.nonDcrPanels.map((p, i) => (
                        <span key={i} className="badge bg-success me-2 mb-2">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-success px-5"
                    disabled={!dispatchStarted}
                  >
                    End Dispatch
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

export default DispatchPanel;
