import { useState } from "react";
import { Card, Row, Col, Form, Button, Badge } from "react-bootstrap";
import PageHeader from "../../Common/PageHeader";

const INITIAL_FORM = {
  category: "LIGHT", // LIGHT or BATTERY
  lightType: "SEMI", // INBUILT or SEMI
  wattage: "20W",
  voltage: "12V",
  prefix: "SL-",
  quantity: 100,
  startingNo: 1,
  projectName: "",
  state: "",
};

const GenerateLightSerial = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleCategoryChange = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: cat,
      prefix: cat === "LIGHT" ? "SL-" : "BAT-",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateEndNo = () => {
    const start = parseInt(formData.startingNo, 10) || 1;
    const qty = parseInt(formData.quantity, 10) || 0;
    return qty > 0 ? start + qty - 1 : start;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Generating ${formData.quantity} serials for ${formData.category}`);
  };

  return (
    <div className="generate-light-serial">
      <PageHeader
        title="Generate Light & Battery Serials"
        subtitle="Create unique serialized barcodes for Solar Street Lights and Battery Packs"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Operations" },
          { label: "Generate Serials" },
        ]}
      />

      <Row>
        <Col xl={12} lg={10} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Serial Lot Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Category Selector */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Select Product Category *</Form.Label>
                  <div className="d-flex gap-3">
                    <Button
                      variant={formData.category === "LIGHT" ? "primary" : "outline-secondary"}
                      className="px-4 py-2"
                      onClick={() => handleCategoryChange("LIGHT")}
                    >
                      <i className="fa-solid fa-lightbulb me-2"></i> Solar Street Light
                    </Button>
                    <Button
                      variant={formData.category === "BATTERY" ? "info" : "outline-secondary"}
                      className="px-4 py-2"
                      onClick={() => handleCategoryChange("BATTERY")}
                    >
                      <i className="fa-solid fa-car-battery me-2"></i> Battery Pack
                    </Button>
                  </div>
                </Form.Group>

                {formData.category === "LIGHT" && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Light Type *</Form.Label>
                        <Form.Select name="lightType" value={formData.lightType} onChange={handleChange}>
                          <option value="SEMI">Semi-Integrated (External Battery)</option>
                          <option value="INBUILT">All-In-One (Inbuilt Battery)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Wattage / Model *</Form.Label>
                        <Form.Select name="wattage" value={formData.wattage} onChange={handleChange}>
                          <option value="12W">12 Watt LED</option>
                          <option value="15W">15 Watt LED</option>
                          <option value="20W">20 Watt LED</option>
                          <option value="30W">30 Watt LED</option>
                          <option value="40W">40 Watt LED</option>
                          <option value="60W">60 Watt LED</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {formData.category === "BATTERY" && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Battery Chemistry *</Form.Label>
                        <Form.Select name="chemistry" defaultValue="LiFePO4">
                          <option value="LiFePO4">Lithium Ferro Phosphate (LiFePO4)</option>
                          <option value="Li-ion">Lithium-ion (NMC)</option>
                          <option value="LeadAcid">Tubular Lead Acid</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Capacity (Ah / Wh) *</Form.Label>
                        <Form.Select name="voltage" value={formData.voltage} onChange={handleChange}>
                          <option value="12.8V 18Ah">12.8V 18Ah (230Wh)</option>
                          <option value="12.8V 30Ah">12.8V 30Ah (384Wh)</option>
                          <option value="12.8V 42Ah">12.8V 42Ah (537Wh)</option>
                          <option value="25.6V 30Ah">25.6V 30Ah (768Wh)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Serial Prefix *</Form.Label>
                      <Form.Control
                        type="text"
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Quantity to Generate *</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        min="1"
                        max="10000"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Starting Sequence No</Form.Label>
                      <Form.Control
                        type="number"
                        name="startingNo"
                        min="1"
                        value={formData.startingNo}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Preview Box */}
                <div className="p-3  shadow-sm rounded mb-4 border">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">SERIAL RANGE PREVIEW</small>
                      <span className="fw-bold font-monospace fs-16 text-primary">
                        {formData.prefix}{String(formData.startingNo).padStart(6, "0")}
                        {" "}➔{" "}
                        {formData.prefix}{String(calculateEndNo()).padStart(6, "0")}
                      </span>
                    </div>
                    <Badge bg="primary" className="p-2">Total: {formData.quantity} Serials</Badge>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary">Reset</Button>
                  <Button type="submit" variant="primary">
                    <i className="fa-solid fa-bolt me-2"></i>Generate Serial Lot
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GenerateLightSerial;
