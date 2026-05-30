import { useEffect, useState } from "react";
import { Card, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAllPanelLots, deletePanelLot } from "./GeneratepanelApis";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";

const ViewGeneratePanel = () => {
  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLots(); }, []);

  const fetchLots = async () => {
    try {
      const res = await getAllPanelLots();
      setPanelList(res?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      await deletePanelLot(id);
      fetchLots();
    } catch (error) {
      console.log(error);
    }
  };

  // ── SEARCH + PAGINATION ──────────────────────────────────────────────────
  const SEARCH_KEYS = [
    "date",
    "total_panels",
    "panel_capacity",
    "panel_type",
    "panel_alot_state",
    "panel_alot_project",
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

  // EXPORT
  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    totalPanels: item.total_panels,
    capacity: item.panel_capacity,
    panelType: item.panel_type,
    panelState: item.panel_alot_state,
    panelProject: item.panel_alot_project,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Total Panels", key: "totalPanels" },
    { label: "Capacity", key: "capacity" },
    { label: "Panel Type", key: "panelType" },
    { label: "Panel State", key: "panelState" },
    { label: "Panel Project", key: "panelProject" },
  ];

  return (
    <Col lg={12}>
      <Card>



        {/* HEADER */}
        <Card.Header as={Row} className="align-items-center g-2">
          <Col lg={4}>
            <Card.Title className="mb-0"> View Generate Panel Serial Number
            </Card.Title>
          </Col>

          <Col lg={8} className="d-flex justify-content-end align-items-center gap-2">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by date, type, project..."
            />
            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Generated_Panel_Report"
            />
          </Col>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Table responsive className="table-hover align-middle">
                <thead>
                  <tr>
                    <th>S no.</th>
                    <th>Date</th>
                    <th>Total Panels</th>
                    <th>Capacity</th>
                    <th>Panel Type</th>
                    <th>State</th>
                    <th>Project</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td><strong>{startIndex + index + 1}</strong></td>
                        <td>{item.date}</td>
                        <td>{item.total_panels}</td>
                        <td style={{ color: "#5bcfc5" , fontWeight : "700" }}>
                          {item.panel_capacity} WP
                        </td>
                        <td>{item.panel_type == "1" ? "DCR" : "NON DCR"}</td>
                        <td>{item.panel_alot_state}</td>
                        <td>{item.panel_alot_project}</td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Link
                              to={`/view-panel-details/${item._id}`}
                              className="btn btn-primary btn-xs sharp me-2"
                            >
                              <i className="fa fa-eye" />
                            </Link>
                            <button
                              className="btn btn-danger btn-xs sharp"
                              onClick={() => handleDelete(item._id)}
                            >
                              <i className="fa fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
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

export default ViewGeneratePanel;