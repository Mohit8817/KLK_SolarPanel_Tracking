import { useState, useRef } from "react";
import { Card, Row, Col, Form, Button, Table, Badge, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import QCDetailsModal from "./QCDetailsModal";

const QCInspection = () => {
  const [poNo, setPoNo] = useState("PO-2026-089");
  const [productType, setProductType] = useState("LIGHT");
  const [model, setModel] = useState("20W Semi-Integrated Street Light");
  const [inspector, setInspector] = useState("QC Engineer (Ajay Verma)");
  const [station, setStation] = useState("Testing Station 1");
  const [scannedSerial, setScannedSerial] = useState("");
  const [decision, setDecision] = useState("PASSED");
  const [defectReason, setDefectReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });

  // Light Test Parameters State
  const [lightChecks, setLightChecks] = useState({
    physical: true,
    ledLux: true,
    wiring: true,
    sensor: true,
    ipSeal: true,
    luxValue: "148 lm/W",
    driverVoltage: "12.0V",
  });

  // Battery Test Parameters State
  const [batteryChecks, setBatteryChecks] = useState({
    voltage: true,
    cellBalance: true,
    bms: true,
    welding: true,
    ir: true,
    packVoltage: "12.84V",
    cellDelta: "8 mV",
    irValue: "11.4 mΩ",
  });

  // Inspected Units Log
  const [inspectedItems, setInspectedItems] = useState([
    {
      id: 1,
      serialNo: "SL24090001",
      type: "LIGHT",
      model: "20W Semi-Integrated Street Light",
      poNo: "PO-2026-089",
      status: "PASSED",
      date: "2026-09-07",
      time: "02:15 PM",
      inspector: "QC Engineer (Ajay Verma)",
      station: "Testing Station 1",
      testValues: {
        physical: "Clean surface, zero blemish",
        physicalResult: "PASS",
        lux: "148 lm/W (2960 lm)",
        luxResult: "PASS",
        wiring: "Output 12.0V stable",
        wiringResult: "PASS",
        sensor: "Sensor response < 2s",
        sensorResult: "PASS",
        ipSeal: "Pressure seal intact",
        ipSealResult: "PASS",
      },
    },
    {
      id: 2,
      serialNo: "BAT24090001",
      type: "BATTERY",
      model: "12.8V 30Ah Battery",
      poNo: "PO-2026-089",
      status: "PASSED",
      date: "2026-09-07",
      time: "02:18 PM",
      inspector: "QC Engineer (Ajay Verma)",
      station: "Testing Station 1",
      testValues: {
        voltage: "12.84 V",
        voltageResult: "PASS",
        cellDelta: "Delta: 8 mV",
        deltaResult: "PASS",
        bms: "Trigger & Recovery OK",
        bmsResult: "PASS",
        welding: "Clean welds, firm hold",
        weldingResult: "PASS",
        ir: "11.4 mΩ",
        irResult: "PASS",
      },
    },
    {
      id: 3,
      serialNo: "SL24090002",
      type: "LIGHT",
      model: "20W Semi-Integrated Street Light",
      poNo: "PO-2026-089",
      status: "FAILED",
      defectReason: "LED Flicker & Uneven Lumens",
      remarks: "Driver fluctuation observed during 30s burn test",
      date: "2026-09-07",
      time: "02:22 PM",
      inspector: "QC Engineer (Ajay Verma)",
      station: "Testing Station 1",
      testValues: {
        physical: "Clean surface",
        physicalResult: "PASS",
        lux: "Flicker < 90 lm/W",
        luxResult: "FAIL",
        wiring: "Voltage spike to 14.5V",
        wiringResult: "FAIL",
        sensor: "Sensor response OK",
        sensorResult: "PASS",
        ipSeal: "Seal OK",
        ipSealResult: "PASS",
      },
    },
  ]);

  const [selectedQCUnit, setSelectedQCUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const serialInputRef = useRef(null);

  // Statistics
  const totalCount = inspectedItems.length;
  const passedCount = inspectedItems.filter((i) => i.status === "PASSED").length;
  const failedCount = inspectedItems.filter((i) => i.status === "FAILED").length;
  const reworkCount = inspectedItems.filter((i) => i.status === "REWORK").length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Auto detect product type when serial barcode is scanned or typed
  const handleSerialChange = (val) => {
    setScannedSerial(val);
    const upper = val.trim().toUpperCase();
    if (upper.startsWith("BAT") || upper.startsWith("B-")) {
      setProductType("BATTERY");
      setModel("12.8V 30Ah Battery Pack");
    } else if (upper.startsWith("SL") || upper.startsWith("L-") || upper.startsWith("AIO")) {
      setProductType("LIGHT");
      setModel("20W Semi-Integrated Street Light");
    }
  };

  const handleSubmitQC = (e) => {
    e.preventDefault();
    setAlertInfo({ type: "", message: "" });

    const serial = scannedSerial.trim().toUpperCase();
    if (!serial) {
      setAlertInfo({ type: "danger", message: "Serial number scan ya enter karein!" });
      return;
    }

    // Check duplicate in this session
    if (inspectedItems.some((i) => i.serialNo === serial)) {
      setAlertInfo({
        type: "warning",
        message: `Serial number ${serial} iss session me already inspect ho chuka hai!`,
      });
      return;
    }

    if (decision === "FAILED" && !defectReason) {
      setAlertInfo({
        type: "danger",
        message: "Rejected / Failed unit ke liye Defect Reason select karein!",
      });
      return;
    }

    // Prepare recorded test values
    let testValues = {};
    if (productType === "LIGHT") {
      testValues = {
        physical: lightChecks.physical ? "Passed visual standard" : "Defect in casing",
        physicalResult: lightChecks.physical ? "PASS" : "FAIL",
        lux: lightChecks.ledLux ? lightChecks.luxValue : "Failed Lux output",
        luxResult: lightChecks.ledLux ? "PASS" : "FAIL",
        wiring: lightChecks.wiring ? `Stable ${lightChecks.driverVoltage}` : "Wiring issue",
        wiringResult: lightChecks.wiring ? "PASS" : "FAIL",
        sensor: lightChecks.sensor ? "Response < 2s" : "Sensor fault",
        sensorResult: lightChecks.sensor ? "PASS" : "FAIL",
        ipSeal: lightChecks.ipSeal ? "Gasket sealed" : "Gasket loose",
        ipSealResult: lightChecks.ipSeal ? "PASS" : "FAIL",
      };
    } else {
      testValues = {
        voltage: batteryChecks.voltage ? batteryChecks.packVoltage : "Abnormal voltage",
        voltageResult: batteryChecks.voltage ? "PASS" : "FAIL",
        cellDelta: batteryChecks.cellBalance ? `Delta: ${batteryChecks.cellDelta}` : "Unbalanced cells",
        deltaResult: batteryChecks.cellBalance ? "PASS" : "FAIL",
        bms: batteryChecks.bms ? "Trigger & Recovery OK" : "BMS cutoff failure",
        bmsResult: batteryChecks.bms ? "PASS" : "FAIL",
        welding: batteryChecks.welding ? "Spot welds firm" : "Poor spot weld",
        weldingResult: batteryChecks.welding ? "PASS" : "FAIL",
        ir: batteryChecks.ir ? batteryChecks.irValue : "High resistance",
        irResult: batteryChecks.ir ? "PASS" : "FAIL",
      };
    }

    const newQCRecord = {
      id: Date.now(),
      serialNo: serial,
      type: productType,
      model,
      poNo,
      status: decision,
      defectReason: decision !== "PASSED" ? defectReason : "",
      remarks,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      inspector,
      station,
      testValues,
    };

    setInspectedItems((prev) => [newQCRecord, ...prev]);
    setScannedSerial("");
    setDefectReason("");
    setRemarks("");
    setDecision("PASSED");

    setAlertInfo({
      type: "success",
      message: `Serial ${serial} successfully marked as ${decision}! ${
        decision === "PASSED" ? "Unit Box Packaging ke liye ready hai." : ""
      }`,
    });

    if (serialInputRef.current) {
      serialInputRef.current.focus();
    }
  };

  const handleOpenDetails = (item) => {
    setSelectedQCUnit(item);
    setShowModal(true);
  };

  return (
    <div className="qc-inspection-console">
      <PageHeader
        title="Quality Check (QC) Testing Console"
        subtitle="Perform quality inspection on assembled Lights & Batteries before sending to Box Packaging"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Quality Check" },
          { label: "QC Inspection" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link to="/light/qc/list" className="btn btn-outline-primary btn-sm">
              <i className="fa-solid fa-list me-1"></i> QC Tested Directory
            </Link>
            <Link to="/light/box/packaging" className="btn btn-success btn-sm">
              <i className="fa-solid fa-box-open me-1"></i> Box Packaging Console
            </Link>
          </div>
        }
      />

      {/* KPI Counters Banner */}
      <Row className="mb-4">
        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">Total Inspected</span>
                <h3 className="mb-0 mt-1 text-primary">{totalCount}</h3>
              </div>
              <div className="rounded-circle p-3 bg-primary-subtle text-primary">
                <i className="fa-solid fa-vial-circle-check fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">QC Passed (Ready to Pack)</span>
                <h3 className="mb-0 mt-1 text-success">{passedCount}</h3>
              </div>
              <div className="rounded-circle p-3 bg-success-subtle text-success">
                <i className="fa-solid fa-circle-check fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">QC Rejected / Failed</span>
                <h3 className="mb-0 mt-1 text-danger">{failedCount}</h3>
              </div>
              <div className="rounded-circle p-3 bg-danger-subtle text-danger">
                <i className="fa-solid fa-circle-xmark fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">Pass Acceptance Rate</span>
                <h3 className="mb-0 mt-1 text-info">{passRate}%</h3>
              </div>
              <div className="rounded-circle p-3 bg-info-subtle text-info">
                <i className="fa-solid fa-chart-pie fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {alertInfo.message && (
        <Alert
          variant={alertInfo.type}
          dismissible
          onClose={() => setAlertInfo({ type: "", message: "" })}
          className="mb-4"
        >
          {alertInfo.message}
        </Alert>
      )}

      {/* Main Inspection Form & Testing Parameters */}
      <Form onSubmit={handleSubmitQC}>
        <Row>
          {/* Left Column: Lot & Serial Details */}
          <Col xl={5} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-barcode me-2 text-primary"></i>
                  1. Scan Serial & Lot Details
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Barcode Scanner Input */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    Unit Barcode / Serial Number *
                  </Form.Label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">
                      <i className="fa-solid fa-barcode text-primary"></i>
                    </span>
                    <Form.Control
                      ref={serialInputRef}
                      type="text"
                      placeholder="Scan Barcode (e.g. SL24090005, BAT24090005)..."
                      value={scannedSerial}
                      onChange={(e) => handleSerialChange(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Barcode scanner gun se scan karein ya manual serial no. enter karein.
                  </Form.Text>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Product Category *</Form.Label>
                      <Form.Select
                        value={productType}
                        onChange={(e) => {
                          setProductType(e.target.value);
                          setModel(
                            e.target.value === "LIGHT"
                              ? "20W Semi-Integrated Street Light"
                              : "12.8V 30Ah Battery Pack"
                          );
                        }}
                      >
                        <option value="LIGHT">Solar Street Light</option>
                        <option value="BATTERY">Battery Pack</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>PO / Work Order No *</Form.Label>
                      <Form.Control
                        type="text"
                        value={poNo}
                        onChange={(e) => setPoNo(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Model Being Tested</Form.Label>
                  <Form.Select value={model} onChange={(e) => setModel(e.target.value)}>
                    {productType === "LIGHT" ? (
                      <>
                        <option value="20W Semi-Integrated Street Light">20W Semi-Integrated Street Light</option>
                        <option value="40W Inbuilt Solar Street Light">40W Inbuilt Solar Street Light</option>
                        <option value="60W Split Solar Street Light">60W Split Solar Street Light</option>
                        <option value="15W All-in-One Solar Light">15W All-in-One Solar Light</option>
                      </>
                    ) : (
                      <>
                        <option value="12.8V 30Ah LiFePO4 Battery Pack">12.8V 30Ah LiFePO4 Battery Pack</option>
                        <option value="12.8V 42Ah LiFePO4 Battery Pack">12.8V 42Ah LiFePO4 Battery Pack</option>
                        <option value="25.6V 50Ah LiFePO4 Battery Pack">25.6V 50Ah LiFePO4 Battery Pack</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Testing Station</Form.Label>
                      <Form.Select value={station} onChange={(e) => setStation(e.target.value)}>
                        <option value="Testing Station 1">Testing Station 1</option>
                        <option value="Testing Station 2">Testing Station 2</option>
                        <option value="Burn-In Aging Chamber">Burn-In Aging Chamber</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Inspector Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={inspector}
                        onChange={(e) => setInspector(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Dynamic Testing Checklist & Decision */}
          <Col xl={7} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-list-check me-2 text-success"></i>
                  2. Quality Check Parameters ({productType === "LIGHT" ? "Light Inspection" : "Battery Inspection"})
                </h5>
                <Badge bg={productType === "LIGHT" ? "primary" : "info"} className="fs-12">
                  {productType === "LIGHT" ? "Light Test Profile" : "Battery Test Profile"}
                </Badge>
              </Card.Header>

              <Card.Body>
                {productType === "LIGHT" ? (
                  /* Light Parameters */
                  <div className="mb-4">
                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-physical"
                            label={<span className="fw-bold">1. Physical Casing & Finish</span>}
                            checked={lightChecks.physical}
                            onChange={(e) =>
                              setLightChecks({ ...lightChecks, physical: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            No scratches, dent, glass alignment OK
                          </small>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-lux"
                            label={<span className="fw-bold">2. LED Lumens & Lux Test</span>}
                            checked={lightChecks.ledLux}
                            onChange={(e) =>
                              setLightChecks({ ...lightChecks, ledLux: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Standard: &gt;= 140 lm/W uniform illumination
                          </small>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-wiring"
                            label={<span className="fw-bold">3. Driver & Wiring Test</span>}
                            checked={lightChecks.wiring}
                            onChange={(e) =>
                              setLightChecks({ ...lightChecks, wiring: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Current stable, soldering tight, reverse polarity OK
                          </small>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-sensor"
                            label={<span className="fw-bold">4. Dusk-to-Dawn Sensor</span>}
                            checked={lightChecks.sensor}
                            onChange={(e) =>
                              setLightChecks({ ...lightChecks, sensor: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Auto ON/OFF sensor triggering correctly
                          </small>
                        </div>
                      </Col>

                      <Col md={12}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-ip"
                            label={<span className="fw-bold">5. IP65/IP66 Waterproof Gasket Seal</span>}
                            checked={lightChecks.ipSeal}
                            onChange={(e) =>
                              setLightChecks({ ...lightChecks, ipSeal: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Silicone gasket compressed, ingress seal airtight
                          </small>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  /* Battery Parameters */
                  <div className="mb-4">
                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-volt"
                            label={<span className="fw-bold">1. Pack Voltage Test</span>}
                            checked={batteryChecks.voltage}
                            onChange={(e) =>
                              setBatteryChecks({ ...batteryChecks, voltage: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Standard: 12.8V ± 0.2V (Nominal range)
                          </small>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-delta"
                            label={<span className="fw-bold">2. Cell Delta & Balance</span>}
                            checked={batteryChecks.cellBalance}
                            onChange={(e) =>
                              setBatteryChecks({ ...batteryChecks, cellBalance: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Standard: Cell voltage difference &lt; 20 mV
                          </small>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-bms"
                            label={<span className="fw-bold">3. BMS Protection Test</span>}
                            checked={batteryChecks.bms}
                            onChange={(e) =>
                              setBatteryChecks({ ...batteryChecks, bms: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Overcharge, overdischarge &amp; short circuit cutoff OK
                          </small>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-weld"
                            label={<span className="fw-bold">4. Spot Welding Integrity</span>}
                            checked={batteryChecks.welding}
                            onChange={(e) =>
                              setBatteryChecks({ ...batteryChecks, welding: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Pure nickel strips, solid welds, no sparks/burns
                          </small>
                        </div>
                      </Col>

                      <Col md={12}>
                        <div className="border rounded p-3 bg-light">
                          <Form.Check
                            type="checkbox"
                            id="check-ir"
                            label={<span className="fw-bold">5. Internal Resistance (IR) Test</span>}
                            checked={batteryChecks.ir}
                            onChange={(e) =>
                              setBatteryChecks({ ...batteryChecks, ir: e.target.checked })
                            }
                          />
                          <small className="text-muted d-block mt-1">
                            Standard: Total IR &lt; 15 mΩ
                          </small>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Final Decision & Action */}
                <div className="border-top pt-3">
                  <Form.Label className="fw-bold fs-15">
                    3. QC Inspection Verdict / Decision *
                  </Form.Label>

                  <div className="d-flex gap-3 mb-3">
                    <Button
                      type="button"
                      variant={decision === "PASSED" ? "success" : "outline-success"}
                      className="flex-fill py-2 fw-bold"
                      onClick={() => {
                        setDecision("PASSED");
                        setDefectReason("");
                      }}
                    >
                      <i className="fa-solid fa-circle-check me-2"></i> PASS (Clear for Box Packaging)
                    </Button>

                    <Button
                      type="button"
                      variant={decision === "FAILED" ? "danger" : "outline-danger"}
                      className="flex-fill py-2 fw-bold"
                      onClick={() => setDecision("FAILED")}
                    >
                      <i className="fa-solid fa-circle-xmark me-2"></i> REJECT / FAILED
                    </Button>

                    <Button
                      type="button"
                      variant={decision === "REWORK" ? "warning" : "outline-warning"}
                      className="flex-fill py-2 fw-bold"
                      onClick={() => setDecision("REWORK")}
                    >
                      <i className="fa-solid fa-wrench me-2"></i> SEND TO REWORK
                    </Button>
                  </div>

                  {decision !== "PASSED" && (
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold text-danger">Defect Reason *</Form.Label>
                          <Form.Select
                            value={defectReason}
                            onChange={(e) => setDefectReason(e.target.value)}
                            required
                          >
                            <option value="">-- Select Defect Category --</option>
                            {productType === "LIGHT" ? (
                              <>
                                <option value="LED Flicker & Uneven Lumens">LED Flicker &amp; Uneven Lumens</option>
                                <option value="Driver Output Abnormal / Failed">Driver Output Abnormal / Failed</option>
                                <option value="Dusk-to-Dawn Sensor Failure">Dusk-to-Dawn Sensor Failure</option>
                                <option value="Casing Dent / Scratch / Damage">Casing Dent / Scratch / Damage</option>
                                <option value="Waterproof Seal Gasket Defect">Waterproof Seal Gasket Defect</option>
                              </>
                            ) : (
                              <>
                                <option value="Low Pack Voltage / Dead Cells">Low Pack Voltage / Dead Cells</option>
                                <option value="Cell Balance High Delta (>20mV)">Cell Balance High Delta (&gt;20mV)</option>
                                <option value="BMS Cutoff Not Triggering">BMS Cutoff Not Triggering</option>
                                <option value="Poor Spot Welding / Loose Nickel Strip">Poor Spot Welding / Loose Nickel Strip</option>
                                <option value="High Internal Resistance (IR)">High Internal Resistance (IR)</option>
                              </>
                            )}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Action Required</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g. Disassemble driver, replace cell #3..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setScannedSerial("");
                        setDefectReason("");
                        setRemarks("");
                      }}
                    >
                      Reset Form
                    </Button>
                    <Button type="submit" variant="primary" size="lg" className="px-4 fw-bold">
                      <i className="fa-solid fa-check-double me-2"></i>
                      Save QC Record
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Inspected Units Table in Current Session */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">
              <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>
              Recently Inspected Units ({inspectedItems.length} Scanned)
            </h5>
            <small className="text-muted">
              Passed units are immediately eligible for Box Packaging Console.
            </small>
          </div>
          <Link to="/light/box/packaging" className="btn btn-success btn-sm">
            <i className="fa-solid fa-box-open me-1"></i> Proceed to Box Packaging
          </Link>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Serial Number</th>
                  <th>Product Category</th>
                  <th>Model / Specs</th>
                  <th>QC Status</th>
                  <th>Defect / Remarks</th>
                  <th>Inspector</th>
                  <th>Tested Time</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inspectedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">
                      Abhi tak koi unit inspect nahi hui hai. Barcode scan karke QC karein.
                    </td>
                  </tr>
                ) : (
                  inspectedItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{idx + 1}</td>
                      <td className="font-monospace fw-bold text-primary">{item.serialNo}</td>
                      <td>
                        <Badge bg={item.type === "LIGHT" ? "primary" : "info"}>
                          {item.type === "LIGHT" ? "Solar Light" : "Battery Pack"}
                        </Badge>
                      </td>
                      <td>{item.model}</td>
                      <td>
                        <Badge
                          bg={
                            item.status === "PASSED"
                              ? "success"
                              : item.status === "FAILED"
                              ? "danger"
                              : "warning"
                          }
                          className="fs-12 p-2"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td>
                        {item.defectReason ? (
                          <span className="text-danger fw-semibold">{item.defectReason}</span>
                        ) : (
                          <span className="text-success fs-12">All Parameters Normal</span>
                        )}
                      </td>
                      <td>{item.inspector}</td>
                      <td>{item.time}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleOpenDetails(item)}
                          title="View detailed QC Sheet"
                        >
                          <i className="fa-solid fa-eye me-1"></i> View Sheet
                        </Button>
                        {item.status === "PASSED" && (
                          <Link
                            to="/light/box/packaging"
                            className="btn btn-outline-success btn-sm"
                            title="Pack into box"
                          >
                            <i className="fa-solid fa-box me-1"></i> Pack
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* QC Detail Inspection Modal */}
      <QCDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        qcData={selectedQCUnit}
      />
    </div>
  );
};

export default QCInspection;
