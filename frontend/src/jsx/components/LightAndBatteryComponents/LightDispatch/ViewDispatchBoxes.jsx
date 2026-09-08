import { Modal, Button, Table, Badge } from "react-bootstrap";

const ViewDispatchBoxes = ({ show, onHide, dispatch }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa-solid fa-truck me-2 text-primary"></i>
          Shipment Boxes: <span className="font-monospace text-primary">{dispatch?.challanNo}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-3 mb-3">
          <Badge bg="dark" className="p-2 fs-13">Truck: {dispatch?.truckNo}</Badge>
          <Badge bg="primary" className="p-2 fs-13">Boxes: {dispatch?.boxesCount}</Badge>
          <Badge bg="success" className="p-2 fs-13">Total Units: {dispatch?.totalUnits}</Badge>
        </div>

        <div className="table-responsive border rounded">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Box QR Number</th>
                <th>Capacity</th>
                <th>Product Mix</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="font-monospace fw-bold text-primary">BOX-2026-0008{idx + 1}</td>
                  <td>20 Units</td>
                  <td>10 Lights + 10 Batteries</td>
                  <td>
                    <Badge bg="warning" text="dark">Loaded on Truck</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewDispatchBoxes;
