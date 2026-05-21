    import { Card, Col, Table, Badge, Button } from "react-bootstrap";
    import { useState } from "react";
    import AddPermission from "./AddPermission";
    import CommonPagination from "../Common/Pagination";

    const PermissionList = () => {
    const [permissions, setPermissions] = useState([
        {
        key: "generate_panel",
        label: "Generate Panel",
        module: "Generate Panel",
        action: "Active",
        },
        {
        key: "view_dispatch",
        label: "View Dispatch",
        module: "Dispatch",
        action: "Active",
        },
        {
        key: "delete_panel",
        label: "Delete Panel",
        module: "Panel",
        action: "Inactive",
        },
    ]);

    // Add Popup
    const [showAddPopup, setShowAddPopup] = useState(false);

    // Pagination
    const itemsPerPage = 30;

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(permissions.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentData = permissions.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Add Permission
    const handleAddPermission = (newPermission) => {
        setPermissions((prev) => [...prev, newPermission]);
    };

    // Delete Permission
    const handleDelete = (index) => {
        const actualIndex = startIndex + index;

        if (
        !window.confirm(
            "Are you sure you want to delete this permission?"
        )
        )
        return;

        setPermissions((prev) =>
        prev.filter((_, i) => i !== actualIndex)
        );

        if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
        }
    };

    return (
        <Col lg={12}>
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0">
                <i className="fa fa-lock me-2 text-success"></i>
                Permission List
            </Card.Title>

            <Button
                variant="success"
                size="sm"
                onClick={() => setShowAddPopup(true)}
            >
                <i className="fa fa-plus me-1"></i>
                Add Permission
            </Button>
            </Card.Header>

            <Card.Body>
            <Table responsive hover className="align-middle">
                <thead>
                <tr>
                    <th>S.No</th>
                    <th>Key</th>
                    <th>Label</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th className="text-center">Action</th>
                </tr>
                </thead>

                <tbody>
                {currentData.length === 0 ? (
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
                    currentData.map((permission, index) => (
                    <tr key={index}>
                        <td>
                        <strong>
                            {startIndex + index + 1}
                        </strong>
                        </td>

                        <td>
                        {permission.key}
                        </td>

                        <td>{permission.label}</td>

                        <td>{permission.module}</td>

                        <td>
                        <Badge
                            bg={
                            permission.action === "Active"
                                ? "success"
                                : "danger"
                            }
                            className="px-3 py-2"
                        >
                            <i
                            className="fa fa-circle me-1"
                            style={{ fontSize: 8 }}
                            ></i>

                            {permission.action}
                        </Badge>
                        </td>

                        <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                            <button
                            className="btn btn-primary btn-xs sharp"
                            title="View"
                            >
                            <i className="fa fa-eye"></i>
                            </button>

                            <button
                            className="btn btn-warning btn-xs sharp"
                            title="Edit"
                            >
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

        {/* Add Permission Popup */}
        <AddPermission
            show={showAddPopup}
            onClose={() => setShowAddPopup(false)}
            onAdd={handleAddPermission}
        />
        </Col>
    );
    };

    export default PermissionList;