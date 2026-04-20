import { useEffect, useState } from "react";
import { Card, Col, Row, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

const ViewDispatchPanels = () => {
  const { id } = useParams();

  /* ================= STATE ================= */

  const [panelList, setPanelList]       = useState([]);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  // PAGINATION
  const itemsPerPage                    = 10;
  const [currentPage, setCurrentPage]   = useState(1);

  const totalPages  = Math.ceil(panelList.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const currentData = panelList.slice(startIndex, startIndex + itemsPerPage);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */

  useEffect(() => {
    if (id) fetchPanels();
  }, [id]);

  const fetchPanels = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel-lot/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDispatchInfo(res?.data?.dispatch || null);
      setPanelList(res?.data?.data || []);

    } catch (err) {
      console.error("Dispatch Fetch Error:", err);
      setError("Failed to fetch dispatch panels");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXPORT ================= */

  const exportData = panelList.map((item, index) => ({
    sno           : index + 1,
    panelUniqueNo : item.panel_unique_no,
    panelNo       : item.panel_no,
    capacity      : item.panel_capacity,
    panelType     : item.dispatch_panel_type === 1
                      ? "DCR"
                      : item.dispatch_panel_type === 2
                      ? "NON DCR"
                      : "-",
    dispatchStatus: item.dispatch_status === 1 ? "Dispatched" : "Pending",
    damageStatus  : item.damage_status === 1 ? "Damaged" : "Safe",
  }));

  const exportColumns = [
    { label: "S No",            key: "sno"           },
    { label: "Panel Unique No", key: "panelUniqueNo" },
    { label: "Panel No",        key: "panelNo"       },
    { label: "Capacity",        key: "capacity"      },
    { label: "Panel Type",      key: "panelType"     },
    { label: "Dispatch Status", key: "dispatchStatus"},
    { label: "Damage Status",   key: "damageStatus"  },
  ];

  /* ================= UI ================= */

  return (
    <Col lg={12}>

      {/* ── TOP: Dispatch Info Card ── */}
      {!loading && dispatchInfo && (
        <Card className="mb-3">
          <Card.Header>
            <Card.Title className="mb-0">Dispatch Information</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Dispatch ID</small>
                  <strong>{dispatchInfo.dispatch_id}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Truck No</small>
                  <strong>{dispatchInfo.truck_no}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Challan No</small>
                  <strong>{dispatchInfo.challan_no}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">State</small>
                  <strong>{dispatchInfo.state}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Driver Name</small>
                  <strong>{dispatchInfo.driver_name}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Driver No</small>
                  <strong>{dispatchInfo.driver_no}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Total Panels</small>
                  <strong>{dispatchInfo.dispatch_panel_count}</strong>
                </div>
              </Col>

              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Collect Status</small>
                  {dispatchInfo.collect_status === 1 ? (
                    <Badge bg="success">Collected</Badge>
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </div>
              </Col>

            </Row>
          </Card.Body>
        </Card>
      )}

      {/* ── BOTTOM: Panels Table Card ── */}
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <Card.Title className="mb-0">Dispatch Panel Details</Card.Title>

          <TableExportActions
            data={exportData}
            columns={exportColumns}
            fileName={`Dispatch_Panels_${dispatchInfo?.dispatch_id || id}`}
          />
        </Card.Header>

        <Card.Body>
          {loading ? (
            <p className="text-center text-muted py-4">Loading panels...</p>
          ) : error ? (
            <p className="text-danger text-center py-4">{error}</p>
          ) : (
            <>
              <Table responsive className="table-hover align-middle">
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Panel Unique No</th>
                    <th>Panel No</th>
                    <th>Capacity</th>
                    <th>Panel Type</th>
                    <th>Dispatch Status</th>
                    <th>Damage Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>

                        <td><strong>{startIndex + index + 1}</strong></td>

                        <td>{item.panel_unique_no}</td>

                        <td>{item.panel_no}</td>

                        <td>{item.panel_capacity}</td>

                        <td>
                          {item.dispatch_panel_type === 1
                            ? "DCR"
                            : item.dispatch_panel_type === 2
                            ? "NON DCR"
                            : "-"}
                        </td>

                        <td>
                          {item.dispatch_status === 1 ? (
                            <Badge bg="success">Dispatched</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>

                        <td>
                          {item.damage_status === 1 ? (
                            <Badge bg="danger">Damaged</Badge>
                          ) : (
                            <Badge bg="success">Safe</Badge>
                          )}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No panels found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* PAGINATION — same as ViewProduction */}
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