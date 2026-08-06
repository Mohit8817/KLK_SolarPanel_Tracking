import { Card, Table, Modal, Button } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";
import { ViewAction, AddAction, ExportAction } from "../Common/ActionButtons";
import PrefixCell from "../Common/PrefixCell";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ViewProduction = () => {
  const [productionList, setProductionList] = useState([]);

  // ── Manufactured counts map: { production_id: total_manufactured } ──────
  const [manufacturedCounts, setManufacturedCounts] = useState({});

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedProductionId, setSelectedProductionId] = useState(null);
  const [manufacturingList, setManufacturingList] = useState([]);

  const [modalForm, setModalForm] = useState({
    date: "",
    shift: "",
    panel_count: "",
    remarks: "",
  });

  // ── SEARCH + PAGINATION ──────────────────────────────────────────────────
  const SEARCH_KEYS = [
    "date",
    "prefix",
    "panel_count",
    "panel_capacity",
    "panel_type",
    "project",
    "state",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(productionList, SEARCH_KEYS, 100);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Fetch manufactured count for a single production id ─────────────────
  const fetchManufacturedCount = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/all-manufacturing-panels/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const entries = res.data.data || [];
      // Sum up all panel_count values from manufacturing entries
      const total = entries.reduce(
        (sum, entry) => sum + (Number(entry.panel_count) || 0),
        0
      );
      setManufacturedCounts((prev) => ({ ...prev, [id]: total }));
    } catch {
      setManufacturedCounts((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  // ── Fetch counts for all productions after list loads ───────────────────
  const fetchAllManufacturedCounts = async (list) => {
    await Promise.all(list.map((item) => fetchManufacturedCount(item._id)));
  };

  const handleModalOpen = (id) => {
    setSelectedProductionId(id);
    setModalForm({ date: "", shift: "", panel_count: "", remarks: "" });
    fetchManufacturingEntries(id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setManufacturingList([]);
    setSelectedProductionId(null);
  };

  const handleModalChange = (e) => {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  };

  const fetchManufacturingEntries = async (id) => {
    try {
      if (!id) return;
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/all-manufacturing-panels/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setManufacturingList(res.data.data || []);
    } catch (err) {
      console.log("Error:", err?.response?.data || err.message);
      setManufacturingList([]);
    }
  };

  const handleAddEntry = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { ...modalForm, production_id: selectedProductionId };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}production/create-manufacturing-panel`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalForm({ date: "", shift: "", panel_count: "", remarks: "" });
      fetchManufacturingEntries(selectedProductionId);

      // ── Re-fetch count for this production after adding entry ──────────
      fetchManufacturedCount(selectedProductionId);
    } catch (err) {
      console.error("Add entry error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to add entry");
    }
  };

  const fetchProduction = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/production-panel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = res.data.data || [];
      setProductionList(list);

      // ── Fetch manufactured counts for all rows ─────────────────────────
      fetchAllManufacturedCounts(list);
    } catch (err) {
      console.log("API ERROR:", err);
    }
  };
  
  useEffect(() => {
    fetchProduction();
  }, []);

  // EXPORT
  const exportData = productionList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    prefix: item.prefix,
    panel_count: item.panel_count,
    manufactured: manufacturedCounts[item._id] ?? "—",
    panel_capacity: item.panel_capacity,
    panel_type: item.panel_type,
    project: item.project,
    state: item.state,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Prefix", key: "prefix" },
    { label: "Panel Count", key: "panel_count" },
    { label: "Manufactured", key: "manufactured" },
    { label: "Capacity", key: "panel_capacity" },
    { label: "Panel Type", key: "panel_type" },
    { label: "Project", key: "project" },
    { label: "State", key: "state" },
  ];

  const downloadExcel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/export-production-panel-numbers/${id}`,
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `production_${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Error:", error.response || error);
      alert("File download failed");
    }
  };

  const deleteProduction = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}production/delete-production-panel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Deleted Successfully");

      fetchProduction();

    } catch (error) {
      console.error("Delete Error:", error);

      // Backend message handle
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete production";

      alert(message);
    }
  };

  
  // ── Helper: show only manufactured count ────────────────────────────────
  const getManufacturedCount = (manufactured) => {
    if (manufactured === undefined || manufactured === null)
      return <span className="text-muted">Loading…</span>;

    return <span>{manufactured}</span>;
  };

  return (
    <>
      <PageHeader
        title="Production List"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Production" },
        ]}
        action={
          <Link to="/production/add" className="btn btn-primary btn-sm">
            <i className="fa fa-plus me-1" /> Add Production
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
              fileName="Production_Report"
            />
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Date</th>
                <th>Prefix</th>
                <th>Panel Count</th>
                <th className="text-center">Manufactured</th>
                <th>Capacity</th>
                <th>Panel Type</th>
                <th>Project</th>
                <th>State</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{startIndex + index + 1}</strong>
                    </td>
                    <td>{item.date}</td>
                    <td><PrefixCell value={item.prefix} /></td>
                    <td>{item.panel_count}</td>

                    {/* ── Manufactured count cell ── */}
                    <td className="text-center">
                      {getManufacturedCount(manufacturedCounts[item._id])}
                    </td>

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
                    <td>{item.project}</td>
                    <td>{item.state}</td>
                    <td className="text-center">
                      <div className="klk-actions">
                        <ViewAction to={`/view-production-panels/${item._id}`} title="View panels" />
                        <AddAction onClick={() => handleModalOpen(item._id)} title="Add manufacturing entry" />
                        <ExportAction onClick={() => downloadExcel(item._id)} title="Export Excel" />
                        <button
                          className={`btn btn-xs sharp ${item.is_dispatch_locked
                              ? "btn-secondary"
                              : "btn-danger"
                            }`}
                          onClick={() => deleteProduction(item._id)}
                          disabled={item.is_dispatch_locked}
                          title={
                            item.is_dispatch_locked
                              ? "Cannot delete because some panels are dispatched"
                              : "Delete Production"
                          }
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted">
                    No production records found
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
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={handleModalClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Production Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* FORM */}
          <div className="row flex-shrink-0">
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  value={modalForm.date}
                  onChange={handleModalChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">
                  Shift <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  name="shift"
                  value={modalForm.shift}
                  onChange={handleModalChange}
                  required
                >
                  <option value="">Select Shift</option>
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">
                  Panel Count <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="panel_count"
                  placeholder="Enter number of panels"
                  value={modalForm.panel_count}
                  onChange={handleModalChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group mb-3">
                <label className="form-label">Remark</label>
                <textarea
                  className="form-control"
                  name="remarks"
                  placeholder="Enter any remarks..."
                  value={modalForm.remarks}
                  onChange={handleModalChange}
                />
              </div>
            </div>

            <div className="col-md-12 text-end mb-1">
              <Button
                variant="success"
                onClick={handleAddEntry}
                disabled={
                  !modalForm.date || !modalForm.shift || !modalForm.panel_count
                }
              >
                <i className="fa fa-plus me-1" /> Add
              </Button>
            </div>
          </div>

          {/* TABLE */}
          <div
            className="table-responsive"
            style={{ overflowY: "auto", maxHeight: "450px" }}
          >
            <table className="table table-hover align-middle">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#fff",
                  zIndex: 1,
                }}
              >
                <tr>
                  <th>S No.</th>
                  <th>Date</th>
                  <th>Prefix</th>
                  <th>Shift</th>
                  <th>Panel Count</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {manufacturingList.length > 0 ? (
                  manufacturingList.map((entry, index) => (
                    <tr key={entry._id}>
                      <td>{index + 1}</td>
                      <td>{entry.date}</td>
                      <td><PrefixCell value={entry.prefix} /></td>
                      <td>{entry.shift}</td>
                      <td>{entry.panel_count}</td>
                      <td>{entry.remarks || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No entries yet
                    </td>
                  </tr>
                )}
              </tbody>

              {/* ── Modal footer: show total of this production's entries ── */}
              {manufacturingList.length > 0 && (
                <tfoot>
                  <tr className="table fw-bold">
                    <td colSpan="4" className="text-end">
                      Total Manufactured:
                    </td>
                    <td>
                      {manufacturingList.reduce(
                        (sum, e) => sum + (Number(e.panel_count) || 0),
                        0
                      )}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewProduction;