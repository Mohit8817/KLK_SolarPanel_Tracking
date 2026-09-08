import { Modal, Button, Table, Badge } from "react-bootstrap";

const BoxDetailsModal = ({ show, onHide, box }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa-solid fa-box-open me-2 text-primary"></i>
          Box Details: <span className="font-monospace text-primary">{box?.boxNo}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-3 mb-3">
          <Badge bg="dark" className="p-2 fs-13">Total Units: {box?.totalUnits} / 20</Badge>
          <Badge bg="primary" className="p-2 fs-13">Lights: {box?.lights}</Badge>
          <Badge bg="info" className="p-2 fs-13">Batteries: {box?.batteries}</Badge>
          <Badge bg="success" className="p-2 fs-13">Status: {box?.status}</Badge>
        </div>

        <div className="table-responsive border rounded">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Serial Number</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: box?.totalUnits || 0 }).map((_, idx) => {
                const isLight = idx < (box?.lights || 0);
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td className="font-monospace fw-bold">
                      {isLight ? `SL2409000${idx + 1}` : `BAT2409000${idx + 1}`}
                    </td>
                    <td>
                      <Badge bg={isLight ? "primary" : "info"}>
                        {isLight ? "Street Light" : "Battery"}
                      </Badge>
                    </td>
                    <td><span className="text-success fw-bold">Packed</span></td>
                  </tr>
                );
              })}
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

export default BoxDetailsModal;
