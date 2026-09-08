import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const ReceiveDamageModal = ({ show, onHide, box }) => {
  const [damagedUnits, setDamagedUnits] = useState(1);
  const [reason, setReason] = useState("Outer box crushed during transit");

  const handleReport = (e) => {
    e.preventDefault();
    alert(`Damage logged for ${box?.boxNo}: ${damagedUnits} units damaged due to ${reason}`);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          Report Receiving Damage
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning">
          Box: <strong className="font-monospace">{box?.boxNo}</strong> ({box?.units} Units total)
        </Alert>

        <Form onSubmit={handleReport}>
          <Form.Group className="mb-3">
            <Form.Label>Number of Damaged Units in this Box *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max={box?.units || 20}
              value={damagedUnits}
              onChange={(e) => setDamagedUnits(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Damage Reason / Observation *</Form.Label>
            <Form.Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Outer box crushed during transit">Outer box crushed during transit</option>
              <option value="Glass/Housing cracked">Glass / Housing cracked</option>
              <option value="Battery terminal bent">Battery terminal bent</option>
              <option value="Water seepage / moisture">Water seepage / moisture damage</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit" variant="danger">
              <i className="fa-solid fa-flag me-1"></i> Log Damage
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReceiveDamageModal;
