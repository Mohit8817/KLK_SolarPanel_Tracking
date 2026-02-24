import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import jsQR from "jsqr";

const ReceiveSafePanel = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannerInput, setScannerInput] = useState(""); // ✅ scanner input

  const [safeData, setSafeData] = useState({
    PanelType: "DCR",
    dcrPanels: [],
    nonDcrPanels: [],
    remarks: "",
  });

  /* ===== CLEANUP ===== */
  useEffect(() => {
    return () => stopScan();
  }, []);

  /* ===== START SCAN ===== */
  const startScan = async () => {
    if (scanning) return;
    setScanning(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    videoRef.current.setAttribute("playsinline", true);
    await videoRef.current.play();

    requestAnimationFrame(scanFrame);
  };

  /* ===== SCAN FRAME ===== */
  const scanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      requestAnimationFrame(scanFrame);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      savePanel(code.data);
      stopScan();
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  /* ===== STOP CAMERA ===== */
  const stopScan = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  /* ===== SAVE PANEL ===== */
  const savePanel = (panelCode) => {
    if (!panelCode) return;

    const panelObj = {
      code: panelCode,
      time: new Date().toLocaleString(),
    };

    setSafeData((prev) => {
      if (prev.PanelType === "DCR") {
        return { ...prev, dcrPanels: [...prev.dcrPanels, panelObj] };
      }
      return { ...prev, nonDcrPanels: [...prev.nonDcrPanels, panelObj] };
    });
  };

  /* ===== TYPE CHANGE ===== */
  const handleTypeChange = (e) => {
    setSafeData((prev) => ({
      ...prev,
      PanelType: e.target.value,
    }));
  };

  /* ===== SCANNER ADD ===== */
  const handleScannerInput = (code) => {
    if (!code.trim()) return;
    savePanel(code.trim());
    setScannerInput("");
  };

  /* ===== MANUAL ADD ===== */
  const addManualPanel = () => {
    if (!manualCode.trim()) return alert("Enter panel code");
    savePanel(manualCode.trim());
    setManualCode("");
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const allPanels = [
      ...safeData.dcrPanels.map((p) => ({
        panel_no: p.code,
        panel_type: 1,
        status: "SAFE",
      })),
      ...safeData.nonDcrPanels.map((p) => ({
        panel_no: p.code,
        panel_type: 2,
        status: "SAFE",
      })),
    ];

    if (allPanels.length === 0) {
      return alert("No panels added");
    }

    try {
      for (let panel of allPanels) {
        await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}receive-safe-panel`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              panel_no: panel.panel_no,
              panel_type: panel.panel_type,
              remarks: safeData.remarks,
              status: panel.status,
            }),
          }
        );
      }

      alert("Safe Panels Received Successfully");

      setSafeData({
        PanelType: "DCR",
        dcrPanels: [],
        nonDcrPanels: [],
        remarks: "",
      });

    } catch (error) {
      console.error(error);
      alert(error.message);
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
          <form onSubmit={handleSubmit}>

            {/* PANEL TYPE */}
            <div className="text-center mb-4">
              <label>Panel Type</label>
              <div className="d-flex justify-content-center gap-3">
                {["DCR", "NON_DCR"].map((type) => (
                  <label
                    key={type}
                    className={`btn ${
                      safeData.PanelType === type
                        ? "btn-outline-success"
                        : "btn-outline-danger"
                    }`}
                    style={{ width: 150 }}
                  >
                    <input
                      hidden
                      type="radio"
                      value={type}
                      checked={safeData.PanelType === type}
                      onChange={handleTypeChange}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* SCANNER + QR + MANUAL */}
            <div className="row mb-3">

              {/* SCANNER */}
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
                      handleScannerInput(scannerInput);
                    }
                  }}
                />
              </div>

              {/* QR */}
              <div className="col-md-4">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={startScan}
                >
                  Scan QR
                </button>
              </div>

              {/* MANUAL */}
              <div className="col-md-4 d-flex gap-2">
                <input
                  className="form-control"
                  placeholder="Enter Panel Code"
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
                <video ref={videoRef} style={{ width: 300 }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            )}

            {/* REMARKS */}
            <div className="mb-3">
              <label>Remarks</label>
              <textarea
                className="form-control"
                rows="3"
                value={safeData.remarks}
                onChange={(e) =>
                  setSafeData({ ...safeData, remarks: e.target.value })
                }
              />
            </div>

            {/* PANEL LIST */}
            <div className="row">
              <div className="col-md-6">
                <h6>DCR Panels ({safeData.dcrPanels.length})</h6>
                {safeData.dcrPanels.map((p, i) => (
                  <span key={i} className="badge bg-success m-1">
                    {p.code}
                  </span>
                ))}
              </div>

              <div className="col-md-6">
                <h6>NON-DCR Panels ({safeData.nonDcrPanels.length})</h6>
                {safeData.nonDcrPanels.map((p, i) => (
                  <span key={i} className="badge bg-success m-1">
                    {p.code}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center mt-4">
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