/* eslint-disable react/prop-types */
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AddRole = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    rolecode: "",
    description: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Role name is required.";
    if (!formData.rolecode.trim()) newErrors.rolecode = "Role code is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    onAdd({ ...formData });
    setFormData({ name: "", rolecode: "", description: "", status: "Active" });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: "", rolecode: "",    description: "", status: "Active" });
    setErrors({});
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa fa-plus-circle me-2 text-success"></i>
          Add Role
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>
            Role Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="e.g. Supervisor"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

                <Form.Group className="mb-3">
          <Form.Label>
            Role Code <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="rolecode"
           
            value={formData.rolecode}
            onChange={handleChange}
            isInvalid={!!errors.rolecode}
          />
          <Form.Control.Feedback type="invalid">
            {errors.rolecode}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Description <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            placeholder="Brief description of this role..."
            value={formData.description}
            onChange={handleChange}
            isInvalid={!!errors.description}
          />
          <Form.Control.Feedback type="invalid">
            {errors.description}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            name="status"
            value={formData.status}
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
          <i className="fa fa-check me-1"></i> Add Role
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddRole;