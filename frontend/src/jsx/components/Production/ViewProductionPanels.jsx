import { useEffect, useState } from "react";
import { Card, Col, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

const ViewProductionPanels = () => {
  const { id } = useParams();
  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(panelList.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = panelList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (id) fetchPanels();
  }, [id]);

  const fetchPanels = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/productionlot/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPanelList(res?.data?.data || []);
    } catch (err) {
      console.log("Production Fetch Error:", err);
      setError("Failed to fetch production panels");
    } finally {
      setLoading(false);
    }
  };

  // EXPORT DATA
  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    panel_unique_no: item.panel_unique_no,
    panel_no: item.panel_no,
    capacity: item.panel_capacity,
    production_status: item.production_status === 1 ? "Assigned" : "Pending",
    dispatch_status: item.dispatch_status === 1 ? "Dispatch" : "Pending",
    damage_status: item.damage_status === 1 ? "Damage" : "Safe",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel Unique No", key: "panel_unique_no" },
    { label: "Panel No", key: "panel_no" },
    { label: "Capacity", key: "capacity" },
    { label: "Production Status", key: "production_status" },
    { label: "Dispatch Status", key: "dispatch_status" },
    { label: "Damage Status", key: "damage_status" },
  ];

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">

          <Card.Title className="mb-0">
            Production Panel Details
          </Card.Title>
          <div>
            <strong>Production ID:</strong> {id}

          </div>



          {/* EXPORT BUTTON */}
          <div>
            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Production_Panels"
            />
          </div>

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
                    <th>S No.</th>
                    <th>Panel Unique No</th>
                    <th>Panel No</th>
                    <th>Capacity</th>
                    <th>Production Status</th>
                    <th>Dispatch Status</th>
                    <th>Damage Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{item.panel_unique_no}</td>
                        <td>{item.panel_no}</td>
                        <td>{item.panel_capacity}</td>
                        <td>
                          {item.production_status === 1 ? (
                            <Badge bg="success">Assigned</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>
                        <td>
                          {item.dispatch_status === 1 ? (
                            <Badge bg="success">Dispatch</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>
                        <td>
                          {item.damage_status === 1 ? (
                            <Badge bg="warning">Damage</Badge>
                          ) : (
                            <Badge bg="success">Safe</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No panels found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* PAGINATION */}
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

export default ViewProductionPanels;