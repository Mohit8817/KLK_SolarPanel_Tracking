import { useState, useEffect } from "react";
import { Card, Col, Row, Table, Badge } from "react-bootstrap";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";
import TableExportActions from "../Common/TableExportActions";
import { Link } from "react-router-dom";
import axios from "axios";

const ReceiveList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  // ── SEARCH + PAGINATION ──────────────────────────────────────────────────
  const SEARCH_KEYS = [
    "truck_no",
    "challan_no",
    "driver_name",
    "driver_no",
    "state",
    "dispatch_id",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(data, SEARCH_KEYS, 100);
  // ─────────────────────────────────────────────────────────────────────────

  // EXPORT
  const exportData = data.map((item, index) => ({
    sno: index + 1,
    dispatchId: item.dispatch_id,
    truckNo: item.truck_no,
    challanNo: item.challan_no,
    driverName: item.driver_name,
    driverNo: item.driver_no,
    state: item.state,
    totalPanels: item.dispatch_panel_count,
    collectCount: item.collect_count,
    collectStatus: item.collect_status === 0 ? "Pending" : "Received",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Dispatch ID", key: "dispatchId" },
    { label: "Truck No", key: "truckNo" },
    { label: "Challan No", key: "challanNo" },
    { label: "Driver Name", key: "driverName" },
    { label: "Driver No", key: "driverNo" },
    { label: "State", key: "state" },
    { label: "Total Panels", key: "totalPanels" },
    { label: "Collected Panels", key: "collectCount" },
    { label: "Collect Status", key: "collectStatus" },
  ];

  return (
    <Col lg={12}>
      <Card>
        {/* HEADER */}
        <Card.Header as={Row} className="align-items-center g-2">
          <Col lg={4}>
            <Card.Title className="mb-0">Receive Truck List</Card.Title>
          </Col>

          <Col lg={8} className="d-flex justify-content-end align-items-center gap-2">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by truck, challan, driver, state..."
            />
            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Receive_Truck_Report"
            />
          </Col>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <Table responsive className="table-hover align-middle">
                <thead>
                  <tr>
                    <th>S no.</th>
                    <th>Dispatch ID</th>
                    <th>Truck No</th>
                    <th>Challan No</th>
                    <th>Driver Name / Number</th>
                    <th>State</th>
                    <th>Total Panels</th>
                    <th>Collected</th>
                    <th>Collect Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td><strong>{startIndex + index + 1}</strong></td>
                        <td>{item.dispatch_id}</td>
                        <td>{item.truck_no}</td>
                        <td>{item.challan_no}</td>
                        <td>{item.driver_name} / {item.driver_no}</td>
                        <td>{item.state}</td>
                        <td>{item.dispatch_panel_count}</td>
                        <td>{item.collect_count}</td>
                        <td>
                          {item.collect_status === 0 ? (
                            <Badge bg="warning">Pending</Badge>
                          ) : (
                            <Badge bg="success">Received</Badge>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Link
                              to={`/receiver/panels/${item._id}`}
                              className="btn btn-primary btn-xs sharp me-2"
                            >
                              <i className="fa fa-pen" />
                            </Link>
                            <Link
                              to={`/receiver/fetch-panels-detail/${item._id}`}
                              className="btn btn-primary btn-xs sharp me-2"
                            >
                              <i className="fa fa-eye" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No records found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

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

export default ReceiveList;