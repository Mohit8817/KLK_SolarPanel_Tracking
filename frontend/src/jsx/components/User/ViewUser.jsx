import { Card, Col, Table, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getUsers, deleteUser } from "./userApi"; 
<<<<<<< HEAD
=======
import CommonPagination from "../Common/Pagination";
>>>>>>> origin/mohitdev

const ViewUser = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //  SAME PAGINATION CONFIG
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

 
    //  Fetch users

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  /* ===============================
     Delete user
  =============================== */
=======
 
    //  Delete user

>>>>>>> origin/mohitdev
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id);
<<<<<<< HEAD
      fetchUsers(); // refresh table
=======
      setUsers((prev) => prev.filter((u) => u._id !== id));
>>>>>>> origin/mohitdev
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

 
  // PAGINATION LOGIC 


  const totalPages = Math.ceil(users.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = users.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Col lg={12}>
      <Card>

        <Card.Header>
          <Card.Title>User List</Card.Title>
        </Card.Header>

        <Card.Body>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Table responsive className="table-hover align-middle">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>City</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

<<<<<<< HEAD
                      {/* Profile Image */}
                      <td>
                        <img
                          src={
                            user.emp_image
                              ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.emp_image}`
                              : "https://via.placeholder.com/45"
                          }
                          alt="User"
                          width="45"
                          height="45"
                          className="rounded-circle border"
                        />
                      </td>

                      {/* Name */}
                      <td>
                        <strong>
                          {user.first_name} {user.last_name}
                        </strong>
                      </td>

                      <td>{user.email}</td>
                      <td>{user.whatsapp_no}</td>
                      <td>{user.gender}</td>
                      <td>{user.role}</td>
                      <td>{user.city}</td>
                      <td>{user.project}</td>

                      <td>
                        <Badge bg="success">Active</Badge>
                      </td>

                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">

                          <Link
                            to={`/user/view/${user._id}`}
                            className="btn btn-primary btn-xs sharp"
                          >
                            <i className="fa fa-eye"></i>
                          </Link>

                          <Link
                            to={`/user/edit/${user._id}`}
                            className="btn btn-warning btn-xs sharp"
                          >
                            <i className="fa fa-edit"></i>
                          </Link>

                          <button
                            className="btn btn-danger btn-xs sharp"
                            onClick={() => handleDelete(user._id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>

                        </div>
=======
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center text-muted">
                        No users found
>>>>>>> origin/mohitdev
                      </td>

                    </tr>
                  ) : (
                    currentData.map((user, index) => (
                      <tr key={user._id}>
                        <td>
                          <strong>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </strong>
                        </td>

                        {/* Profile */}
                        <td>
                          <img
                            src={
                              user.emp_image
                                ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.emp_image}`
                                : "https://via.placeholder.com/45"
                            }
                            width="45"
                            height="45"
                            className="rounded-circle border"
                          />
                        </td>

                        <td>
                          <strong>
                            {user.first_name} {user.last_name}
                          </strong>
                        </td>

                        <td>{user.email}</td>
                        <td>{user.whatsapp_no}</td>
                        <td>{user.gender}</td>
                        <td>{user.role}</td>
                        <td>{user.city}</td>
                        <td>{user.project}</td>

                        <td>
                          <Badge bg="success">Active</Badge>
                        </td>

                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">

                            <Link
                              to={`/user/view/${user._id}`}
                              className="btn btn-primary btn-xs sharp"
                            >
                              <i className="fa fa-eye"></i>
                            </Link>

                            <Link
                              to={`/user/edit/${user._id}`}
                              className="btn btn-warning btn-xs sharp"
                            >
                              <i className="fa fa-edit"></i>
                            </Link>

                            <button
                              className="btn btn-danger btn-xs sharp"
                              onClick={() => handleDelete(user._id)}
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

              {/* PAGINATION COMPONENT */}
              <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

        </Card.Body>
      </Card>
    </Col>
  );
};

export default ViewUser;