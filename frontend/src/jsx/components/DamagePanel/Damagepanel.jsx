import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Html5QrcodeScanner } from "html5-qrcode";

const DamagePanel = () => {
  const qrRegionId = "qr-reader";

  const [scannerInput, setScannerInput] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [currentRemarks, setCurrentRemarks] = useState("");
  const [scanning, setScanning] = useState(false);
  const [entries, setEntries] = useState([]);

  const scannerRef = useRef(null);
  const imageRef = useRef(null);

  // derived: which code is currently typed (scanner input takes priority)
  const activeCode = scannerInput.trim() || manualCode.trim();

  // Add button enabled only when all three are filled
  const canAdd = activeCode && currentImage && currentRemarks.trim();

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      scannerRef.current?.clear().catch(() => { });
      entries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    };
  }, []);

  /* ===== QR SCANNER ===== */
  const startScan = () => {
    if (scanning) return;
    setScanning(true);

    const scanner = new Html5QrcodeScanner(
      qrRegionId,
      { fps: 10, qrbox: 250, rememberLastUsedCamera: true },
      false
    );

    scanner.render(
      (decodedText) => {
        // QR sets the manual code field so it's visible to the user
        setManualCode(decodedText.trim());
        scanner.clear();
        setScanning(false);
      },
      () => { }
    );

    scannerRef.current = scanner;
  };

  /* ===== ADD ENTRY ===== */
  const addEntry = () => {
    const code = activeCode;
    if (!code || !currentImage || !currentRemarks.trim()) return;

    if (entries.find((e) => e.panelCode === code)) {
      alert(`Panel "${code}" is already added.`);
      return;
    }

    const previewUrl = URL.createObjectURL(currentImage);

    setEntries((prev) => [
      ...prev,
      { panelCode: code, image: currentImage, previewUrl, remarks: currentRemarks },
    ]);

    // reset all fields for next entry
    setScannerInput("");
    setManualCode("");
    setCurrentImage(null);
    setCurrentRemarks("");
    if (imageRef.current) imageRef.current.value = "";
  };

  /* ===== REMOVE ENTRY ===== */
  const removeEntry = (panelCode) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.panelCode === panelCode);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((e) => e.panelCode !== panelCode);
    });
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (entries.length === 0) return alert("No panels added.");

    try {
      const token = localStorage.getItem("token");

      for (const entry of entries) {
        const formData = new FormData();
        formData.append("panel_no", entry.panelCode);
        formData.append("damage_location_type", 2);
        formData.append("remarks", entry.remarks);
        formData.append("image", entry.image);

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}damage/create-damage-panel`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Submission failed");
      }

      alert("Damage Report Submitted Successfully");
      setEntries([]);
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

            {/* ===== ROW 1: SCAN INPUTS ===== */}
            <div className="row mb-3">

              {/* Barcode / HID Scanner */}
              <div className="col-md-4">
                <label className="form-label">Barcode Scanner</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Scan with scanner device"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault(); // prevent accidental submit
                  }}
                />
              </div>

              {/* QR Button */}
              <div className="col-md-4">
                <label className="form-label">QR Code</label>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={startScan}
                  disabled={scanning}
                >
                  {scanning ? "Scanning…" : "Scan QR"}
                </button>
              </div>

              {/* Manual Entry */}
              <div className="col-md-4">
                <label className="form-label">Manual Entry</label>
                <input
                  className="form-control"
                  placeholder="Enter panel code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>

            </div>

            {/* ===== QR CAMERA ===== */}
            {scanning && (
              <div className="text-center mb-3">
                <div id={qrRegionId} style={{ width: "300px", margin: "0 auto" }} />
              </div>
            )}

            {/* ===== ROW 2: IMAGE + REMARKS + ADD BUTTON ===== */}
            <div className="row mb-3 align-items-end">

              {/* Image */}
              <div className="col-md-12">
                <label className="form-label">Damage Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  ref={imageRef}
                  onChange={(e) => setCurrentImage(e.target.files[0] || null)}
                />
              </div>

            </div>

            <div className="row">

              {/* Remarks */}
              <div className="col-md-12">
                <label className="form-label">Remarks *</label>
                <textarea
                  className="form-control"
                  rows="1"
                  value={currentRemarks}
                  onChange={(e) => setCurrentRemarks(e.target.value)}
                  placeholder="Enter remarks for this panel"
                />
              </div>

              {/* ADD Button */}
              <div className=" text-center mt-3">
                <button
                  type="button"
                  className="btn btn-success w-25"
                  onClick={addEntry}
                  disabled={!canAdd}
                >
                  + Add
                </button>
              </div>
            </div>


            {/* ===== ADDED PANELS TABLE ===== */}
            <div className="mb-3">
              <h6>Added Panels</h6>

              {entries.length === 0 ? (
                <p className="text-muted">No panels added yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Panel Code</th>
                        <th>Image</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <tr key={entry.panelCode}>
                          <td>{i + 1}</td>
                          <td>
                            <span className="badge bg-danger">{entry.panelCode}</span>
                          </td>
                          <td>
                            <img
                              src={entry.previewUrl}
                              alt="damage"
                              style={{
                                height: 60,
                                width: 90,
                                objectFit: "cover",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                              onClick={() => window.open(entry.previewUrl, "_blank")}
                              title="Click to enlarge"
                            />
                          </td>
                          <td>{entry.remarks}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeEntry(entry.panelCode)}
                            >
                              Remove
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
              <button
                type="submit"
                className="btn btn-danger"
                disabled={entries.length === 0}
              >
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