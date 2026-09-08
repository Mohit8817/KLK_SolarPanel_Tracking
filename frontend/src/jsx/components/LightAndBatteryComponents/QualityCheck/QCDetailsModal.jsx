import { Modal, Button, Table, Badge, Row, Col } from "react-bootstrap";

const QCDetailsModal = ({ show, onHide, qcData }) => {
  if (!qcData) return null;

  const isLight = qcData.type === "LIGHT";
  const statusColor =
    qcData.status === "PASSED"
      ? "success"
      : qcData.status === "FAILED"
      ? "danger"
      : "warning";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fs-18 fw-bold d-flex align-items-center gap-2">
          <i className="fa-solid fa-clipboard-check text-primary"></i>
          QC Inspection Sheet: <span className="font-monospace text-primary">{qcData.serialNo}</span>
          <Badge bg={statusColor} className="ms-2 fs-13">
            {qcData.status}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Unit & Test Overview */}
        <div className="bg-light rounded p-3 mb-4">
          <Row className="g-3">
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Serial Number</span>
              <strong className="font-monospace text-dark fs-15">{qcData.serialNo}</strong>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Product Type</span>
              <strong className="text-dark">
                {isLight ? "Solar Street Light" : "Battery Pack"}
              </strong>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Model / Specs</span>
              <strong className="text-dark">{qcData.model}</strong>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Work Order / PO</span>
              <strong className="text-dark">{qcData.poNo || "PO-2026-089"}</strong>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Inspection Date</span>
              <span className="text-dark">{qcData.date} {qcData.time || ""}</span>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Inspector</span>
              <span className="text-dark fw-semibold">{qcData.inspector || "QC Lab Operator"}</span>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Test Station</span>
              <span className="text-dark">{qcData.station || "Station 1"}</span>
            </Col>
            <Col sm={6} md={3}>
              <span className="text-muted fs-12 text-uppercase d-block">Final Decision</span>
              <Badge bg={statusColor} className="fs-12">{qcData.status}</Badge>
            </Col>
          </Row>
        </div>

        {/* Inspection Parameters Table */}
        <h6 className="fw-bold mb-3">
          <i className="fa-solid fa-list-check me-2 text-primary"></i>
          Test Parameters & Inspection Results
        </h6>

        <div className="table-responsive mb-4">
          <Table bordered className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "35%" }}>Inspection Parameter</th>
                <th style={{ width: "30%" }}>Expected Standard</th>
                <th style={{ width: "20%" }}>Observed Value</th>
                <th style={{ width: "15%" }} className="text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {isLight ? (
                <>
                  <tr>
                    <td>Physical Enclosure & Finish</td>
                    <td className="text-muted">No scratches, dents, paint defects</td>
                    <td>{qcData.testValues?.physical || "Clean surface, zero blemish"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.physicalResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.physicalResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>LED Module & Lumens Test</td>
                    <td className="text-muted">&gt;= 140 lm/W, uniform glowing</td>
                    <td>{qcData.testValues?.lux || "148 lm/W (2960 lm)"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.luxResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.luxResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>Driver & Wiring Integrity</td>
                    <td className="text-muted">Tight soldering, proper insulation</td>
                    <td>{qcData.testValues?.wiring || "Output 12.0V stable"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.wiringResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.wiringResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>Dusk-to-Dawn & Solar Sensor</td>
                    <td className="text-muted">Auto ON at &lt; 10 Lux, Auto OFF</td>
                    <td>{qcData.testValues?.sensor || "Sensor response &lt; 2s"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.sensorResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.sensorResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>IP65/IP66 Waterproof Gasket</td>
                    <td className="text-muted">Silicone gasket compressed, sealed</td>
                    <td>{qcData.testValues?.ipSeal || "Pressure seal intact"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.ipSealResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.ipSealResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td>Pack Voltage</td>
                    <td className="text-muted">12.8V &plusmn; 0.2V (LiFePO4 4S)</td>
                    <td>{qcData.testValues?.voltage || "12.84 V"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.voltageResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.voltageResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>Cell Delta & Balance</td>
                    <td className="text-muted">Delta &lt; 20 mV across cells</td>
                    <td>{qcData.testValues?.cellDelta || "Delta: 8 mV"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.deltaResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.deltaResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>BMS Protection (Cutoff)</td>
                    <td className="text-muted">Overcharge, overdischarge cutoff OK</td>
                    <td>{qcData.testValues?.bms || "Trigger & Recovery OK"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.bmsResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.bmsResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>Spot Welding & Nickel Strips</td>
                    <td className="text-muted">Zero weld fractures, solid pull force</td>
                    <td>{qcData.testValues?.welding || "Clean welds, firm hold"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.weldingResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.weldingResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>Internal Resistance (IR)</td>
                    <td className="text-muted">&lt; 15 m&Omega;</td>
                    <td>{qcData.testValues?.ir || "11.4 m&Omega;"}</td>
                    <td className="text-center">
                      <Badge bg={qcData.testValues?.irResult === "FAIL" ? "danger" : "success"}>
                        {qcData.testValues?.irResult || "PASS"}
                      </Badge>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </Table>
        </div>

        {/* Remarks / Defect Note */}
        {qcData.defectReason && (
          <div className="alert alert-danger mb-3">
            <h6 className="alert-heading fw-bold mb-1">
              <i className="fa-solid fa-triangle-exclamation me-2"></i>
              Recorded Defect: {qcData.defectReason}
            </h6>
            <p className="mb-0 fs-13">
              Remarks: {qcData.remarks || "Unit failed quality thresholds. Sent for rework/engineering inspection."}
            </p>
          </div>
        )}

        {qcData.remarks && !qcData.defectReason && (
          <div className="alert alert-light border mb-3">
            <span className="fw-semibold">Inspector Remarks:</span> {qcData.remarks}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          <i className="fa-solid fa-print me-1"></i> Print QC Certificate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QCDetailsModal;
