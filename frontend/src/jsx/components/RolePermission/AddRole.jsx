import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { createRole, getRoleById, updateRole } from "./roleapi.jsx";

const initialState = {
  name: "",
  rolecode: "",
  description: "",
  status: true,
};

const AddRole = ({ show, onClose, selectedRole, refreshRoles }) => {

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  // =========================
  // LOAD ROLE (EDIT MODE)
  // =========================
  useEffect(() => {

    if (selectedRole?._id && show) {
      fetchRole(selectedRole._id);
    }

    if (!selectedRole && show) {
      resetForm();
    }

  }, [selectedRole, show]);

  const fetchRole = async (id) => {

    try {

      setLoading(true);

      const res = await getRoleById(id);

      const role = res?.data?.data;

      setFormData({
        name: role?.name || "",
        rolecode: role?.rolecode || "",
        description: role?.description || "",
        status: role?.status ?? true,
      });

    } catch (error) {

      console.log("Fetch Role Error:", error);

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "status"
          ? value === "true"
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {

    const err = {};

    if (!formData.name.trim()) err.name = "Role name is required";
    if (!formData.rolecode.trim()) err.rolecode = "Role code is required";
    if (!formData.description.trim()) err.description = "Description is required";

    return err;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {

    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {

      setLoading(true);

      if (selectedRole?._id) {

        await updateRole(selectedRole._id, formData);

      } else {

        await createRole(formData);
      }

      refreshRoles?.();
      handleClose();

    } catch (error) {

      console.log("Submit Error:", error);

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // CLOSE
  // =========================
  const handleClose = () => {

    resetForm();
    onClose();

  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">

      {/* HEADER */}
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa fa-user-shield me-2 text-success"></i>
          {selectedRole ? "Update Role" : "Add Role"}
        </Modal.Title>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>

        {/* LOADING */}
        {loading && selectedRole ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <>
            {/* ROLE NAME */}
            <Form.Group className="mb-3">
              <Form.Label>Role Name *</Form.Label>

              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                placeholder="Enter role name"
              />

              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            {/* ROLE CODE */}
            <Form.Group className="mb-3">
              <Form.Label>Role Code *</Form.Label>

              <Form.Control
                type="text"
                name="rolecode"
                value={formData.rolecode}
                onChange={handleChange}
                isInvalid={!!errors.rolecode}
                placeholder="Enter role code"
              />

              <Form.Control.Feedback type="invalid">
                {errors.rolecode}
              </Form.Control.Feedback>
            </Form.Group>

            {/* DESCRIPTION */}
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!errors.description}
                placeholder="Enter description"
              />

              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            {/* STATUS */}
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>

              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </Form.Select>
            </Form.Group>

          </>
        )}

      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Saving...
            </>
          ) : selectedRole ? (
            "Update Role"
          ) : (
            "Add Role"
          )}
        </Button>

      </Modal.Footer>

    </Modal>
  );
};

export default AddRole;