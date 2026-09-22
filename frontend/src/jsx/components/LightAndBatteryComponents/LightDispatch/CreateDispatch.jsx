import { useState } from "react";
import { Card, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import PageHeader from "../../Common/PageHeader";

const CreateDispatch = () => {
  const [truckNo, setTruckNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vendorState, setVendorState] = useState("Rajasthan");
  const [vendorName, setVendorName] = useState("");
  const [scannedBox, setScannedBox] = useState("");
  const [loadedBoxes, setLoadedBoxes] = useState([
    { id: 1, boxNo: "BOX-2026-00089", units: 20, lights: 10, batteries: 10 },
    { id: 2, boxNo: "BOX-2026-00090", units: 20, lights: 20, batteries: 0 },
  ]);

  const totalLoadedUnits = loadedBoxes.reduce((acc, curr) => acc + curr.units, 0);

  const handleBoxScan = (e) => {
    e.preventDefault();
    const box = scannedBox.trim().toUpperCase();
    if (!box) return;

    if (loadedBoxes.some((b) => b.boxNo === box)) {
      alert("Yeh box already loaded hai!");
      return;
    }

    setLoadedBoxes((prev) => [
      { id: Date.now(), boxNo: box, units: 20, lights: 10, batteries: 10 },
      ...prev,
    ]);
    setScannedBox("");
  };

  const handleRemoveBox = (id) => {
    setLoadedBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="create-dispatch-boxes">
      <PageHeader
        title="Create Dispatch & Truck Loading"
        subtitle="Load sealed shipping boxes (Max 20 units/box) into transport trucks"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Dispatch" },
          { label: "Create Dispatch" },
        ]}
      />

      <Row>
        <Col xl={5}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">1. Transport & Destination Details</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Truck / Vehicle Number *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. RJ 14 GA 5432"
                  value={truckNo}
                  onChange={(e) => setTruckNo(e.target.value)}
                  required
                />
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Driver Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Driver Mobile</Form.Label>
                    <Form.Control
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Destination State *</Form.Label>
                <Form.Select value={vendorState} onChange={(e) => setVendorState(e.target.value)}>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Vendor / Warehouse Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Jaipur State Central Warehouse"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">2. Scan Box QR Codes onto Truck</h5>
              <Badge bg="success" className="fs-13">
                {loadedBoxes.length} Boxes = {totalLoadedUnits} Products Loaded
              </Badge>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleBoxScan} className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fa-solid fa-qrcode text-primary"></i>
                  </span>
                  <Form.Control
                    size="lg"
                    placeholder="Scan Box QR Code (e.g. BOX-2026-00089)..."
                    value={scannedBox}
                    onChange={(e) => setScannedBox(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <i className="fa-solid fa-plus me-1"></i> Load Box
                  </Button>
                </div>
              </Form>

              <div className="table-responsive border rounded">
                <Table hover className="align-middle mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th>#</th>
                      <th>Box QR Number</th>
                      <th>Units Inside</th>
                      <th>Breakdown</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedBoxes.map((box, idx) => (
                      <tr key={box.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-bold font-monospace text-primary">{box.boxNo}</td>
                        <td>
                          <Badge bg="dark">{box.units} Units</Badge>
                        </td>
                        <td>
                          <small>{box.lights}L + {box.batteries}B</small>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveBox(box.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-4 text-end">
                <Button variant="outline-secondary" className="me-2">Clear</Button>
                <Button variant="success" size="lg" disabled={loadedBoxes.length === 0}>
                  <i className="fa-solid fa-truck-arrow-right me-2"></i> Confirm & Generate Challan
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateDispatch;
