import { useEffect, useState } from "react";
import { Card, Col, Row, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";
import TableExportActions from "../Common/TableExportActions";

const ViewDispatchPanels = () => {
  const { id } = useParams();
  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (id) {
      fetchPanels();
    }
  }, [id]);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/recieve-panel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("FULL RESPONSE:", res.data);

      // 🔥 Smart Data Extraction
      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data.data?.panels)) {
        data = res.data.data.panels;
      } else if (Array.isArray(res.data.panels)) {
        data = res.data.panels;
      }

      setPanelList(data);
    } catch (err) {
      console.error("Dispatch Fetch Error:", err);
      setError("Failed to fetch dispatch panels");
    } finally {
      setLoading(false);
    }
  };

  // ── SEARCH + PAGINATION ──────────────────────────────────────────────────
  const SEARCH_KEYS = [
    "panel_unique_no",
    "panel_no",
    "panel_capacity",
    "panel_category",
    "panel_lot_count",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(panelList, SEARCH_KEYS, 100);
  // ─────────────────────────────────────────────────────────────────────────

  // Helper labels (no ids shown, only readable labels)
  const getPanelTypeLabel = (val) =>
    val === 1 ? "DCR" : val === 2 ? "NON DCR" : "-";

  const getStatusLabel = (val, successText = "Yes", pendingText = "No") =>
    val === 1 ? successText : pendingText;

  // EXPORT
  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    panelUniqueNo: item.panel_unique_no,
    panelNo: item.panel_no,
    lotCount: item.panel_lot_count,
    capacity: item.panel_capacity,
    panelType: getPanelTypeLabel(item.dispatch_panel_type),
    productionStatus: getStatusLabel(item.production_status, "Done", "Pending"),
    dispatchStatus: getStatusLabel(item.dispatch_status, "Dispatch", "Pending"),
    collectStatus: getStatusLabel(item.collect_status, "Recieved", "Pending"),
    damageStatus: getStatusLabel(item.collect_damage_status, "Damaged", "Safe"),
    holdStatus: getStatusLabel(item.hold_status, "On Hold", "Active"),
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel Unique No", key: "panelUniqueNo" },
    { label: "Panel No", key: "panelNo" },
    { label: "Lot Count", key: "lotCount" },
    { label: "Capacity", key: "capacity" },
    { label: "Panel Type", key: "panelType" },
    { label: "Production Status", key: "productionStatus" },
    { label: "Dispatch Status", key: "dispatchStatus" },
    { label: "Received Status", key: "collectStatus" },
    { label: "Damage Status", key: "damageStatus" },
    { label: "Hold Status", key: "holdStatus" },
  ];

  return (
    <Col lg={12}>
      <Card>
        {/* HEADER */}
        <Card.Header as={Row} className="align-items-center g-2">
          <Col lg={4}>
            <Card.Title className="mb-0">Receive Panel Details</Card.Title>
          </Col>

          <Col lg={8} className="d-flex justify-content-end align-items-center gap-2">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by panel no, capacity..."
            />
            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Dispatch_Panel_Details"
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
                    <th>S No.</th>
                    <th>Panel Unique No</th>
                    <th>Panel No</th>
                    <th>Lot Count</th>
                    <th>Capacity</th>
                    <th>Panel Type</th>
                    <th>Production Status</th>
                    <th>Dispatch Status</th>
                    <th>Recieved Status</th>
                    <th>Damage Status</th>
                    <th>Hold Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id || index}>
                        <td><strong>{startIndex + index + 1}</strong></td>
                        <td>{item.panel_unique_no || "-"}</td>
                        <td>{item.panel_no || "-"}</td>
                        <td>{item.panel_lot_count || "-"}</td>
                        <td>{item.panel_capacity || "-"} WP</td>

                        <td>{getPanelTypeLabel(item.dispatch_panel_type)}</td>

                        <td>
                          {item.production_status === 1 ? (
                            <Badge bg="success">Done</Badge>
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
                          {item.collect_status === 1 ? (
                            <Badge bg="success">Recieved</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>

                        <td>
                          {item.collect_damage_status === 1 ? (
                            <Badge bg="danger">Damaged</Badge>
                          ) : (
                            <Badge bg="success">Safe</Badge>
                          )}
                        </td>

                        <td>
                          {item.hold_status === 1 ? (
                            <Badge bg="danger">On Hold</Badge>
                          ) : (
                            <Badge bg="secondary">Active</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No panels found"}
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

export default ViewDispatchPanels;