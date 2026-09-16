import { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Button, Table, Badge, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import QCDetailsModal from "./QCDetailsModal";

// Initial sample items
const DEFAULT_QC_ITEMS = [
  {
    id: 1,
    serialNo: "SL24090001",
    type: "LIGHT",
    model: "20W Solar Street Light",
    status: "PASSED",
    defectReason: "",
    time: "02:15 PM",
    inspector: "Ajay Verma",
    date: "2026-09-10",
  },
  {
    id: 2,
    serialNo: "BAT24090001",
    type: "BATTERY",
    model: "12.8V 30Ah Battery",
    status: "PASSED",
    defectReason: "",
    time: "02:18 PM",
    inspector: "Ajay Verma",
    date: "2026-09-10",
  },
  {
    id: 3,
    serialNo: "SL24090002",
    type: "LIGHT",
    model: "20W Solar Street Light",
    status: "FAILED",
    defectReason: "LED Flicker & Uneven Lumens",
    time: "02:22 PM",
    inspector: "Ajay Verma",
    date: "2026-09-10",
  },
];

const QCInspection = () => {
  // Load saved data or default
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("klk_qc_records");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_QC_ITEMS;
  });

  const [serialNo, setSerialNo] = useState("");
  const [productType, setProductType] = useState("LIGHT"); // "LIGHT" or "BATTERY"
  const [decision, setDecision] = useState("PASSED"); // "PASSED", "REWORK", "FAILED"
  const [defectReason, setDefectReason] = useState("");
  const [alert, setAlert] = useState({ type: "", text: "" });

  // Modal State
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const inputRef = useRef(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("klk_qc_records", JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Quick Stats
  const totalCount = items.length;
  const passedCount = items.filter((i) => i.status === "PASSED").length;
  const reworkCount = items.filter((i) => i.status === "REWORK").length;
  const failedCount = items.filter((i) => i.status === "FAILED").length;

  // Auto detect product type from prefix
  const handleSerialChange = (val) => {
    setSerialNo(val);
    const upper = val.trim().toUpperCase();
    if (upper.startsWith("BAT") || upper.startsWith("B-")) {
      setProductType("BATTERY");
    } else if (upper.startsWith("SL") || upper.startsWith("L-")) {
      setProductType("LIGHT");
    }
  };

  // Save QC Decision
  const handleSave = (targetDecision) => {
    setAlert({ type: "", text: "" });
    const finalDecision = targetDecision || decision;
    const cleanSerial = serialNo.trim().toUpperCase();

    if (!cleanSerial) {
      setAlert({ type: "danger", text: "Pehle Serial Number scan ya enter karein!" });
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    // Duplicate Check
    if (items.some((i) => i.serialNo === cleanSerial)) {
      setAlert({
        type: "warning",
        text: `Serial (${cleanSerial}) already inspect ho chuka hai!`,
      });
      return;
    }

    // If Rework or Failed, check defect reason
    if (finalDecision !== "PASSED" && !defectReason) {
      setAlert({
        type: "danger",
        text: "Kripya Defect Reason select karein!",
      });
      return;
    }

    const newItem = {
      id: Date.now(),
      serialNo: cleanSerial,
      type: productType,
      model: productType === "LIGHT" ? "20W Solar Street Light" : "12.8V 30Ah Battery Pack",
      status: finalDecision,
      defectReason: finalDecision !== "PASSED" ? defectReason : "",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      inspector: "QC Operator",
      testValues:
        productType === "LIGHT"
          ? {
              physical: "Clean surface",
              physicalResult: finalDecision === "PASSED" ? "PASS" : "FAIL",
              lux: "148 lm/W",
              luxResult: finalDecision === "PASSED" ? "PASS" : "FAIL",
              wiring: "Stable 12.0V",
              wiringResult: finalDecision === "PASSED" ? "PASS" : "FAIL",
              sensor: "Sensor OK",
              sensorResult: "PASS",
              ipSeal: "Sealed",
              ipSealResult: "PASS",
            }
          : {
              voltage: "12.84 V",
              voltageResult: finalDecision === "PASSED" ? "PASS" : "FAIL",
              cellDelta: "Delta: 8 mV",
              deltaResult: finalDecision === "PASSED" ? "PASS" : "FAIL",
              bms: "BMS OK",
              bmsResult: finalDecision === "PASSED" ? "PASS" : "FAIL",
              welding: "Solid welds",
              weldingResult: "PASS",
              ir: "11.2 mΩ",
              irResult: "PASS",
            },
    };

    setItems([newItem, ...items]);
    setSerialNo("");
    setDecision("PASSED");
    setDefectReason("");

    setAlert({
      type: finalDecision === "PASSED" ? "success" : "warning",
      text: (
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span>
            <strong>{cleanSerial}</strong> ko <strong>{finalDecision}</strong> mark kar diya gaya hai!
          </span>
          {finalDecision === "PASSED" && (
            <Link to="/light/box/packaging" className="btn btn-success btn-sm py-0 px-2 fs-12">
              <i className="fa-solid fa-box-open me-1"></i> Pack in Box
            </Link>
          )}
        </div>
      ),
    });

    if (inputRef.current) inputRef.current.focus();
  };

  // Remove unit
  const handleDelete = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // View Modal
  const handleOpenDetails = (unit) => {
    setSelectedUnit(unit);
    setShowModal(true);
  };

  return (
    <div className="qc-inspection-page pb-4">
      {/* ── HEADER ── */}
      <PageHeader
        title="Quality Check (QC)"
        subtitle="Assembled Lights aur Batteries ki quick quality testing"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Quality Check" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link to="/light/qc/list" className="btn btn-outline-primary btn-sm">
              <i className="fa-solid fa-list me-1"></i> QC Directory
            </Link>
            <Link to="/light/box/packaging" className="btn btn-success btn-sm">
              <i className="fa-solid fa-box-open me-1"></i> Box Packaging ({passedCount} Ready)
            </Link>
          </div>
        }
      />

      {/* ── 3 CLEAN KPI SUMMARY CARDS ── */}
      <Row className="mb-3 g-3">
        <Col md={4} sm={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted fs-12 fw-semibold text-uppercase">Total Tested</span>
                <h3 className="mb-0 fw-bold text-primary">{totalCount}</h3>
              </div>
              <div className="p-3 rounded-circle bg-primary-subtle text-primary">
                <i className="fa-solid fa-vial-circle-check fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} sm={6}>
          <Card className="border-0 shadow-sm border-start border-success border-4">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted fs-12 fw-semibold text-uppercase">Passed (Ready to Pack)</span>
                <h3 className="mb-0 fw-bold text-success">{passedCount}</h3>
              </div>
              <div className="p-3 rounded-circle bg-success-subtle text-success">
                <i className="fa-solid fa-check fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} sm={12}>
          <Card className="border-0 shadow-sm border-start border-danger border-4">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted fs-12 fw-semibold text-uppercase">Rework &amp; Rejected</span>
                <h3 className="mb-0 fw-bold text-danger">
                  {reworkCount + failedCount}
                  <small className="fs-12 text-muted fw-normal ms-2">
                    ({reworkCount} Rework / {failedCount} Scrap)
                  </small>
                </h3>
              </div>
              <div className="p-3 rounded-circle bg-danger-subtle text-danger">
                <i className="fa-solid fa-triangle-exclamation fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notification Alert */}
      {alert.text && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert({ type: "", text: "" })}
          className="mb-3 py-2 fs-13"
        >
          {alert.text}
        </Alert>
      )}

      {/* ── SIMPLE & EASY TESTING CARD ── */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark fs-15">
            <i className="fa-solid fa-barcode text-primary me-2"></i>
            Quick Unit Testing
          </h5>
          <span className="text-muted fs-12">
            Step 4 of 6: Quality Check
          </span>
        </Card.Header>

        <Card.Body className="p-4">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <Row className="g-3 align-items-center">
              {/* Product Category Toggle */}
              <Col lg={3} md={4}>
                <Form.Label className="fs-12 fw-bold text-muted text-uppercase mb-1">
                  Product Type
                </Form.Label>
                <div className="d-flex gap-1">
                  <Button
                    type="button"
                    variant={productType === "LIGHT" ? "primary" : "outline-primary"}
                    size="sm"
                    className="flex-fill fw-semibold py-2"
                    onClick={() => setProductType("LIGHT")}
                  >
                    <i className="fa-solid fa-solar-panel me-1"></i> Solar Light
                  </Button>
                  <Button
                    type="button"
                    variant={productType === "BATTERY" ? "info" : "outline-info"}
                    size="sm"
                    className={`flex-fill fw-semibold py-2 ${productType === "BATTERY" ? "text-white" : ""}`}
                    onClick={() => setProductType("BATTERY")}
                  >
                    <i className="fa-solid fa-car-battery me-1"></i> Battery
                  </Button>
                </div>
              </Col>

              {/* Serial Number Scanner Input */}
              <Col lg={6} md={8}>
                <Form.Label className="fs-12 fw-bold text-muted text-uppercase mb-1">
                  Barcode / Serial Number
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fa-solid fa-barcode text-primary fs-5"></i>
                  </span>
                  <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="Scan barcode gun ya enter karein (e.g. SL24090005)..."
                    value={serialNo}
                    onChange={(e) => handleSerialChange(e.target.value)}
                    className="font-monospace fw-bold fs-15"
                    autoFocus
                  />
                  {serialNo && (
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setSerialNo("")}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </Button>
                  )}
                </div>
              </Col>

              {/* Sample Quick-Pick Pill Buttons */}
              <Col lg={3} md={12}>
                <Form.Label className="fs-12 fw-bold text-muted text-uppercase mb-1 d-block">
                  Quick Select (Pending)
                </Form.Label>
                <div className="d-flex gap-1 flex-wrap">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-1 px-2 font-monospace fs-11"
                    type="button"
                    onClick={() => {
                      setSerialNo("SL24090005");
                      setProductType("LIGHT");
                    }}
                  >
                    SL24090005
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-1 px-2 font-monospace fs-11"
                    type="button"
                    onClick={() => {
                      setSerialNo("SL24090006");
                      setProductType("LIGHT");
                    }}
                  >
                    SL24090006
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-1 px-2 font-monospace fs-11"
                    type="button"
                    onClick={() => {
                      setSerialNo("BAT24090003");
                      setProductType("BATTERY");
                    }}
                  >
                    BAT24090003
                  </Button>
                </div>
              </Col>
            </Row>

            {/* ── 3 BIG DECISION BUTTONS ── */}
            <div className="border-top mt-4 pt-3">
              <Form.Label className="fs-12 fw-bold text-muted text-uppercase mb-2 d-block">
                QC Decision / Verdict:
              </Form.Label>
              <Row className="g-2">
                <Col md={4}>
                  <Button
                    type="button"
                    variant={decision === "PASSED" ? "success" : "outline-success"}
                    className="w-100 py-3 fw-bold fs-14 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      setDecision("PASSED");
                      setDefectReason("");
                      if (serialNo.trim()) {
                        handleSave("PASSED");
                      }
                    }}
                  >
                    <i className="fa-solid fa-circle-check fs-5"></i>
                    <span>✓ PASS (Ready to Pack)</span>
                  </Button>
                </Col>

                <Col md={4}>
                  <Button
                    type="button"
                    variant={decision === "REWORK" ? "warning" : "outline-warning"}
                    className={`w-100 py-3 fw-bold fs-14 d-flex align-items-center justify-content-center gap-2 ${
                      decision === "REWORK" ? "text-dark" : ""
                    }`}
                    onClick={() => setDecision("REWORK")}
                  >
                    <i className="fa-solid fa-wrench fs-5"></i>
                    <span>⚠ SEND TO REWORK</span>
                  </Button>
                </Col>

                <Col md={4}>
                  <Button
                    type="button"
                    variant={decision === "FAILED" ? "danger" : "outline-danger"}
                    className="w-100 py-3 fw-bold fs-14 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setDecision("FAILED")}
                  >
                    <i className="fa-solid fa-circle-xmark fs-5"></i>
                    <span>✕ REJECT / SCRAP</span>
                  </Button>
                </Col>
              </Row>
            </div>

            {/* If Rework or Reject Selected -> Show Simple Defect Reason */}
            {decision !== "PASSED" && (
              <div className="p-3  rounded-3 mt-3">
                <Row className="g-2 align-items-center">
                  <Col md={8}>
                    <Form.Label className="fs-12 fw-bold text-danger mb-1">
                      Defect Reason *
                    </Form.Label>
                    <Form.Select
                      value={defectReason}
                      onChange={(e) => setDefectReason(e.target.value)}
                      className="fs-13"
                      required
                    >
                      <option value="">-- Defect Reason Select Karein --</option>
                      {productType === "LIGHT" ? (
                        <>
                          <option value="LED Flicker / Uneven Lumens">LED Flicker / Low Lumens</option>
                          <option value="Driver Output Abnormal / Voltage Spike">Driver Output Abnormal / Fluctuation</option>
                          <option value="Sensor Not Triggering">Dusk-to-Dawn Sensor Fault</option>
                          <option value="Physical Body Scratch / Dent">Physical Body Scratch / Dent</option>
                          <option value="Gasket Seal Leakage">Waterproof Gasket Issue</option>
                        </>
                      ) : (
                        <>
                          <option value="Low Voltage (<12.0V)">Low Voltage (&lt;12.0V)</option>
                          <option value="Cell Delta Imbalance (>20mV)">Cell Delta Imbalance (&gt;20mV)</option>
                          <option value="BMS Cutoff Failure">BMS Cutoff Failure</option>
                          <option value="Spot Welding Loose">Spot Welding Loose / Weak</option>
                          <option value="High Internal Resistance">High Internal Resistance (IR)</option>
                        </>
                      )}
                    </Form.Select>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button
                      type="button"
                      variant={decision === "REWORK" ? "warning" : "danger"}
                      className="w-100 py-2 mt-4 fw-bold"
                      onClick={() => handleSave(decision)}
                    >
                      Save {decision}
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* ── RECENT TESTED UNITS TABLE ── */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 fw-bold fs-15 text-dark">
            <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i>
            Recently Inspected Units ({items.length})
          </h5>
          <div className="d-flex gap-2">
            <Link to="/light/qc/list" className="btn btn-outline-primary btn-sm">
              <i className="fa-solid fa-list me-1"></i> Full List
            </Link>
            <Link to="/light/box/packaging" className="btn btn-success btn-sm">
              <i className="fa-solid fa-box-open me-1"></i> Box Packaging
            </Link>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap fs-13">
              <thead className="table-primary fs-12 text-uppercase text-muted">
                <tr>
                  <th>#</th>
                  <th>Serial Number</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Defect / Remarks</th>
                  <th>Tested Time</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Koi unit inspect nahi hui hai. Upar serial scan karke test karein.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="text-muted fw-semibold">{idx + 1}</td>
                      <td>
                        <strong className="font-monospace text-primary">{item.serialNo}</strong>
                      </td>
                      <td>
                        <Badge bg={item.type === "LIGHT" ? "primary" : "info"} className="fs-11">
                          {item.type === "LIGHT" ? "Solar Light" : "Battery"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={
                            item.status === "PASSED"
                              ? "success"
                              : item.status === "REWORK"
                              ? "warning"
                              : "danger"
                          }
                          className="fs-11 px-2 py-1"
                        >
                          {item.status === "PASSED" && "✓ PASSED"}
                          {item.status === "REWORK" && "⚠ REWORK"}
                          {item.status === "FAILED" && "✕ FAILED"}
                        </Badge>
                      </td>
                      <td>
                        {item.defectReason ? (
                          <span className="text-danger fw-semibold">{item.defectReason}</span>
                        ) : (
                          <span className="text-success fs-12">Normal / Passed</span>
                        )}
                      </td>
                      <td className="text-muted">{item.time}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="py-0 px-2 fs-12 me-1"
                          onClick={() => handleOpenDetails(item)}
                          title="View sheet"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="py-0 px-2 fs-12"
                          onClick={() => handleDelete(item.id)}
                          title="Delete from session"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        <Card.Footer className="bg-white border-top py-2 d-flex justify-content-between align-items-center">
          <span className="text-muted fs-12">
            <strong>{passedCount}</strong> units Box Packaging ke liye ready hain.
          </span>
          <Link to="/light/box/packaging" className="btn btn-success btn-sm">
            Proceed to Packaging &rarr;
          </Link>
        </Card.Footer>
      </Card>

      {/* QC Detail Sheet Modal */}
      <QCDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        qcData={selectedUnit}
      />
    </div>
  );
};

export default QCInspection;
