import { useState } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";

const MaterialOtpModal = ({ show, onHide, request }) => {
  const [storeOtp, setStoreOtp] = useState("");
  const [prodOtp, setProdOtp] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (storeOtp.length === 4 && prodOtp.length === 4) {
      setVerified(true);
      setTimeout(() => {
        alert("Dual OTP verified successfully! Materials issued to production.");
        setVerified(false);
        onHide();
      }, 1000);
    } else {
      alert("Please enter valid 4-digit OTPs for both Store and Production.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa-solid fa-handshake me-2 text-warning"></i>
          Dual-OTP Material Handover
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <strong>Request No: {request?.reqNo}</strong> ({request?.approvedQty} Units approved)
          <br />
          Handshake require karta hai Store Keeper aur Production Incharge dono ka verified OTP.
        </Alert>

        <Form onSubmit={handleVerify}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">1. Store Keeper OTP *</Form.Label>
                <Form.Control
                  type="password"
                  maxLength={4}
                  placeholder="4-digit OTP"
                  value={storeOtp}
                  onChange={(e) => setStoreOtp(e.target.value)}
                  required
                />
                <small className="text-muted">Issued by Logistics/Store</small>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">2. Production Incharge OTP *</Form.Label>
                <Form.Control
                  type="password"
                  maxLength={4}
                  placeholder="4-digit OTP"
                  value={prodOtp}
                  onChange={(e) => setProdOtp(e.target.value)}
                  required
                />
                <small className="text-muted">Received by Floor Team</small>
              </Form.Group>
            </Col>
          </Row>

          {verified && (
            <Alert variant="success" className="text-center py-2">
              <i className="fa-solid fa-circle-check me-2"></i> OTP Handshake Successful!
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit" variant="success">
              <i className="fa-solid fa-check-double me-2"></i> Verify & Handover Material
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MaterialOtpModal;
