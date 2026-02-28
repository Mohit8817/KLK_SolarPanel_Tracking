import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

const DispatchPanel = () => {
  const scannerRef = useRef(null);
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

  /* ================= LOAD STORAGE ================= */
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) setDispatchData(JSON.parse(savedData));
  }, []);

  /* ================= SAVE STORAGE ================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dispatchData));
  }, [dispatchData]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => stopScan();
  }, []);

  /* ================= START QR SCANNER ================= */
  const startScan = async () => {
    if (!dispatchStarted || !dispatchData.dispatchType) {
      alert("Please start dispatch & select panel type first.");
      return;
    }

    if (scannerRef.current) return;

    setScanning(true);

    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("reader");
        scannerRef.current = qr;

        await qr.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            console.log("Scanned:", decodedText);
            savePanel(decodedText);
          },
          (err) => {}
        );
      } catch (err) {
        console.log("Camera failed:", err);
        setScanning(false);
      }
    }, 300);
  };

  /* ================= STOP SCANNER ================= */
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
      alert("Select DCR / NON_DCR first");
      return;
    }

    if (lastScannedRef.current === panelCode) return;
    lastScannedRef.current = panelCode;
    setTimeout(() => (lastScannedRef.current = ""), 500);

    if (
      dispatchData.dcrPanels.includes(panelCode) ||
      dispatchData.nonDcrPanels.includes(panelCode)
    ) {
      alert("Panel already scanned");
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
    } catch (err) {
      alert(err.response?.data?.message || "Scan failed");
    }
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dispatchType") {
      localStorage.setItem(
        "dispatch_panel_type",
        value === "DCR" ? 1 : 2
      );
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
        dispatch_panel_count: dispatchData.dispatch_panel_count,
        company_id: sessionUser?.company_id,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/create-dispatch-panel`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("dispatch_main_id", res.data.data.dispatch_id);
      setDispatchStarted(true);
      alert("Dispatch Started Successfully");
    } catch (err) {
      alert("Failed to start dispatch");
    }
  };

  /* ================= END DISPATCH ================= */
const handleEndDispatch = async (e) => {
  e.preventDefault();
  await stopScan();

  try {
    const token = localStorage.getItem("token");
    const dispatch_id = localStorage.getItem("dispatch_main_id");

    const totalPanels =
      (dispatchData.dcrPanels?.length || 0) +
      (dispatchData.nonDcrPanels?.length || 0);

    // ❗ Only check if nothing scanned
    if (totalPanels === 0) {
      alert("No panels scanned");
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_BACKEND_API_URL}dispatch/end-dispatch-panel`,
      {
        dispatch_id,
        dispatch_panel_count: totalPanels, // actual scanned count
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(`Dispatch completed with ${totalPanels} panels`);

    localStorage.removeItem("dispatch_main_id");
    localStorage.removeItem("dispatch_panel_type");
    localStorage.removeItem(STORAGE_KEY);

    window.location.href = "/dispatch/list";

  } catch (err) {
    console.log(err.response?.data);
    alert("Failed to finalize dispatch");
  }
};

  return (
    <Fragment>
      <PageTitle
        activeMenu="Dispatch Panel"
        motherMenu="Panel Dispatch"
        pageContent="Panel Dispatch"
      />

      <div className="container mt-4">
        <div className="card p-4">

          {/* START FORM */}
          <form onSubmit={handleStartDispatch}>
           <div className="row">

  {/* DISPATCH ID */}
  <div className="col-md-6 mb-3">
    <label className="form-label">DISPATCH ID</label>
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

  {/* STATE SELECT */}
  <div className="col-md-6 mb-3">
    <label className="form-label">STATE *</label>

<select
  className="form-control"
  name="state"
  value={dispatchData.state}
  onChange={handleChange}
  disabled={dispatchStarted}
  required
>
  <option value="">-- Select State / UT --</option>

  {/* STATES */}
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

  {/* UNION TERRITORIES */}
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

  {/* TRUCK NO */}
  <div className="col-md-6 mb-3">
    <label className="form-label">TRUCK NO</label>
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

  {/* DRIVER NO */}
  <div className="col-md-6 mb-3">
    <label className="form-label">DRIVER NO</label>
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

  {/* DRIVER NAME */}
  <div className="col-md-6 mb-3">
    <label className="form-label">DRIVER NAME</label>
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

  {/* CHALLAN NO */}
  <div className="col-md-6 mb-3">
    <label className="form-label">CHALLAN NO</label>
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

  {/* PANEL COUNT */}
  <div className="col-md-6 mb-3">
    <label className="form-label">Dispatch Panel Count *</label>
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

            <div className="text-center">
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

          {/* SCAN SECTION */}
          <fieldset disabled={!dispatchStarted}>

            {/* TYPE */}

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
                        hidden
                        name="dispatchType"
                        value={type}
                        checked={isActive}
                        onChange={handleChange}
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* SCANNER INPUT */}
            <div className="row mb-3 text-center">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Scan with scanner gun"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      savePanel(scannerInput.trim());
                      setScannerInput("");
                    }
                  }}
                />
              </div>

              <div className="col-md-4">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startScan}
                >
                  Start QR Camera
                </button>
                {scanning && (
                  <button
                    type="button"
                    className="btn btn-danger ms-2"
                    onClick={stopScan}
                  >
                    Stop
                  </button>
                )}
              </div>

              <div className="col-md-4 d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Manual Panel No"
                  value={manualPanel}
                  onChange={(e) => setManualPanel(e.target.value)}
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

            {/* CAMERA */}
            {scanning && (
              <div className="text-center mb-3">
                <div id="reader" style={{ width: 320, margin: "auto" }} />
              </div>
            )}

            {/* PANEL LIST */}
            <div className="row mt-4">
              <div className="col-md-6">
                <h6>DCR Panels ({dispatchData.dcrPanels.length})</h6>
                {dispatchData.dcrPanels.map((p, i) => (
                  <span key={i} className="badge bg-success me-2 mb-2">
                    {p}
                  </span>
                ))}
              </div>

              <div className="col-md-6">
                <h6>NON-DCR Panels ({dispatchData.nonDcrPanels.length})</h6>
                {dispatchData.nonDcrPanels.map((p, i) => (
                  <span key={i} className="badge bg-info me-2 mb-2">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                className="btn btn-success px-5"
                onClick={handleEndDispatch}
              >
                End Dispatch
              </button>
            </div>

          </fieldset>

        </div>
      </div>
    </Fragment>
  );
};

export default DispatchPanel;