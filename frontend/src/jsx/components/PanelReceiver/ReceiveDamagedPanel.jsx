import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Html5Qrcode } from "html5-qrcode";

const DamagePanel = () => {
  const html5QrCodeRef = useRef(null);
  const qrRegionId = "qr-reader";

  const [scanning, setScanning] = useState(false);
  const [scannerInput, setScannerInput] = useState("");
  const [manualCode, setManualCode] = useState("");

  // ── Current entry (before adding to list) ──────────────────────────
  const [currentPanelCode, setCurrentPanelCode] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [currentRemarks, setCurrentRemarks] = useState("");

  // ── Final list of damage entries ────────────────────────────────────
  const [panels, setPanels] = useState([]); // [{ id, panel_code, image, preview, remarks }]

  const fileInputRef = useRef(null);

  /* ========= CLEANUP CAMERA ========= */
  useEffect(() => {
    return () => stopScan();
  }, []);

  /* ========= CLEANUP OBJECT URLS ========= */
  useEffect(() => {
    return () => {
      panels.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
      currentPreview && URL.revokeObjectURL(currentPreview);
    };
    // eslint-disable-next-line
  }, []);

  /* ========= START SCAN ========= */
  const startScan = async () => {
    if (scanning) return;

    try {
      setScanning(true);

      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setCurrentPanelCode(decodedText);
          stopScan();
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera start failed:", err);
      setScanning(false);
    }
  };

  /* ========= STOP SCAN ========= */
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

  /* ========= MACHINE SCANNER (Enter key) ========= */
  const handleScannerInput = (code) => {
    if (!code.trim()) return;
    setCurrentPanelCode(code.trim());
    setScannerInput("");
  };

  /* ========= MANUAL ENTRY -> current panel code ========= */
  const handleManualCode = () => {
    if (!manualCode.trim()) {
      alert("Enter panel code");
      return;
    }
    setCurrentPanelCode(manualCode.trim());
    setManualCode("");
  };

  /* ========= IMAGE SELECT ========= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCurrentImage(file);
    setCurrentPreview(URL.createObjectURL(file));
  };

  /* ========= ADD PANEL TO LIST ========= */
  const addPanelToList = () => {
    if (!currentPanelCode.trim()) {
      return alert("Please scan or enter a panel code first");
    }
    if (panels.some((p) => p.panel_code === currentPanelCode)) {
      return alert("Panel already added");
    }
    if (!currentImage) {
      return alert("Please select a damage image for this panel");
    }
    if (!currentRemarks.trim()) {
      return alert("Please enter remarks for this panel");
    }

    setPanels((prev) => [
      ...prev,
      {
        id: Date.now(),
        panel_code: currentPanelCode,
        image: currentImage,
        preview: currentPreview,
        remarks: currentRemarks,
      },
    ]);

    // reset current entry for next panel
    setCurrentPanelCode("");
    setCurrentImage(null);
    setCurrentPreview(null);
    setCurrentRemarks("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ========= REMOVE PANEL FROM LIST ========= */
  const removePanel = (id) => {
    setPanels((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  /* ========= SUBMIT ALL DAMAGE ENTRIES ========= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (panels.length === 0) {
      return alert("No panels added");
    }

    try {
      const token = localStorage.getItem("token");

      for (let panel of panels) {
        const formData = new FormData();
        formData.append("panel_no", panel.panel_code);
        formData.append("damage_location_type", 3);
        formData.append("remarks", panel.remarks);
        formData.append("image", panel.image);

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
          throw new Error(
            `${panel.panel_code}: ${result.message || "Submission failed"}`
          );
        }
      }

      alert("Damage Report Submitted Successfully");

      panels.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
      setPanels([]);

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
                <label className="form-label small text-muted mb-1">
                  Barcode Scanner
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Scan with scanner device"
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
                <label className="form-label small text-muted mb-1">
                  QR Code
                </label>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={startScan}
                >
                  Scan QR
                </button>
              </div>

              {/* Manual Entry */}
              <div className="col-md-4">
                <label className="form-label small text-muted mb-1">
                  Manual Entry
                </label>
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    placeholder="Enter panel code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleManualCode();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleManualCode}
                  >
                    Use
                  </button>
                </div>
              </div>

            </div>

            {/* ===== CAMERA ===== */}
            {scanning && (
              <div className="text-center mb-3">
                <div
                  id="qr-reader"
                  style={{ width: "300px", margin: "0 auto" }}
                ></div>
              </div>
            )}

            {/* ===== CURRENT ENTRY BUILDER ===== */}
            <div className="border rounded p-3 mb-3">
              <div className="row g-3 align-items-end">

                <div className="col-md-3">
                  <label className="form-label small">Panel Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentPanelCode}
                    placeholder="Scan / enter above"
                    onChange={(e) => setCurrentPanelCode(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small">Damage Image *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small">Remarks *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter remarks for this panel"
                    value={currentRemarks}
                    onChange={(e) => setCurrentRemarks(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-danger w-100"
                    onClick={addPanelToList}
                  >
                    <i className="fa fa-plus me-1"></i> Add More
                  </button>
                </div>

              </div>

              {currentPreview && (
                <div className="mt-3">
                  <span className="small text-muted d-block mb-1">Preview:</span>
                  <img
                    src={currentPreview}
                    alt="preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}
            </div>

            {/* ===== PANEL LIST TABLE ===== */}
            <div className="mb-3">
              <h6>Added Panels</h6>

              {panels.length === 0 ? (
                <p className="text-muted">No panels added</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Panel Code</th>
                        <th>Image</th>
                        <th>Remarks</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {panels.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td><strong>{p.panel_code}</strong></td>
                          <td>
                            <img
                              src={p.preview}
                              alt="damage"
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 4,
                                border: "1px solid #ddd",
                              }}
                            />
                          </td>
                          <td>{p.remarks}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removePanel(p.id)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ===== SUBMIT ===== */}
            <div className="text-center">
              <button className="btn btn-danger" disabled={panels.length === 0}>
                Submit Damage Report ({panels.length})
              </button>
            </div>

          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default DamagePanel;