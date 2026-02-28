import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Html5QrcodeScanner } from "html5-qrcode";

const DamagePanel = () => {
  const qrRegionId = "qr-reader";

  const [scannerInput, setScannerInput] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [panels, setPanels] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef(null);

  /* ========= CLEANUP ========= */
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  /* ========= START QR SCANNER ========= */
  const startScan = () => {
    if (scanning) return;

    setScanning(true);

    const scanner = new Html5QrcodeScanner(
      qrRegionId,
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        addPanel(decodedText);
        scanner.clear();
        setScanning(false);
      },
      (error) => {}
    );

    scannerRef.current = scanner;
  };

  /* ========= ADD PANEL ========= */
  const addPanel = (panelCode) => {
    if (!panelCode) return;

    if (panels.includes(panelCode)) {
      alert("Panel already added");
      return;
    }

    setPanels((prev) => [...prev, panelCode]);
  };

  /* ========= MACHINE SCANNER ========= */
  const handleScannerInput = (code) => {
    if (!code.trim()) return;
    addPanel(code.trim());
    setScannerInput("");
  };

  /* ========= MANUAL ENTRY ========= */
  const addManualPanel = () => {
    if (!manualCode.trim()) {
      alert("Enter panel code");
      return;
    }

    addPanel(manualCode.trim());
    setManualCode("");
  };

  /* ========= SUBMIT DAMAGE ========= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (panels.length === 0) {
      return alert("No panels added");
    }

    if (!image) {
      return alert("Please upload damage image");
    }

    try {
      const token = localStorage.getItem("token");

      for (let panel of panels) {
        const formData = new FormData();
        formData.append("panel_no", panel);
        formData.append("damage_location_type", 2);
        formData.append("remarks", remarks);
        formData.append("image", image);

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}damage/create-damage-panel`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Submission failed");
        }
      }

      alert("Damage Report Submitted Successfully");

      setPanels([]);
      setRemarks("");
      setImage(null);

    } catch (error) {
      console.error("Submit Error:", error);
      alert(error.message);
    }
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Damage Panel"
        motherMenu="Panel Management"
        pageContent="Report Damaged Panels"
      />

      <div className="card">
        <div className="card-header">
          <h4>Damage Panel Scan</h4>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* ===== INPUT ROW ===== */}
            <div className="row mb-3">

              {/* Machine Scanner */}
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

              {/* QR Scan Button */}
              <div className="col-md-4">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={startScan}
                >
                  Scan QR
                </button>
              </div>

              {/* Manual Entry */}
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

            {/* ===== CAMERA SECTION ===== */}
            {scanning && (
              <div className="text-center mb-3">
                <div
                  id="qr-reader"
                  style={{ width: "300px", margin: "0 auto" }}
                ></div>
              </div>
            )}

            {/* ===== IMAGE ===== */}
            <div className="mb-3">
              <label>Damage Image *</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
            </div>

            {/* ===== REMARKS ===== */}
            <div className="mb-3">
              <label>Remarks *</label>
              <textarea
                className="form-control"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
              />
            </div>

            {/* ===== PANEL LIST ===== */}
            <div className="mb-3">
              <h6>Added Panels</h6>
              {panels.length === 0 ? (
                <p className="text-muted">No panels added</p>
              ) : (
                panels.map((p, i) => (
                  <span key={i} className="badge bg-danger m-1">
                    {p}
                  </span>
                ))
              )}
            </div>

            {/* ===== SUBMIT ===== */}
            <div className="text-center">
              <button className="btn btn-danger">
                Submit Damage Report
              </button>
            </div>

          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default DamagePanel;