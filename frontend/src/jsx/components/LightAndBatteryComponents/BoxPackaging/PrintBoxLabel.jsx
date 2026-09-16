import { Modal, Row, Col, Badge, Table, Button } from "react-bootstrap";

const PrintBoxLabel = ({ show, onHide, boxData, onBoxSealed }) => {
  if (!boxData) return null;

  const totalCount = boxData.totalCount || 0;
  const lightsCount = boxData.lightsCount || 0;
  const batteriesCount = boxData.batteriesCount || 0;
  const items = boxData.items || [];
  const boxId = boxData.boxId || "BOX-" + Date.now().toString().slice(-6);
  const project = boxData.project || "Rajasthan Smart Highway Project";
  const grossWeight =
    boxData.grossWeight ||
    (lightsCount * 4.5 + batteriesCount * 3.2 + 1.8).toFixed(1);

  const handleSealAndNext = () => {
    // Save to localStorage
    try {
      const savedBoxes = localStorage.getItem("klk_sealed_boxes");
      const list = savedBoxes ? JSON.parse(savedBoxes) : [];
      const newBox = {
        id: Date.now(),
        boxNo: boxId,
        totalUnits: totalCount,
        lights: lightsCount,
        batteries: batteriesCount,
        status: "READY_FOR_DISPATCH",
        project,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        items,
      };
      localStorage.setItem("klk_sealed_boxes", JSON.stringify([newBox, ...list]));
    } catch (e) {
      console.error(e);
    }

    if (onBoxSealed) {
      onBoxSealed();
    } else {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="py-2 px-3 bg-light">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-qrcode text-primary fs-18"></i>
          <div>
            <Modal.Title className="fs-15 fw-bold mb-0">
              Box Shipping Label &amp; Packing Manifest
            </Modal.Title>
            <small className="text-muted">
              Box ID: <span className="font-monospace fw-bold text-dark">{boxId}</span> ({totalCount}/20 Units)
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3">
        <div className="p-3 bg-white border rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0">SHIPPING &amp; PACKING MANIFEST SLIP</h5>
              <small className="text-muted">KLK Solar Tracking &amp; Light Systems</small>
            </div>
            <div className="text-end">
              <Badge bg="dark" className="fs-13 font-monospace p-2">{boxId}</Badge>
              <div className="fs-11 text-muted mt-1">{new Date().toLocaleString()}</div>
            </div>
          </div>

          <Row className="mb-3 g-2 fs-13">
            <Col sm={6}>
              <div className="p-2 border rounded bg-light-subtle">
                <strong>Destination Project:</strong> {project}
                <br />
                <strong>Packing Station:</strong> Assembly Bay #1
                <br />
                <strong>QC Clearance:</strong> <span className="text-success fw-bold">✓ 100% Passed</span>
              </div>
            </Col>
            <Col sm={6}>
              <div className="p-2 border rounded bg-light-subtle">
                <strong>Estimated Gross Weight:</strong> ~{grossWeight} kg
                <br />
                <strong>Carton Status:</strong> {totalCount}/20 Units ({totalCount === 20 ? "Full Box" : "Partial Box"})
                <br />
                <strong>Contents Breakdown:</strong> {lightsCount} Lights, {batteriesCount} Batteries
              </div>
            </Col>
          </Row>

          <h6 className="fw-bold fs-13 mb-2">Packed Serial Numbers ({items.length} Units)</h6>
          <div className="table-responsive" style={{ maxHeight: 260, overflowY: "auto" }}>
            <Table bordered size="sm" className="align-middle mb-0 fs-12">
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Serial Number</th>
                  <th>Category</th>
                  <th>Model Description</th>
                  <th>QC Status</th>
                  <th>Packed At</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="fw-bold text-muted">{idx + 1}</td>
                    <td className="font-monospace fw-bold text-primary">{item.serialNo}</td>
                    <td>
                      <Badge bg={item.type === "LIGHT" ? "primary" : "info"} className="fs-11">
                        {item.type === "LIGHT" ? "Solar Light" : "Battery"}
                      </Badge>
                    </td>
                    <td>{item.model}</td>
                    <td>
                      <Badge bg="success">PASSED</Badge>
                    </td>
                    <td className="text-muted">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="py-2 bg-light d-flex justify-content-between">
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
          Cancel
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
            <i className="fa-solid fa-print me-1"></i> Print Label
          </Button>
          <Button variant="success" size="sm" onClick={handleSealAndNext} className="fw-semibold">
            <i className="fa-solid fa-box-check me-1"></i> Seal Box &amp; Start Next
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PrintBoxLabel;