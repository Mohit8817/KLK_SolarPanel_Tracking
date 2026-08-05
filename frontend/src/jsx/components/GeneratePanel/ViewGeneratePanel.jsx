import { useEffect, useState } from "react";
import { Card, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAllPanelLots, deletePanelLot } from "./GeneratepanelApis";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";
import { ViewAction, DeleteAction } from "../Common/ActionButtons";
import { PageLoader } from "../Common/LoadingState";

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
    <>
      <PageHeader
        title="Generated Panel Lots"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Panel Generation" },
        ]}
        action={
          <Link to="/panel/generate" className="btn btn-primary btn-sm">
            <i className="fa fa-plus me-1" /> Generate Serial
          </Link>
        }
      />
      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
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
          </ListToolbar>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <PageLoader message="Loading panel lots..." />
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
                        <td className="text-primary fw-bold">
                          {item.panel_capacity} WP
                        </td>
                        <td>
                      {{
                        "1": "Polly",
                        "2": "Mono",
                        "3": "Bifacial",
                      }[item.panel_type] || "NA"}
                    </td>
                        <td>{item.panel_alot_state}</td>
                        <td>{item.panel_alot_project}</td>
                        <td className="text-center">
                          <div className="klk-actions">
                            <ViewAction to={`/view-panel-details/${item._id}`} />
                            <DeleteAction onClick={() => handleDelete(item._id)} />
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
    </>
  );
};

export default ViewGeneratePanel;