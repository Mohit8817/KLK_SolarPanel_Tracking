import {
  Fragment,
  useEffect,
  useState,
} from "react";

import PageTitle from "../../layouts/PageTitle";

import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getUserById,
  updateUser,
} from "./userApi";

import {
  getRoles,
} from "../RolePermission/roleapi";

const EditUser = () => {

  // =========================================
  // ROUTER
  // =========================================
  const { id } = useParams();

  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================
  const [showPassword, setShowPassword] =
    useState(false);

  const [userLoading, setUserLoading] =
    useState(true);

  const [rolesLoading, setRolesLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [rolesList, setRolesList] =
    useState([]);

  const [formData, setFormData] =
    useState({
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

  // =========================================
  // FETCH ROLES
  // =========================================
  const fetchRoles = async () => {

    try {

      setRolesLoading(true);

      const res = await getRoles();

      console.log(
        "Roles Response:",
        res.data
      );

      setRolesList(
        res?.data?.data || []
      );

    } catch (err) {

      console.log(
        "Role fetch error:",
        err
      );

      setRolesList([]);

    } finally {

      setRolesLoading(false);

    }
  };

  // =========================================
  // FETCH USER DATA
  // =========================================
  const loadUser = async () => {

    try {

      setUserLoading(true);

      const userRes =
        await getUserById(id);

      console.log(
        "User Response:",
        userRes.data
      );

      const user =
        userRes?.data?.data ||
        userRes?.data ||
        {};

      setFormData({
        first_name:
          user.first_name || "",

        last_name:
          user.last_name || "",

        email:
          user.email || "",

        whatsapp_no:
          user.whatsapp_no || "",

        gender:
          user.gender || "",

        role:
          user.role?._id ||
          user.role ||
          "",

        city:
          user.city || "",

        project:
          user.project || "",

        password: "",

        emp_image: null,
      });

    } catch (err) {

      console.log(
        "User Fetch Error:",
        err
      );

      alert(
        "Failed to load user details"
      );

    } finally {

      setUserLoading(false);

    }
  };

  // =========================================
  // USE EFFECT
  // =========================================
  useEffect(() => {

    loadUser();

    fetchRoles();

  }, [id]);

  // =========================================
  // HANDLE CHANGE
  // =========================================
  const handleChange = (e) => {

    const {
      name,
      value,
      files,
    } = e.target;

    // IMAGE
    if (name === "emp_image") {

      setFormData((prev) => ({
        ...prev,
        emp_image: files[0],
      }));

    } else {

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // =========================================
  // SUBMIT UPDATE
  // =========================================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      const data =
        new FormData();

      Object.keys(formData).forEach(
        (key) => {

          const value =
            formData[key];

          // Skip Empty Password
          if (
            key === "password" &&
            !value
          ) {
            return;
          }

          if (
            value !== null &&
            value !== undefined
          ) {

            data.append(
              key,
              value
            );
          }
        }
      );

      await updateUser(
        id,
        data
      );

      alert(
        "User Updated Successfully"
      );

      navigate("/user/list");

    } catch (err) {

      console.log(
        "Update Error:",
        err
      );

      alert(
        "Failed to update user"
      );

    } finally {

      setSaving(false);

    }
  };

  // =========================================
  // PAGE LOADING
  // =========================================
  if (userLoading) {

    return (
      <div className="text-center mt-5">

        <Spinner
          animation="border"
          variant="primary"
        />

      </div>
    );
  }

  return (
    <Fragment>

      {/* PAGE TITLE */}
      <PageTitle
        activeMenu="Edit User"
        motherMenu="User Management"
        motherLink="/user/list"
        pageContent="Update User Details"
      />

      <Card className="klk-form-card">

        <Card.Body>

          <Form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >

            <Row>

              {/* FIRST NAME */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  First Name *
                </Form.Label>

                <Form.Control
                  type="text"
                  name="first_name"
                  value={
                    formData.first_name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </Col>

              {/* LAST NAME */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  Last Name *
                </Form.Label>

                <Form.Control
                  type="text"
                  name="last_name"
                  value={
                    formData.last_name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </Col>

              {/* EMAIL */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  Email *
                </Form.Label>

                <Form.Control
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </Col>

              {/* WHATSAPP */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  WhatsApp No *
                </Form.Label>

                <Form.Control
                  type="text"
                  name="whatsapp_no"
                  value={
                    formData.whatsapp_no
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </Col>

              {/* GENDER */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  Gender *
                </Form.Label>

                <Form.Select
                  name="gender"
                  value={
                    formData.gender
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select Gender
                  </option>

                  <option value="M">
                    Male
                  </option>

                  <option value="F">
                    Female
                  </option>

                  <option value="O">
                    Other
                  </option>

                </Form.Select>

              </Col>

              {/* ROLE */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  Role *
                </Form.Label>

                <Form.Select
                  name="role"
                  value={
                    formData.role
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select Role
                  </option>

                  {
                    rolesLoading ? (
                      <option disabled>
                        Loading Roles...
                      </option>
                    ) : (
                      rolesList.map(
                        (role) => (
                          <option
                            key={
                              role._id
                            }
                            value={
                              role._id
                            }
                          >

                            {
                              role.name
                            }

                          </option>
                        )
                      )
                    )
                  }

                </Form.Select>

              </Col>

              {/* CITY */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  City *
                </Form.Label>

                <Form.Control
                  type="text"
                  name="city"
                  value={
                    formData.city
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </Col>

              {/* PROJECT */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  Project *
                </Form.Label>

                <Form.Control
                  type="text"
                  name="project"
                  value={
                    formData.project
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </Col>

              {/* PASSWORD */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  New Password
                </Form.Label>

                <div className="position-relative">

                  <Form.Control
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter New Password"
                  />

                  <span
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      top: "50%",
                      right: "15px",
                      transform:
                        "translateY(-50%)",
                      cursor:
                        "pointer",
                    }}
                  >

                    <i
                      className={`fa ${
                        showPassword
                          ? "fa-eye-slash"
                          : "fa-eye"
                      }`}
                    ></i>

                  </span>

                </div>

              </Col>

              {/* IMAGE */}
              <Col
                lg={6}
                className="mb-3"
              >

                <Form.Label>
                  Profile Image
                </Form.Label>

                <Form.Control
                  type="file"
                  name="emp_image"
                  accept="image/*"
                  onChange={
                    handleChange
                  }
                />

              </Col>

            </Row>

            {/* SUBMIT BUTTON */}
            <div className="klk-form-actions">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >

                {
                  saving ? (
                    <>

                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />

                      Updating...

                    </>
                  ) : (
                    <>

                      <i className="fa fa-save me-2"></i>

                      Update User

                    </>
                  )
                }

              </Button>

            </div>

          </Form>

        </Card.Body>

      </Card>

    </Fragment>
  );
};

export default EditUser;