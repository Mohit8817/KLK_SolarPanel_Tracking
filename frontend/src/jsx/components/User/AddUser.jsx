import { Fragment, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { createUser } from "./userApi";

const AddUser = () => {

  const navigate = useNavigate();

  const sessionUser = JSON.parse(localStorage.getItem("user"));

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rolesList, setRolesList] = useState([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp_no: "",
    gender: "",
    role: "",
    state_access: "",
    city: "",
    project: "",
    password: "",
    emp_image: null,
  });

  // ===============================
  // FETCH ROLES
  // ===============================
const fetchRoles = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}role/get-roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRolesList(res?.data?.data || []);

  } catch (err) {
    console.log("Role Fetch Error:", err.response?.data || err.message);
    setRolesList([]);
  }
};

  useEffect(() => {
    fetchRoles();
  }, []);

  // ===============================
  // INPUT HANDLER
  // ===============================
  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (name === "emp_image") {
      setFormData({ ...formData, emp_image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const data = new FormData();

      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("email", formData.email);
      data.append("whatsapp_no", formData.whatsapp_no);
      data.append("gender", formData.gender);

      // ROLE AS OBJECT ID
      data.append("role", formData.role);

      data.append("city", formData.city);
      data.append("project", formData.project);
      data.append("password", formData.password);

      data.append("state_access", formData.state_access);

      data.append("manager", sessionUser?.first_name || "");
      data.append("created_by", sessionUser?.id || "");

      if (formData.emp_image) {
        data.append("emp_image", formData.emp_image);
      }

      await createUser(data);

      alert("User added successfully");

      navigate("/user/list");

    } catch (err) {

      console.error(err);
      alert("Failed to add user");

    } finally {

      setLoading(false);

    }
  };

  return (
    <Fragment>

      <PageTitle
        activeMenu="Add User"
        motherMenu="User Management"
        pageContent="Super Admin - Add New User"
      />

      <Card>

        <Card.Header>
          <Card.Title>Add New User</Card.Title>
        </Card.Header>

        <Card.Body>

          <Form onSubmit={handleSubmit} encType="multipart/form-data">

            <Row>

              {/* FIRST NAME */}
              <Col lg={6} className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* LAST NAME */}
              <Col lg={6} className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* EMAIL */}
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

              {/* WHATSAPP */}
              <Col lg={6} className="mb-3">
                <Form.Label>WhatsApp No *</Form.Label>
                <Form.Control
                  name="whatsapp_no"
                  value={formData.whatsapp_no}
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* GENDER */}
              <Col lg={4} className="mb-3">
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

              {/* ROLE (DYNAMIC) */}
              <Col lg={4} className="mb-3">
                <Form.Label>Role *</Form.Label>

                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>

                  {rolesList.length === 0 ? (
                    <option disabled>Loading roles...</option>
                  ) : (
                    rolesList.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))
                  )}

                </Form.Select>
              </Col>

              {/* STATE */}
              <Col lg={4} className="mb-3">
                <Form.Label>State *</Form.Label>
                <Form.Select
                  name="state_access"
                  value={formData.state_access}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  <option value="uttar_pradesh">Uttar Pradesh</option>
                  <option value="delhi">Delhi</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="bihar">Bihar</option>
                </Form.Select>
              </Col>

              {/* CITY */}
              <Col lg={6} className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* PROJECT */}
              <Col lg={6} className="mb-3">
                <Form.Label>Project *</Form.Label>
                <Form.Control
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* PASSWORD */}
              <Col lg={6} className="mb-3">
                <Form.Label>Password *</Form.Label>

                <div className="position-relative">

                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </span>

                </div>

              </Col>

              {/* IMAGE */}
              <Col lg={6} className="mb-3">
                <Form.Label>Profile Image *</Form.Label>
                <Form.Control
                  type="file"
                  name="emp_image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
              </Col>

            </Row>

            {/* SUBMIT */}
            <div className="text-center mt-3">

              <Button type="submit" disabled={loading}>

                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Add User"
                )}

              </Button>

            </div>

          </Form>

        </Card.Body>

      </Card>

    </Fragment>
  );
};

export default AddUser;