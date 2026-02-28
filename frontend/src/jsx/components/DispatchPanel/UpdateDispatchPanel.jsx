import { Fragment, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageTitle from "../../layouts/PageTitle";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

const UpdateDispatchPanel = () => {
  const { id } = useParams();

  const scannerRef = useRef(null);
  const lastScannedRef = useRef("");

  const [loading, setLoading] = useState(true);
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

  /* ---------------- FETCH EXISTING DATA ---------------- */
  useEffect(() => {
    fetchDispatchDetails();
    return () => stopScan();
  }, []);

const fetchDispatchDetails = async () => {
  try {
    const token = localStorage.getItem("token");

    /* ================= FETCH DISPATCH DETAILS ================= */
    const dispatchRes = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const dispatchInfo = dispatchRes.data?.data || {};

    /* ================= FETCH PANELS (LOT TABLE) ================= */
    const panelRes = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel-lot/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const panels = panelRes.data?.data || [];

    console.log("Dispatch Info:", dispatchInfo);
    console.log("Panel List:", panels);

    /* ================= SEPARATE DCR / NON-DCR ================= */
    const dcr = panels
      .filter((p) => Number(p.dispatch_panel_type) === 1)
      .map((p) => p.panel_unique_no);

    const nonDcr = panels
      .filter((p) => Number(p.dispatch_panel_type) === 2)
      .map((p) => p.panel_unique_no);

    /* ================= SET STATE ================= */
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
  } finally {
    setLoading(false);
  }
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

  /* ---------------- SAVE PANEL ---------------- */
  const savePanel = async (panelCode) => {
    if (!panelCode) return;

    if (lastScannedRef.current === panelCode) return;
    lastScannedRef.current = panelCode;
    setTimeout(() => (lastScannedRef.current = ""), 500);

    if (
      dispatchData.dcrPanels.includes(panelCode) ||
      dispatchData.nonDcrPanels.includes(panelCode)
    ) {
      alert("Panel already added");
      return;
    }

    const totalPanels =
      dispatchData.dcrPanels.length + dispatchData.nonDcrPanels.length;

    if (totalPanels >= dispatchData.dispatch_panel_count) {
      alert("Dispatch panel count already reached");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const panel_type = localStorage.getItem("dispatch_panel_type");

      if (!panel_type) {
        alert("Please select DCR / NON_DCR first");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/scan-panel`,
        {
          panel_no: panelCode,
          dispatch_id: id,
          panel_type,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDispatchData((prev) => {
        if (panel_type == 1) {
          return { ...prev, dcrPanels: [...prev.dcrPanels, panelCode] };
        }
        return { ...prev, nonDcrPanels: [...prev.nonDcrPanels, panelCode] };
      });
    } catch (err) {
      alert(err.response?.data?.message || "Scan failed");
    }
  };

  /* ---------------- UPDATE DISPATCH ---------------- */
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/update-dispatch-panel/${id}`,
        dispatchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Dispatch updated successfully");
    } catch {
      alert("Update failed");
    }
  };

  /* ---------------- QR FUNCTIONS ---------------- */
  const startScan = async () => {
    setScanning(true);

    const qr = new Html5Qrcode("reader");
    scannerRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: 250 },
        (decodedText) => savePanel(decodedText),
        () => {}
      );
    } catch (err) {
      alert("Camera start failed");
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

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <Fragment>
      <PageTitle
        activeMenu="Update Dispatch"
        motherMenu="Panel Dispatch"
        pageContent="Update Dispatch"
      />

      <div className="card">
        <div className="card-header">
          <h4>Update Dispatch</h4>
        </div>

        <div className="card-body">
          <form onSubmit={handleUpdate}>
            {/* DISPATCH DETAILS FORM */}
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
                  />
                </div>
              ))}

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Dispatch Panel Count
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="dispatch_panel_count"
                  value={dispatchData.dispatch_panel_count}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr />

            {/* PANEL TYPE */}
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

            {/* ADD OPTIONS */}
            <div className="row mb-3 text-center">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Scan panel with scanner"
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
                  className="btn btn-primary px-5"
                  onClick={startScan}
                >
                  Scan Panel QR
                </button>
              </div>

              <div className="col-md-4 d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Panel No"
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
                    <span key={i} className="badge bg-primary me-2 mb-2">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <button className="btn btn-success px-5">
                Update Dispatch
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default UpdateDispatchPanel;