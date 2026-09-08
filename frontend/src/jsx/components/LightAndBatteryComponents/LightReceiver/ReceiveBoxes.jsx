import { useState } from "react";
import { Card, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import PageHeader from "../../Common/PageHeader";
import ReceiveDamageModal from "./ReceiveDamageModal";

const ReceiveBoxes = () => {
  const [scannedBox, setScannedBox] = useState("");
  const [receivedBoxes, setReceivedBoxes] = useState([
    { id: 1, boxNo: "BOX-2026-00089", units: 20, lights: 10, batteries: 10, condition: "SAFE", time: "01:15 PM" },
  ]);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);

  const handleScanBox = (e) => {
    e.preventDefault();
    const box = scannedBox.trim().toUpperCase();
    if (!box) return;

    if (receivedBoxes.some((b) => b.boxNo === box)) {
      alert("Yeh box already receive ho chuka hai!");
      return;
    }

    setReceivedBoxes((prev) => [
      { id: Date.now(), boxNo: box, units: 20, lights: 10, batteries: 10, condition: "SAFE", time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
    setScannedBox("");
  };

  const handleMarkDamage = (box) => {
    setSelectedBox(box);
    setShowDamageModal(true);
  };

  return (
    <div className="receive-light-boxes">
      <PageHeader
        title="Warehouse Box Receiving"
        subtitle="Unload transport trucks by scanning Box QR codes and verify safe receipt or transit damage"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Receiving" },
          { label: "Receive Boxes" },
        ]}
      />

      <Row>
        <Col xl={12} className="mx-auto">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Scan Incoming Box QR Code</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleScanBox}>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fa-solid fa-qrcode text-primary"></i>
                  </span>
                  <Form.Control
                    size="lg"
                    placeholder="Scan Box QR Code from truck (e.g. BOX-2026-00089)..."
                    value={scannedBox}
                    onChange={(e) => setScannedBox(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" variant="success" size="lg">
                    <i className="fa-solid fa-check me-1"></i> Receive Safe Box
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Received Boxes in Session */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Unloaded Boxes in this Session ({receivedBoxes.length})</h5>
              <Badge bg="primary">
                Total Products Received: {receivedBoxes.reduce((acc, b) => acc + b.units, 0)} Units
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Box QR Number</th>
                      <th>Total Units</th>
                      <th>Breakdown</th>
                      <th>Condition</th>
                      <th>Received Time</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedBoxes.map((box, idx) => (
                      <tr key={box.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-bold font-monospace text-primary">{box.boxNo}</td>
                        <td>{box.units} Units</td>
                        <td>{box.lights} Lights + {box.batteries} Batteries</td>
                        <td>
                          <Badge bg={box.condition === "SAFE" ? "success" : "danger"}>
                            {box.condition}
                          </Badge>
                        </td>
                        <td>{box.time}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleMarkDamage(box)}
                          >
                            <i className="fa-solid fa-triangle-exclamation me-1"></i> Report Box Damage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ReceiveDamageModal
        show={showDamageModal}
        onHide={() => setShowDamageModal(false)}
        box={selectedBox}
      />
    </div>
  );
};

export default ReceiveBoxes;
