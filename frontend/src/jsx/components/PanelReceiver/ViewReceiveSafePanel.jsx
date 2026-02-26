import { useState, useEffect } from "react";
import { Card, Col, Table, Badge } from "react-bootstrap";
import CommonPagination from "../Common/Pagination";
import { Link } from "react-router-dom";
import axios from "axios";

const ReceiveList = () => {

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);   // ✅ FIX
  const [error, setError] = useState(null);         // ✅ FIX

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-recieve-panel`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Receive Data:", res.data);

        setData(res.data?.data || res.data || []);

      } catch (err) {
        console.error("Error fetching receive panels:", err);
        setError(err.response?.data?.message || err.message);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = data.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Col lg={12}>
      <Card>
        <Card.Header>
          <Card.Title>Receive Truck List</Card.Title>
        </Card.Header>

        <Card.Body>

          {loading && <p>Loading...</p>}
          {error && <p className="text-danger">{error}</p>}

          <Table responsive hover>
            <thead>
              <tr>
                <th>S no.</th>
                <th>Truck No</th>
                <th>Challan No</th>
                <th>Driver Name / Number</th>
                <th>Total Panels</th>
                <th>Collect Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No receive data found
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item._id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.truck_no}</td>
                    <td>{item.challan_no}</td>
                    <td>{item.driver_name} / {item.driver_no}</td>
                    <td>{item.dispatch_panel_count}</td>

                    <td>
                      {item.collect_status === 0 ? (
                        <Badge bg="warning">Pending</Badge>
                      ) : (
                        <Badge bg="success">Received</Badge>
                      )}
                    </td>

                    <td>
                      <Link
                        to={`/receiver/panels/${item._id}`}
                        className="btn btn-primary btn-xs sharp me-2"
                      >
                        <i className="fa fa-pen" />
                     
                      </Link>
                        <Link
                        to={`/receiver/fetch-panesl-detail/${item._id}`}
                        className="btn btn-primary btn-xs sharp me-2"
                      >
                           <i className="fa fa-eye" />
                      </Link>
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
    </Col>
  );
};

export default ReceiveList;