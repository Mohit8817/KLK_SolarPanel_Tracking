import { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Button, Table, Badge, ProgressBar, Alert, ButtonGroup } from "react-bootstrap";
import PageHeader from "../../Common/PageHeader";
import PrintBoxLabel from "./PrintBoxLabel";

const MAX_BOX_CAPACITY = 20;

const PackagingConsole = () => {
  const [activeBoxId, setActiveBoxId] = useState("BOX-" + Date.now().toString().slice(-6));
  const [scannedSerial, setScannedSerial] = useState("");
  const [packingMode, setPackingMode] = useState("COMBO"); // 'COMBO' (10L + 10B), 'LIGHTS', 'BATTERIES', 'FREE'
  const [destinationProject, setDestinationProject] = useState("Rajasthan Smart Highway Project");
  const [tableFilter, setTableFilter] = useState("ALL"); // 'ALL', 'LIGHT', 'BATTERY'

  const [items, setItems] = useState([
    { id: 1, serialNo: "SL24090001", type: "LIGHT", model: "20W Semi Light", qcStatus: "PASSED", time: "12:30:15 PM" },
    { id: 2, serialNo: "BAT24090001", type: "BATTERY", model: "12.8V 30Ah Battery", qcStatus: "PASSED", time: "12:30:45 PM" },
  ]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus barcode input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [items.length]);

  // Derived counts
  const totalCount = items.length;
  const lights = items.filter((i) => i.type === "LIGHT");
  const batteries = items.filter((i) => i.type === "BATTERY");
  const lightsCount = lights.length;
  const batteriesCount = batteries.length;
  const isFull = totalCount >= MAX_BOX_CAPACITY;
  const progressPercent = Math.round((totalCount / MAX_BOX_CAPACITY) * 100);
  const lastScanned = items[0];

  // Gross box weight estimation
  const grossWeight = (lightsCount * 4.5 + batteriesCount * 3.2 + 1.8).toFixed(1);

  // Add Item to Current Box
  const handleScanSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const serial = scannedSerial.trim().toUpperCase();
    if (!serial) return;

    // 1. HARD RULE: Max 20 items per box
    if (totalCount >= MAX_BOX_CAPACITY) {
      setErrorMessage(`BOX CAPACITY FULL! Ek box me maximum ${MAX_BOX_CAPACITY} products hi pack ho sakte hain.`);
      return;
    }

    // 2. Duplicate Check
    if (items.some((i) => i.serialNo === serial)) {
      setErrorMessage(`DUPLICATE: Yeh serial number (${serial}) iss box me already add hai!`);
      return;
    }

    // 3. QC Verification Check (Units must be QC Passed before Packaging)
    if (serial.includes("FAIL") || serial === "SL24090002") {
      setErrorMessage(`QC VERIFICATION FAILED: Unit (${serial}) Quality Check me REJECT hui hai! Sirf QC Passed units pack ho sakti hain.`);
      return;
    }

    // 4. Auto-detect type from prefix or fallback
    const isBattery = serial.startsWith("BAT") || serial.startsWith("B-");
    const itemType = isBattery ? "BATTERY" : "LIGHT";

    // 5. Packing Rule Validations
    if (packingMode === "COMBO") {
      if (itemType === "LIGHT" && lightsCount >= 10) {
        setErrorMessage(`COMBO LIMIT REACHED: 10 Lights ka target complete hai! Ab Batteries scan karein (Remaining: ${10 - batteriesCount}).`);
        return;
      }
      if (itemType === "BATTERY" && batteriesCount >= 10) {
        setErrorMessage(`COMBO LIMIT REACHED: 10 Batteries ka target complete hai! Ab Lights scan karein (Remaining: ${10 - lightsCount}).`);
        return;
      }
    } else if (packingMode === "LIGHTS" && isBattery) {
      setErrorMessage(`MODE MISMATCH: Current rule "Pure Lights" hai! Battery pack pack nahi kiya ja sakta.`);
      return;
    } else if (packingMode === "BATTERIES" && !isBattery) {
      setErrorMessage(`MODE MISMATCH: Current rule "Pure Batteries" hai! Street light pack nahi ki ja sakti.`);
      return;
    }

    const newItem = {
      id: Date.now(),
      serialNo: serial,
      type: itemType,
      model: isBattery ? "12.8V 30Ah Battery" : "20W Street Light",
      qcStatus: "PASSED",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setItems((prev) => [newItem, ...prev]);
    setScannedSerial("");
    setSuccessMessage(`Unit "${serial}" successfully packed in box!`);
    if (inputRef.current) inputRef.current.focus();
  };

  // Undo Last Scanned Item
  const handleUndoLast = () => {
    if (items.length === 0) return;
    const lastItem = items[0];
    setItems((prev) => prev.slice(1));
    setErrorMessage("");
    setSuccessMessage(`Last item "${lastItem.serialNo}" removed from box.`);
  };

  // Remove Single Item by ID
  const handleRemove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setErrorMessage("");
  };

  // Seal & Close Box
  const handleSealBox = () => {
    if (items.length === 0) {
      setErrorMessage("Box empty hai! At least 1 item pack karein.");
      return;
    }
    setShowPrintModal(true);
  };

  // Start New Box
  const handleStartNewBox = () => {
    const newId = "BOX-" + Date.now().toString().slice(-6);
    setActiveBoxId(newId);
    setItems([]);
    setErrorMessage("");
    setSuccessMessage(`New box ${newId} started. Ready for scanning.`);
    setShowPrintModal(false);
  };

  // Filtered list for table
  const displayedItems = items.filter((item) => {
    if (tableFilter === "ALL") return true;
    return item.type === tableFilter;
  });

  return (
    <div className="packaging-console">
      {/* Header */}
      <PageHeader
        title="Smart Box Packaging Console"
        subtitle="Pack QC Passed Lights & Batteries into shipping boxes (Maximum 20 units per box, mixed allowed)"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Packaging" },
          { label: "Packaging Console" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 bg-white border rounded px-3 py-1 shadow-sm">
              <span className="text-muted small">Active Box:</span>
              <Badge bg="dark" className="fs-13 font-monospace py-1 px-2">{activeBoxId}</Badge>
            </div>
          </div>
        }
      />

      {/* Packaging Mode & Destination Toolbar */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="py-2 px-3">
          <Row className="align-items-center g-2">
            <Col md={7} className="d-flex align-items-center flex-wrap gap-2">
              <span className="fs-12 fw-bold text-muted text-uppercase">Packing Mode:</span>
              <ButtonGroup size="sm">
                <Button
                  variant={packingMode === "COMBO" ? "primary" : "outline-secondary"}
                  onClick={() => setPackingMode("COMBO")}
                  className="fw-semibold"
                >
                  <i className="fa-solid fa-layer-group me-1"></i> Combo (10L + 10B)
                </Button>
                <Button
                  variant={packingMode === "LIGHTS" ? "warning" : "outline-secondary"}
                  onClick={() => setPackingMode("LIGHTS")}
                  className={packingMode === "LIGHTS" ? "text-dark fw-semibold" : "fw-semibold"}
                >
                  <i className="fa-solid fa-lightbulb me-1"></i> Pure Lights (20)
                </Button>
                <Button
                  variant={packingMode === "BATTERIES" ? "info" : "outline-secondary"}
                  onClick={() => setPackingMode("BATTERIES")}
                  className={packingMode === "BATTERIES" ? "text-dark fw-semibold" : "fw-semibold"}
                >
                  <i className="fa-solid fa-car-battery me-1"></i> Pure Batteries (20)
                </Button>
                <Button
                  variant={packingMode === "FREE" ? "secondary" : "outline-secondary"}
                  onClick={() => setPackingMode("FREE")}
                  className="fw-semibold"
                >
                  Free Mix
                </Button>
              </ButtonGroup>
            </Col>

            <Col md={5} className="d-flex justify-content-md-end align-items-center gap-2">
              <span className="fs-12 text-muted">Project:</span>
              <Form.Select
                size="sm"
                value={destinationProject}
                onChange={(e) => setDestinationProject(e.target.value)}
                style={{ maxWidth: 220 }}
              >
                <option value="Rajasthan Smart Highway Project">Rajasthan Smart Highway</option>
                <option value="UP Rural Solar Electrification">UP Rural Solar Grid</option>
                <option value="MP Urban Streetlight Phase 2">MP Urban Streetlight</option>
                <option value="Gujarat Industrial Park">Gujarat Industrial Park</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Alerts */}
      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage("")} className="py-2 px-3 fs-13 mb-3">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="py-2 px-3 fs-13 mb-3">
          <i className="fa-solid fa-circle-check me-2"></i>
          {successMessage}
        </Alert>
      )}

      {/* Main Capacity & Progress Banner */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3 p-md-4">
          <Row className="align-items-center mb-3">
            <Col md={6}>
              <h4 className="fw-bold mb-1">
                Box Capacity:{" "}
                <span className={isFull ? "text-danger" : "text-primary"}>
                  {totalCount} / {MAX_BOX_CAPACITY} Units
                </span>
                {isFull && (
                  <Badge bg="success" className="ms-2 fs-12 align-middle">
                    <i className="fa-solid fa-check me-1"></i> FULL &amp; READY TO SEAL
                  </Badge>
                )}
              </h4>
              <p className="text-muted mb-0 fs-13">
                {packingMode === "COMBO"
                  ? "Combo Target: 10 Solar Lights + 10 Battery Packs (20 units per carton)."
                  : "Rule: Maximum 20 items per box."}
              </p>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <Badge bg="warning" text="dark" className="p-2 fs-13 me-2 border">
                <i className="fa-solid fa-lightbulb me-1"></i> Lights: {lightsCount}
                {packingMode === "COMBO" && <small className="text-muted"> / 10</small>}
              </Badge>
              <Badge bg="info" text="dark" className="p-2 fs-13 me-2 border">
                <i className="fa-solid fa-car-battery me-1"></i> Batteries: {batteriesCount}
                {packingMode === "COMBO" && <small className="text-muted"> / 10</small>}
              </Badge>
              <Badge bg={isFull ? "success" : "secondary"} className="p-2 fs-13 me-2">
                Remaining: {MAX_BOX_CAPACITY - totalCount} Slots
              </Badge>
              <Badge bg="light" text="dark" className="p-2 fs-13 border">
                Gross: ~{grossWeight} KG
              </Badge>
            </Col>
          </Row>

          <ProgressBar
            now={progressPercent}
            variant={isFull ? "danger" : progressPercent >= 75 ? "warning" : "success"}
            animated={!isFull}
            style={{ height: "12px" }}
          />
        </Card.Body>
      </Card>

      {/* Barcode Scanner Input Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleScanSubmit}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fs-12 fw-bold text-muted text-uppercase">
                <i className="fa-solid fa-barcode text-primary me-1"></i> Barcode Gun Scanner Input
              </span>
              <div className="d-flex gap-2 align-items-center">
                {items.length > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-muted fs-12 text-decoration-none"
                    onClick={handleUndoLast}
                  >
                    <i className="fa-solid fa-rotate-left me-1"></i> Undo Last
                  </Button>
                )}
                <span className="text-muted fs-12">Press Enter after scan</span>
              </div>
            </div>

            <Row className="g-2 align-items-center">
              <Col md={8}>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="fa-solid fa-barcode text-primary"></i>
                  </span>
                  <Form.Control
                    ref={inputRef}
                    size="lg"
                    type="text"
                    placeholder={
                      isFull
                        ? "Box Full (20/20 reached) - Please Seal Box"
                        : "Scan Barcode Gun (e.g. SL24090005, BAT24090005)..."
                    }
                    value={scannedSerial}
                    onChange={(e) => setScannedSerial(e.target.value)}
                    disabled={isFull}
                    autoFocus
                  />
                </div>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-50 fw-semibold"
                  disabled={isFull || !scannedSerial.trim()}
                >
                  <i className="fa-solid fa-plus me-1"></i> Pack
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  className="w-50 fw-bold"
                  onClick={handleSealBox}
                  disabled={totalCount === 0}
                >
                  <i className="fa-solid fa-box-archive me-1"></i> Seal Box ({totalCount})
                </Button>
              </Col>
            </Row>
          </Form>

          {/* Last Scanned Item Banner */}
          {lastScanned && (
            <div className="d-flex align-items-center justify-content-between mt-3 p-2 border rounded fs-13">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-circle-check text-success fs-16"></i>
                <span className="text-muted">Last Packed:</span>
                <strong className="font-monospace text-primary fs-14">{lastScanned.serialNo}</strong>
                <Badge bg={lastScanned.type === "LIGHT" ? "warning" : "info"} text="dark">
                  {lastScanned.type === "LIGHT" ? "Street Light" : "Battery Pack"}
                </Badge>
                <span className="text-muted fs-12 d-none d-md-inline">({lastScanned.model})</span>
              </div>
              <Badge bg="success" className="fs-11">
                <i className="fa-solid fa-check me-1"></i> QC PASSED
              </Badge>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Scanned Items in Active Box */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 fw-bold">Items Inside Active Box ({totalCount} Scanned)</h5>
            <div className="btn-group btn-group-sm ms-2">
              <Button
                variant={tableFilter === "ALL" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setTableFilter("ALL")}
              >
                All ({totalCount})
              </Button>
              <Button
                variant={tableFilter === "LIGHT" ? "warning" : "outline-secondary"}
                size="sm"
                className={tableFilter === "LIGHT" ? "text-dark" : ""}
                onClick={() => setTableFilter("LIGHT")}
              >
                Lights ({lightsCount})
              </Button>
              <Button
                variant={tableFilter === "BATTERY" ? "info" : "outline-secondary"}
                size="sm"
                className={tableFilter === "BATTERY" ? "text-dark" : ""}
                onClick={() => setTableFilter("BATTERY")}
              >
                Batteries ({batteriesCount})
              </Button>
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {isFull ? (
              <Badge bg="success" className="p-2 fs-12">
                <i className="fa-solid fa-check me-1"></i> Ready to Seal (20 Units Complete)
              </Badge>
            ) : (
              <span className="text-muted fs-12">{MAX_BOX_CAPACITY - totalCount} units remaining to fill box</span>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
            <Table hover className="align-middle mb-0">
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th>Serial Number</th>
                  <th>Product Type</th>
                  <th>Model / Specs</th>
                  <th>QC Status</th>
                  <th>Scanned Time</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Koi item scan nahi hua. Barcode scanner gun se items scan karein.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="fw-bold ps-3">{displayedItems.length - idx}</td>
                      <td className="font-monospace fw-bold text-primary">{item.serialNo}</td>
                      <td>
                        <Badge
                          bg={item.type === "LIGHT" ? "warning" : "info"}
                          text="dark"
                          className="fs-12"
                        >
                          <i className={`fa-solid ${item.type === "LIGHT" ? "fa-lightbulb" : "fa-car-battery"} me-1`}></i>
                          {item.type === "LIGHT" ? "Street Light" : "Battery Pack"}
                        </Badge>
                      </td>
                      <td>{item.model}</td>
                      <td>
                        <Badge bg="success" className="fs-12">
                          <i className="fa-solid fa-check me-1"></i> QC PASSED
                        </Badge>
                      </td>
                      <td className="text-muted fs-12">{item.time}</td>
                      <td className="text-end pe-3">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                          title="Remove item"
                          className="py-0 px-2"
                        >
                          <i className="fa-solid fa-trash fs-12"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Print Box Label Modal */}
      <PrintBoxLabel
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
        boxData={{
          boxId: activeBoxId,
          totalCount,
          lightsCount,
          batteriesCount,
          grossWeight,
          project: destinationProject,
          items,
        }}
        onBoxSealed={handleStartNewBox}
      />
    </div>
  );
};

export default PackagingConsole;