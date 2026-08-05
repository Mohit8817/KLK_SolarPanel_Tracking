import { Card, Col, Table, Badge, Button, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";

import PermissionPopup from "./AssignPermission";
import AddRole from "./AddRole";
import CommonPagination from "../Common/Pagination";
import PageHeader from "../Common/PageHeader";

import {
  getRoles,
} from "./roleapi";

const RoleList = () => {

  // =========================================
  // STATES
  // =========================================
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Permission Popup
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Add/Edit Popup
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Pagination
  const itemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(1);

  // =========================================
  // FETCH ROLES
  // =========================================
  const fetchRoles = async () => {

    try {

      setLoading(true);

      const response = await getRoles();

      console.log(
        "Roles API Response:",
        response.data
      );

      setRoles(response?.data?.data || []);

    } catch (error) {

      console.log(
        "Fetch Roles Error:",
        error
      );

      setRoles([]);

    } finally {

      setLoading(false);

    }
  };

  // =========================================
  // USE EFFECT
  // =========================================
  useEffect(() => {

    fetchRoles();

  }, []);

  // =========================================
  // PAGINATION
  // =========================================
  const totalPages = Math.ceil(
    roles.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentData = roles.slice(
    startIndex,
    startIndex + itemsPerPage
  );


  // =========================================
  // OPEN PERMISSION POPUP
  // =========================================
  const openPermission = (role) => {

    setSelectedRole(role);

    setShowPopup(true);
  };

  // =========================================
  // OPEN EDIT POPUP
  // =========================================
  const handleEdit = (role) => {

    setSelectedRole(role);

    setShowAddPopup(true);
  };

  // =========================================
  // ADD NEW ROLE
  // =========================================
  const handleAddRole = () => {

    setSelectedRole(null);

    setShowAddPopup(true);
  };

  return (
    <>
      <PageHeader
        title="Role List"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Role & Permission" },
        ]}
        action={
          <Button variant="success" size="sm" onClick={handleAddRole}>
            <i className="fa fa-plus me-1" />
            Add Role
          </Button>
        }
      />
      <Col lg={12}>

      <Card className="klk-list-card">

        <Card.Body>

          <Table
            responsive
            hover
            className="align-middle"
          >

            <thead>
              <tr>
                <th>S.No</th>
                <th>Role Name</th>
                <th>Role Code</th>
                <th>Description</th>
                <th>Status</th>
                <th>Permission</th>
                <th className="text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {/* LOADING */}
              {
                loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5"
                    >

                      <Spinner
                        animation="border"
                        variant="success"
                      />

                    </td>
                  </tr>
                ) : currentData.length === 0 ? (

                  /* NO DATA */
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5 text-muted"
                    >

                      <i className="fa fa-inbox fa-2x mb-2 d-block"></i>

                      No Roles Found

                    </td>
                  </tr>

                ) : (

                  /* TABLE DATA */
                  currentData.map((role, index) => (

                    <tr key={role._id}>

                      {/* SERIAL */}
                      <td>

                        <strong>
                          {startIndex + index + 1}
                        </strong>

                      </td>

                      {/* NAME */}
                      <td>

                        <strong>
                          {role.name}
                        </strong>

                      </td>

                      {/* CODE */}
                      <td className="text-muted">

                        {role.rolecode}

                      </td>

                      {/* DESCRIPTION */}
                      <td className="text-muted">

                        {role.description}

                      </td>

                      {/* STATUS */}
                      <td>

                        <Badge
                          bg={
                            role.status
                              ? "success"
                              : "danger"
                          }
                          className="px-3 py-2"
                        >

                          <i
                            className="fa fa-circle me-1"
                            style={{ fontSize: 8 }}
                          ></i>

                          {
                            role.status
                              ? "Active"
                              : "Inactive"
                          }

                        </Badge>

                      </td>

                      {/* PERMISSION */}
                      <td>

                        <button
                          className="btn btn-info btn-xs sharp"
                          onClick={() =>
                            openPermission(role)
                          }
                          title="Assign Permission"
                        >

                          <i className="fa fa-lock"></i>

                        </button>

                      </td>

                      {/* ACTION */}
                      <td className="text-center">

                        <div className="d-flex gap-2 justify-content-center">

                          {/* VIEW */}
                          <button
                            className="btn btn-primary btn-xs sharp"
                            title="View"
                          >

                            <i className="fa fa-eye"></i>

                          </button>

                          {/* EDIT */}
                          <button
                            className="btn btn-warning btn-xs sharp"
                            title="Edit"
                            onClick={() =>
                              handleEdit(role)
                            }
                          >

                            <i className="fa fa-edit"></i>

                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                )
              }

            </tbody>

          </Table>

          {/* PAGINATION */}
          {
            roles.length > itemsPerPage && (
              <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )
          }

        </Card.Body>

      </Card>

      {/* PERMISSION POPUP */}
      <PermissionPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        role={selectedRole}
      />

      {/* ADD / EDIT ROLE */}
      <AddRole
        show={showAddPopup}
        onClose={() => {
          setShowAddPopup(false);
          setSelectedRole(null);
        }}
        selectedRole={selectedRole}
        refreshRoles={fetchRoles}
      />

    </Col>
    </>
  );
};

export default RoleList;