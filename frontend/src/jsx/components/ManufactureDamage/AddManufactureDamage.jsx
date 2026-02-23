import { Fragment, useState, useRef, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";
import jsQR from "jsqr";

const AddManufactureDamage = () => {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannerInput, setScannerInput] = useState("");

  const [damageData, setDamageData] = useState({
    panels: [],
    damageType: "",
    remarks: "",
  });

  /* CLEANUP */
  useEffect(() => {
    return () => stopScan();
  }, []);

  /* START SCAN */
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

  /* SCAN FRAME */
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

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const code = jsQR(
      imageData.data,
      canvas.width,
      canvas.height
    );

    if (code) {
      savePanel(code.data);
      stopScan();
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  /* STOP CAMERA */
  const stopScan = () => {
    streamRef.current?.getTracks().forEach((t) =>
      t.stop()
    );
    streamRef.current = null;
    setScanning(false);
  };

  /* SAVE PANEL */
  const savePanel = (panelCode) => {
    if (!panelCode) return;

    const panelObj = {
      code: panelCode,
      time: new Date().toLocaleString(),
    };

    setDamageData((prev) => ({
      ...prev,
      panels: [...prev.panels, panelObj],
    }));
  };

  /* SCANNER ADD */
  const handleScannerInput = (code) => {
    if (!code.trim()) return;

    savePanel(code.trim());
    setScannerInput("");
  };

  /* MANUAL ADD */
  const addManualPanel = () => {
    if (!manualCode.trim())
      return alert("Enter panel code");

    savePanel(manualCode.trim());
    setManualCode("");
  };

  /* SUBMIT */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (damageData.panels.length === 0) {
      return alert("No panels added");
    }

    const payload = damageData.panels.map((p) => ({
      panel_no: p.code,
      damage_type: damageData.damageType,
      remarks: damageData.remarks,
    }));

    console.log("Submitted:", payload);

    alert("Manufacture Damage Saved");

    setDamageData({
      panels: [],
      damageType: "",
      remarks: "",
    });
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Manufacture Damage"
        motherMenu="Production"
        pageContent="Manufacture Damage Panel"
      />

      <div className="card">
        <div className="card-header">
          <h4>Manufacture Damage Panel</h4>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* SCANNER + QR + MANUAL */}
            <div className="row mb-3">

              {/* SCANNER */}
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Scan panel"
                  value={scannerInput}
                  onChange={(e) =>
                    setScannerInput(e.target.value)
                  }
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
                  onChange={(e) =>
                    setManualCode(e.target.value)
                  }
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

            {/* CAMERA */}
            {scanning && (
              <div className="text-center mb-3">
                <video
                  ref={videoRef}
                  style={{ width: 300 }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {/* DAMAGE TYPE */}
            <div className="mb-3">
              <label>Damage Type</label>
              <select
                className="form-control"
                value={damageData.damageType}
                onChange={(e) =>
                  setDamageData({
                    ...damageData,
                    damageType: e.target.value,
                  })
                }
              >
                <option value="">
                  Select Damage Type
                </option>
                <option>Crack</option>
                <option>Broken Glass</option>
                <option>Scratch</option>
                <option>Cell Damage</option>
              </select>
            </div>

            {/* REMARKS */}
            <div className="mb-3">
              <label>Remarks</label>
              <textarea
                className="form-control"
                rows="3"
                value={damageData.remarks}
                onChange={(e) =>
                  setDamageData({
                    ...damageData,
                    remarks: e.target.value,
                  })
                }
              />
            </div>

          
            <div className="text-center">
              <button className="btn btn-danger">
                Submit Damage Panels
              </button>
            </div>

          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default AddManufactureDamage;