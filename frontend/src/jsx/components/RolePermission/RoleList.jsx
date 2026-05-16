import { Card, Col, Table, Badge, Button } from "react-bootstrap";
import { useState } from "react";
import PermissionPopup from "./AssignPermission";
import AddRole from "./AddRole";
import CommonPagination from "../Common/Pagination";

const RoleList = () => {
  const [roles, setRoles] = useState([
    { name: "Admin", rolecode: "ADM001", description: "Full Access", status: "Active" },
    { name: "Operator", rolecode: "OPR001", description: "Solar Tracking", status: "Active" },
    { name: "Manager", rolecode: "MGR001", description: "Reports Access", status: "Inactive" },
  ]);

  // Permission Popup
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Add Role Popup
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(roles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = roles.slice(startIndex, startIndex + itemsPerPage);

  // Add Role
  const handleAddRole = (newRole) => {
    setRoles((prev) => [...prev, newRole]);
  };

  // Delete
  const handleDelete = (index) => {
    const actualIndex = startIndex + index;
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    setRoles((prev) => prev.filter((_, i) => i !== actualIndex));
    if (currentData.length === 1 && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  // Permission Popup
  const openPermission = (role) => {
    setSelectedRole(role);
    setShowPopup(true);
  };

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">
            <i className="fa fa-shield-alt me-2 text-success"></i>
            Role List
          </Card.Title>

          <Button
            variant="success"
            size="sm"
            onClick={() => setShowAddPopup(true)}
          >
            <i className="fa fa-plus me-1"></i> Add Role
          </Button>
        </Card.Header>

        <Card.Body>
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Role Name</th>
                <th>Role Code</th>
                <th>Description</th>
                <th>Status</th>
                <th>Permission</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="fa fa-inbox fa-2x mb-2 d-block"></i>
                    No Roles Found
                  </td>
                </tr>
              ) : (
                currentData.map((role, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{startIndex + index + 1}</strong>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                      
                        <strong>{role.name}</strong>
                      </div>
                    </td>

                    <td className="text-muted">{role.rolecode}</td>
                    <td className="text-muted">{role.description}</td>

                    <td>
                      <Badge
                        bg={role.status === "Active" ? "success" : "danger"}
                        className="px-3 py-2"
                      >
                        <i className="fa fa-circle me-1" style={{ fontSize: 8 }}></i>
                        {role.status}
                      </Badge>
                    </td>

                    <td>
                      <button
                        className="btn btn-info btn-xs sharp"
                        onClick={() => openPermission(role)}
                        title="Assign Permission"
                      >
                        <i className="fa fa-lock"></i>
                      </button>
                    </td>

                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-primary btn-xs sharp" title="View">
                          <i className="fa fa-eye"></i>
                        </button>

                        <button className="btn btn-warning btn-xs sharp" title="Edit">
                          <i className="fa fa-edit"></i>
                        </button>

                        <button
                          className="btn btn-danger btn-xs sharp"
                          title="Delete"
                          onClick={() => handleDelete(index)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <CommonPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card.Body>
      </Card>

      {/* Permission Popup */}
      <PermissionPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        role={selectedRole}
      />

      {/* Add Role Popup */}
      <AddRole
        show={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onAdd={handleAddRole}
      />
    </Col>
  );
};

export default RoleList;