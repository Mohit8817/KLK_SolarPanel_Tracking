import { Fragment, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageTitle from "../../layouts/PageTitle";
import { Html5Qrcode } from "html5-qrcode";

const ReceiveSafePanel = () => {
  const { id } = useParams();

  const html5QrCodeRef = useRef(null);
  const qrRegionId = "qr-reader";

  const [dispatchDetails, setDispatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [scannerInput, setScannerInput] = useState("");
  const [manualCode, setManualCode] = useState("");

  const [panels, setPanels] = useState([]);
  const [remarks, setRemarks] = useState("");

  /* ================= FETCH DISPATCH DETAILS ================= */
  useEffect(() => {
    if (!id) return;

    const fetchDispatchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-recieve-dispatched-panel/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();
        setDispatchDetails(result.data || result);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDispatchData();
  }, [id]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  /* ================= START QR SCAN ================= */
  const startScan = async () => {
    if (scanning) return;

    try {
      setScanning(true);

      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          await addPanel(decodedText);
          stopScan();
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera start failed:", err);
      setScanning(false);
    }
  };

  /* ================= STOP QR SCAN ================= */
  const stopScan = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error("Stop scan error:", err);
    }
    setScanning(false);
  };

  /* ================= ADD PANEL ================= */
  const addPanel = async (panelCode) => {
    if (!panelCode) return;

    // prevent duplicate
    if (panels.includes(panelCode)) {
      alert("Panel already scanned");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/receive-panel-scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dispatch_id: id,
            panel_unique_no: panelCode,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Scan failed");
        return;
      }

      setPanels((prev) => [...prev, panelCode]);

      setDispatchDetails((prev) => ({
        ...prev,
        collect_count: result.collect_count,
      }));

    } catch (error) {
      console.error(error);
    }
  };

  /* ================= MACHINE SCANNER ================= */
  const handleScannerInput = (code) => {
    if (!code.trim()) return;
    addPanel(code.trim());
    setScannerInput("");
  };

  /* ================= MANUAL ENTRY ================= */
  const addManualPanel = () => {
    if (!manualCode.trim()) {
      alert("Enter panel code");
      return;
    }
    addPanel(manualCode.trim());
    setManualCode("");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (panels.length === 0) {
      return alert("No panels scanned");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/complete-receive/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ remarks }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Completion failed");
        return;
      }

      alert("Receive completed successfully!");

      setPanels([]);
      setRemarks("");

    } catch (error) {
      console.error("Complete Error:", error);
      alert("Submission failed");
    }
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Receive Safe Panel"
        motherMenu="Dispatch Panel"
        pageContent="Collect Safe Panels"
      />

      <div className="card">
        <div className="card-header">
          <h4>Receive Safe Panels</h4>
        </div>

        <div className="card-body">

          {loading && <p>Loading dispatch details...</p>}

          {dispatchDetails && (
            <div className="alert alert-info">
              <h6>Dispatch Details</h6>
              <p><strong>Truck:</strong> {dispatchDetails.truck_no}</p>
              <p><strong>Challan:</strong> {dispatchDetails.challan_no}</p>
              <p><strong>Driver:</strong> {dispatchDetails.driver_name} / {dispatchDetails.driver_no}</p>
              <p><strong>Expected Panels:</strong> {dispatchDetails.dispatch_panel_count}</p>
              <p><strong>Scanned Panels:</strong> {panels.length}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="row mb-3">

              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Scan with Scanner"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleScannerInput(scannerInput);
                    }
                  }}
                />
              </div>

              <div className="col-md-4">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={startScan}
                >
                  Scan QR
                </button>
              </div>

              <div className="col-md-4 d-flex gap-2">
                <input
                  className="form-control"
                  placeholder="Manual Panel Code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={addManualPanel}
                >
                  Add
                </button>
              </div>

            </div>

            {scanning && (
              <div className="text-center mb-3">
                <div
                  id="qr-reader"
                  style={{ width: "300px", margin: "0 auto" }}
                ></div>
              </div>
            )}

            <div className="mb-3">
              <label>Remarks</label>
              <textarea
                className="form-control"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <h6>Scanned Panels</h6>
              {panels.map((p, i) => (
                <span key={i} className="badge bg-success m-1">
                  {p}
                </span>
              ))}
            </div>

            <div className="text-center">
              <button className="btn btn-success">
                Submit Safe Panels
              </button>
            </div>

          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default ReceiveSafePanel;