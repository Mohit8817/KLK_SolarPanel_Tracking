import { Fragment, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { createUser } from "./userApi"; 

const AddUser = () => {
  const navigate = useNavigate();

  // 🔐 Get session user
  const sessionUser = JSON.parse(localStorage.getItem("user"));

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
     Submit form
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      data.append("company_id", sessionUser.company_id);
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("email", formData.email);
      data.append("whatsapp_no", formData.whatsapp_no);
      data.append("gender", formData.gender);
      data.append("role", formData.role);
      data.append("city", formData.city);
      data.append("project", formData.project);
      data.append("password", formData.password);

      // Backend required fields
      data.append("manager", sessionUser.first_name);
      data.append("state_access", sessionUser.state_access);
      data.append("created_by", sessionUser.id);

      if (formData.emp_image) {
        data.append("emp_image", formData.emp_image);
      }

      await createUser(data); // ✅ clean API call

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



              <Col lg={4} className="mb-3">
                <Form.Label>Gender *</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </Form.Select>
              </Col>

              <Col lg={4} className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </Form.Select>
              </Col>

    <Col lg={4} className="mb-3">
  <Form.Label>State *</Form.Label>

  <Form.Select
    name="state_access"
    value={formData.state_access}
    onChange={handleChange}
    className="form-control"
    required
  >
    <option value="">Select State</option>

    <option value="andhra_pradesh">Andhra Pradesh</option>
    <option value="arunachal_pradesh">Arunachal Pradesh</option>
    <option value="assam">Assam</option>
    <option value="bihar">Bihar</option>
    <option value="chhattisgarh">Chhattisgarh</option>
    <option value="goa">Goa</option>
    <option value="gujarat">Gujarat</option>
    <option value="haryana">Haryana</option>
    <option value="himachal_pradesh">Himachal Pradesh</option>
    <option value="jharkhand">Jharkhand</option>
    <option value="karnataka">Karnataka</option>
    <option value="kerala">Kerala</option>
    <option value="madhya_pradesh">Madhya Pradesh</option>
    <option value="maharashtra">Maharashtra</option>
    <option value="manipur">Manipur</option>
    <option value="meghalaya">Meghalaya</option>
    <option value="mizoram">Mizoram</option>
    <option value="nagaland">Nagaland</option>
    <option value="odisha">Odisha</option>
    <option value="punjab">Punjab</option>
    <option value="rajasthan">Rajasthan</option>
    <option value="sikkim">Sikkim</option>
    <option value="tamil_nadu">Tamil Nadu</option>
    <option value="telangana">Telangana</option>
    <option value="tripura">Tripura</option>
    <option value="uttar_pradesh">Uttar Pradesh</option>
    <option value="uttarakhand">Uttarakhand</option>
    <option value="west_bengal">West Bengal</option>

    {/* Union Territories */}
    <option value="andaman_nicobar">Andaman and Nicobar Islands</option>
    <option value="chandigarh">Chandigarh</option>
    <option value="dadra_nagar_haveli_daman_diu">
      Dadra and Nagar Haveli and Daman and Diu
    </option>
    <option value="delhi">Delhi (NCT)</option>
    <option value="jammu_kashmir">Jammu & Kashmir</option>
    <option value="ladakh">Ladakh</option>
    <option value="lakshadweep">Lakshadweep</option>
    <option value="puducherry">Puducherry</option>

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

            <div className="text-center mt-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Add User"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Fragment>
  );
};

export default AddUser;