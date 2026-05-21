/* eslint-disable react/prop-types */
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AddPermission = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    key: "",
    label: "",
    module: "",
    action: "Active",
  });

  const [errors, setErrors] = useState({});

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.key.trim()) {
      newErrors.key = "Permission key is required";
    }

    if (!formData.label.trim()) {
      newErrors.label = "Permission label is required";
    }

    if (!formData.module.trim()) {
      newErrors.module = "Module is required";
    }

    return newErrors;
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Submit
  const handleSubmit = () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      return setErrors(newErrors);
    }

    onAdd(formData);

    setFormData({
      key: "",
      label: "",
      module: "",
      action: "Active",
    });

    setErrors({});

    onClose();
  };

  // Close Modal
  const handleClose = () => {
    setFormData({
      key: "",
      label: "",
      module: "",
      action: "Active",
    });

    setErrors({});

    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa fa-lock me-2 text-success"></i>
          Add Permission
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Permission Key */}
        <Form.Group className="mb-3">
          <Form.Label>
            Permission Key <span className="text-danger">*</span>
          </Form.Label>

          <Form.Control
            type="text"
            name="key"
            placeholder="generate_panel"
            value={formData.key}
            onChange={handleChange}
            isInvalid={!!errors.key}
          />

          <Form.Control.Feedback type="invalid">
            {errors.key}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Label */}
        <Form.Group className="mb-3">
          <Form.Label>
            Label <span className="text-danger">*</span>
          </Form.Label>

          <Form.Control
            type="text"
            name="label"
            placeholder="Generate Panel"
            value={formData.label}
            onChange={handleChange}
            isInvalid={!!errors.label}
          />

          <Form.Control.Feedback type="invalid">
            {errors.label}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Module */}
        <Form.Group className="mb-3">
          <Form.Label>
            Module <span className="text-danger">*</span>
          </Form.Label>

          <Form.Control
            type="text"
            name="module"
            placeholder="Generate Panel"
            value={formData.module}
            onChange={handleChange}
            isInvalid={!!errors.module}
          />

          <Form.Control.Feedback type="invalid">
            {errors.module}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Action */}
        <Form.Group className="mb-3">
          <Form.Label>Action</Form.Label>

          <Form.Select
            name="action"
            value={formData.action}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>

        <Button variant="success" onClick={handleSubmit}>
          <i className="fa fa-save me-1"></i>
          Save Permission
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddPermission;       