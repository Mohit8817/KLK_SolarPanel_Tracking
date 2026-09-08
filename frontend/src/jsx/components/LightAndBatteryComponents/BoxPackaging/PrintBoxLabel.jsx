import { Modal, Row, Col, Badge, Table } from "react-bootstrap";

const PrintBoxLabel = ({ show, onHide, boxData,  }) => {
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



  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className=" py-2 px-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-qrcode text-primary fs-18"></i>
          <div>
            <Modal.Title className="fs-16 fw-bold mb-0">
              Box Sticker Label &amp; Packing Manifest
            </Modal.Title>
            <small className="text-muted">
              Box ID: <span className="font-monospace fw-bold text-dark">{boxId}</span> ({totalCount}/20 Units)
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 ">
        <div className="p-3 bg-white border rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0">SHIPPING &amp; PACKING MANIFEST SLIP</h5>
              <small className="text-muted">KLK Ventures Solar Tracking &amp; Light Systems</small>
            </div>
            <div className="text-end">
              <Badge bg="dark" className="fs-13 font-monospace p-2">{boxId}</Badge>
              <div className="fs-11 text-muted mt-1">{new Date().toLocaleString()}</div>
            </div>
          </div>

          <Row className="mb-3 g-2 fs-13">
            <Col sm={6}>
              <div className="p-2 border rounded">
                <strong>Consignee Project:</strong> {project}
                <br />
                <strong>Packaging Station:</strong> Assembly Bay #1
                <br />
                <strong>QC Status:</strong> All Units QC Approved
              </div>
            </Col>
            <Col sm={6}>
              <div className="p-2 border rounded">
                <strong>Gross Weight:</strong> {grossWeight} kg
                <br />
                <strong>Capacity Status:</strong> {totalCount}/20 Units ({totalCount === 20 ? "Full Carton" : "Partial Carton"})
                <br />
                <strong>Contents:</strong> {lightsCount} Solar Lights, {batteriesCount} Battery Packs
              </div>
            </Col>
          </Row>

          <h6 className="fw-bold fs-13 mb-2">Detailed Unit Barcode Audit Table</h6>
          <div className="table-responsive">
            <Table bordered size="sm" className="align-middle mb-0 fs-12">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Serial Number</th>
                  <th>Product Category</th>
                  <th>Model Description</th>
                  <th>QC Status</th>
                  <th>Packed At</th>
                  <th className="text-center" style={{ width: 70 }}>Receiver Check</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="fw-bold">{idx + 1}</td>
                    <td className="font-monospace fw-bold text-primary">{item.serialNo}</td>
                    <td>
                      <Badge bg={item.type === "LIGHT" ? "warning" : "info"} text="dark">
                        {item.type}
                      </Badge>
                    </td>
                    <td>{item.model}</td>
                    <td>
                      <Badge bg="success">PASSED</Badge>
                    </td>
                    <td className="text-muted">{item.time}</td>
                    <td className="text-center">
                      <input type="checkbox" className="form-check-input" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

        </div>
      </Modal.Body>

     
    </Modal>
  );
};

export default PrintBoxLabel;