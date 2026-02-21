import { Fragment, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { getUserById, updateUser } from "./userApi";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp_no: "",
    gender: "",
    role: "",
    city: "",
    project: "",
    password: "",
    emp_image: null,
  });

  /* ===============================
     Load user data
  =============================== */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getUserById(id);
        setFormData({ ...res.data, password: "" }); // keep password empty
      } catch (err) {
        alert("Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  /* ===============================
     Input handler
  =============================== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "emp_image") {
      setFormData({ ...formData, emp_image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /* ===============================
     Submit update
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await updateUser(id, data);

      alert("User updated successfully");
      navigate("/user/list");

    } catch (err) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Fragment>
      <PageTitle
        activeMenu="Edit User"
        motherMenu="User Management"
        pageContent="Update User Details"
      />

      <Card>
        <Card.Header>
          <Card.Title>Edit User</Card.Title>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Row>

              <Col lg={6} className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>WhatsApp No *</Form.Label>
                <Form.Control
                  name="whatsapp_no"
                  value={formData.whatsapp_no}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>Gender *</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </Form.Select>
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </Form.Select>
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>Project *</Form.Label>
                <Form.Control
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>New Password (optional)</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "12px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </span>
                </div>
              </Col>

              <Col lg={6} className="mb-3">
                <Form.Label>Change Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  name="emp_image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </Col>

            </Row>

            <div className="text-center mt-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update User"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Fragment>
  );
};

export default EditUser;
