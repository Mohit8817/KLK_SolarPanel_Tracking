import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Badge } from "react-bootstrap";
import PageTitle from "../../layouts/PageTitle";
import { getUserById } from "./userApi";

/* ===== Reusable Info Box ===== */
const InfoItem = ({ label, value }) => (
  <Col lg={3} md={4} sm={6} className="mb-3">
    <div className="border rounded p-3 h-100 shadow-sm  ">
      <p className=" fw-semibold d-block mb-1">
        {label}
      </p>
      <div className="fw-bold text-dark">
        {value || "-"}
      </div>
    </div>
  </Col>
);

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

const ViewSingleUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getUserById(id);
        setUser(res.data);
      } catch (err) {
        alert("Failed to load user");
      }
    };

    loadUser();
  }, [id]);

  if (!user) return <p className="text-center">User not found</p>;

  return (
    <>
      <PageTitle
        activeMenu="View User"
        motherMenu="User Management"
        pageContent="User Details"
      />

      <Card>
        <Card.Body>

          {/* ===== PROFILE HEADER ===== */}
          <Row className="align-items-center mb-4">
            <Col md={3} className="text-center">
              <img
                src={
                  user.emp_image
                    ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.emp_image}`
                    : "https://via.placeholder.com/140"
                }
                alt="User"
                className="rounded-circle border shadow-sm"
                width="140"
                height="140"
              />
            </Col>

            <Col md={9}>
              <h3 className="mb-1">
                {user.first_name} {user.last_name}
              </h3>
              <span className="text-muted">{user.role}</span>
            </Col>
          </Row>

          <hr />

          {/* ===== INFO GRID (LIKE DISPATCH PAGE) ===== */}
          <Row>

            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Phone" value={user.whatsapp_no} />
            <InfoItem label="Gender" value={user.gender} />
            <InfoItem label="Role" value={user.role} />

            <InfoItem label="City" value={user.city} />
            <InfoItem label="Project" value={user.project} />

            <InfoItem
              label="Status"
              value={<Badge bg="success">Active</Badge>}
            />

          </Row>

        </Card.Body>
      </Card>
    </>
  );
};

export default ViewSingleUser;