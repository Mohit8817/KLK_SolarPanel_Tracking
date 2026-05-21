import {
  Card,
  Col,
  Table,
  Badge,
  Button,
  Spinner,
} from "react-bootstrap";

import {
  useState,
  useEffect,
} from "react";

import AddPermission from "./AddPermission";

import CommonPagination from "../Common/Pagination";

import {
  getPermissions,
  deletePermission,
} from "./permissionapi";

const PermissionList = () => {

  // =========================================
  // STATES
  // =========================================
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(false);

  // Add/Edit Popup
  const [showAddPopup, setShowAddPopup] =
    useState(false);

  const [selectedPermission, setSelectedPermission] =
    useState(null);

  // =========================================
  // PAGINATION
  // =========================================
  const itemsPerPage = 100;

  const [currentPage, setCurrentPage] =
    useState(1);

  // =========================================
  // FETCH PERMISSIONS
  // =========================================
  const fetchPermissions = async () => {

    try {

      setLoading(true);

      const response =
        await getPermissions();

      console.log(
        "Permission API Response:",
        response.data
      );

      setPermissions(
        response?.data?.data || []
      );

    } catch (error) {

      console.log(
        "Fetch Permission Error:",
        error
      );

      setPermissions([]);

    } finally {

      setLoading(false);

    }
  };

  // =========================================
  // USE EFFECT
  // =========================================
  useEffect(() => {

    fetchPermissions();

  }, []);

  // =========================================
  // PAGINATION DATA
  // =========================================
  const totalPages = Math.ceil(
    permissions.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentData = permissions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =========================================
  // DELETE PERMISSION
  // =========================================
  const handleDelete = async (id) => {

    try {

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this permission?"
      );

      if (!confirmDelete) return;

      await deletePermission(id);

      fetchPermissions();

    } catch (error) {

      console.log(
        "Delete Permission Error:",
        error
      );
    }
  };

  // =========================================
  // EDIT PERMISSION
  // =========================================
  const handleEdit = (permission) => {

    setSelectedPermission(permission);

    setShowAddPopup(true);
  };

  // =========================================
  // ADD PERMISSION
  // =========================================
  const handleAddPermission = () => {

    setSelectedPermission(null);

    setShowAddPopup(true);
  };

  return (
    <Col lg={12}>

      <Card>

        {/* HEADER */}
        <Card.Header className="d-flex justify-content-between align-items-center">

          <Card.Title className="mb-0">

            <i className="fa fa-lock me-2 text-success"></i>

            Permission List

          </Card.Title>

          <Button
            variant="success"
            size="sm"
            onClick={handleAddPermission}
          >

            <i className="fa fa-plus me-1"></i>

            Add Permission

          </Button>

        </Card.Header>

        {/* BODY */}
        <Card.Body>

          <Table
            responsive
            hover
            className="align-middle"
          >

            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Label</th>
                <th>Module</th>
                <th>Status</th>
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
                      colSpan="6"
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
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >

                      <i className="fa fa-inbox fa-2x mb-2 d-block"></i>

                      No Permissions Found

                    </td>
                  </tr>

                ) : (

                  /* TABLE DATA */
                  currentData.map(
                    (permission, index) => (

                      <tr
                        key={permission._id}
                      >

                        {/* SERIAL */}
                        <td>

                          <strong>
                            {
                              startIndex +
                              index +
                              1
                            }
                          </strong>

                        </td>

                        {/* NAME */}
                        <td>
                          {permission.name}
                        </td>

                        {/* LABEL */}
                        <td>
                          {permission.label}
                        </td>

                        {/* MODULE */}
                        <td>
                          {
                            permission.permission_module
                          }
                        </td>

                        {/* STATUS */}
                        <td>

                          <Badge
                            bg={
                              permission.status
                                ? "success"
                                : "danger"
                            }
                            className="px-3 py-2"
                          >

                            <i
                              className="fa fa-circle me-1"
                              style={{
                                fontSize: 8,
                              }}
                            ></i>

                            {
                              permission.status
                                ? "Active"
                                : "Inactive"
                            }

                          </Badge>

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
                                handleEdit(
                                  permission
                                )
                              }
                            >

                              <i className="fa fa-edit"></i>

                            </button>

                            {/* DELETE */}
                            <button
                              className="btn btn-danger btn-xs sharp"
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  permission._id
                                )
                              }
                            >

                              <i className="fa fa-trash"></i>

                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )
              }

            </tbody>

          </Table>

          {/* PAGINATION */}
          {
            permissions.length >
              itemsPerPage && (
              <CommonPagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={
                  setCurrentPage
                }
              />
            )
          }

        </Card.Body>

      </Card>

      {/* ADD / EDIT POPUP */}
      <AddPermission
        show={showAddPopup}
        onClose={() => {
          setShowAddPopup(false);
          setSelectedPermission(null);
        }}
        selectedPermission={
          selectedPermission
        }
        refreshPermissions={
          fetchPermissions
        }
      />

    </Col>
  );
};

export default PermissionList;