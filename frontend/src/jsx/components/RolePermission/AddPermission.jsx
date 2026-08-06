import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";

import {
  createPermission,
  getPermissionById,
  updatePermission,
} from "./permissionapi";

const AddPermission = ({
  show,
  onClose,
  selectedPermission,
  refreshPermissions,
}) => {

  // =====================================
  // STATES
  // =====================================
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    permission_module: "",
    status: true,
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // =====================================
  // FETCH SINGLE PERMISSION
  // =====================================
  useEffect(() => {

    if (selectedPermission?._id && show) {
      fetchPermission(selectedPermission._id);
    }

    if (!selectedPermission && show) {
      resetForm();
    }

  }, [selectedPermission, show]);

 const fetchPermission = async (id) => {

  try {

    setLoading(true);

    const response =
      await getPermissionById(id);

    console.log(
      "Single Permission:",
      response.data
    );

    const permission =
      response?.data?.data;

    if (permission) {

      setFormData({
        name: permission.name || "",
        label: permission.label || "",
        permission_module:
          permission.permission_module || "",
        status:
          permission.status ?? true,
      });
    }

  } catch (error) {

    console.log(
      "Fetch Permission Error:",
      error
    );

  } finally {

    setLoading(false);

  }
};

  // =====================================
  // VALIDATION
  // =====================================
  const validate = () => {

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Permission name is required";
    }

    if (!formData.label.trim()) {
      newErrors.label =
        "Permission label is required";
    }

    if (!formData.permission_module.trim()) {
      newErrors.permission_module =
        "Module is required";
    }

    return newErrors;
  };

  // =====================================
  // HANDLE CHANGE
  // =====================================
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

  // =====================================
  // SUBMIT
  // =====================================
  const handleSubmit = async () => {

    const validationErrors = validate();

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    try {

      setLoading(true);

      const payload = {
        name: formData.name,
        label: formData.label,
        permission_module:
          formData.permission_module,
        status: formData.status,
      };

      // UPDATE
      if (selectedPermission?._id) {

        await updatePermission(
          selectedPermission._id,
          payload
        );

      } else {

        // CREATE
        await createPermission(payload);

      }

      if (refreshPermissions) {
        refreshPermissions();
      }

      handleClose();

    } catch (error) {

      console.log(
        "Submit Permission Error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // =====================================
  // RESET FORM
  // =====================================
  const resetForm = () => {

    setFormData({
      name: "",
      label: "",
      permission_module: "",
      status: true,
    });

    setErrors({});
  };

  // =====================================
  // CLOSE MODAL
  // =====================================
  const handleClose = () => {

    resetForm();

    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      size="lg"
    >

      <Modal.Header closeButton>

        <Modal.Title>

          <i className="fa fa-lock me-2 text-success"></i>

          {
            selectedPermission
              ? "Update Permission"
              : "Add Permission"
          }

        </Modal.Title>

      </Modal.Header>

      <Modal.Body>

        {
          loading && selectedPermission ? (

            <div className="text-center py-4">

              <Spinner
                animation="border"
                variant="success"
              />

            </div>

          ) : (
            <>

              {/* NAME */}
              <Form.Group className="mb-3">

                <Form.Label>
                  Permission Name{" "}
                  <span className="text-danger">
                    *
                  </span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Generate Panel"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                />

                <Form.Control.Feedback type="invalid">

                  {errors.name}

                </Form.Control.Feedback>

              </Form.Group>

              {/* LABEL */}
              <Form.Group className="mb-3">

                <Form.Label>
                  Label{" "}
                  <span className="text-danger">
                    *
                  </span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="label"
                  placeholder="generate_panel"
                  value={formData.label}
                  onChange={handleChange}
                  isInvalid={!!errors.label}
                />

                <Form.Control.Feedback type="invalid">

                  {errors.label}

                </Form.Control.Feedback>

              </Form.Group>

              {/* MODULE */}
         <Form.Group className="mb-3">

  <Form.Label>
    Module{" "}
    <span className="text-danger">*</span>
  </Form.Label>

  <Form.Select
    name="permission_module"
    value={formData.permission_module}
    onChange={handleChange}
    isInvalid={!!errors.permission_module}
  >

    <option value="">
      Select Module
    </option>

    <option value="Dashboard">
      Dashboard
    </option>

    <option value="Panel Generation">
      Panel Generation
    </option>

    <option value="Production Management">
      Production Management
    </option>

    <option value="Panel Dispatching">
      Panel Dispatching
    </option>

    <option value="Panel Recieving">
      Panel Recieving
    </option>

    <option value="User Management"> 
      User Management
    </option>

    <option value="Settings">
Settings
    </option>

  </Form.Select>

  <Form.Control.Feedback type="invalid">

    {errors.permission_module}

  </Form.Control.Feedback>

</Form.Group>

              {/* STATUS */}
              <Form.Group className="mb-2">

                <Form.Label>
                  Status
                </Form.Label>

                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value={true}>
                    Active
                  </option>

                  <option value={false}>
                    Inactive
                  </option>
                </Form.Select>

              </Form.Group>

            </>
          )
        }

      </Modal.Body>

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

          {
            loading ? (
              <>

                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />

                Please wait...

              </>
            ) : (
              <>

                <i className="fa fa-check me-1"></i>

                {
                  selectedPermission
                    ? "Update Permission"
                    : "Add Permission"
                }

              </>
            )
          }

        </Button>

      </Modal.Footer>

    </Modal>
  );
};

export default AddPermission;