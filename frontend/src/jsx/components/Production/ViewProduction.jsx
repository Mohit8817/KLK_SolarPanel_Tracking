import { Card, Col, Table, Modal, Button } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ViewProduction = () => {
  const [productionList, setProductionList] = useState([]);

  // PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(productionList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = productionList.slice(startIndex, startIndex + itemsPerPage);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalForm, setModalForm] = useState({
    date: "",
    shift: "",
    panel_count: "",
    remark: "",
  });

  const handleModalOpen = (id) => {
    setSelectedId(id);
    setModalForm({ date: "", shift: "", panel_count: "", remark: "" });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const handleModalChange = (e) => {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  };

  const handleModalSubmit = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}production/add-entry/${selectedId}`,
        modalForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Entry saved successfully!");
      handleModalClose();
      fetchProduction();
    } catch (error) {
      console.error("Modal Submit Error:", error);
      alert("Failed to save entry");
    } finally {
      setModalLoading(false);
    }
  };

  // Fetch Production List
  const fetchProduction = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/production-panel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductionList(res.data.data);
    } catch (err) {
      console.log("API ERROR:", err);
    }
  };

  useEffect(() => { fetchProduction(); }, []);

  // Export Data
  const exportData = productionList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    panel_count: item.panel_count,
    panel_capacity: item.panel_capacity,
    panel_type: item.panel_type,
    project: item.project,
    state: item.state,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Panel Count", key: "panel_count" },
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
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}production/delete-production-panel/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Deleted Successfully");
      fetchProduction();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete");
    }
  };

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <Card.Title className="mb-0">View Production Details</Card.Title>
          <TableExportActions
            data={exportData}
            columns={exportColumns}
            fileName="Production_Report"
          />
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Date</th>
                <th>Panel Count</th>
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
                    <td><strong>{startIndex + index + 1}</strong></td>
                    <td>{item.date}</td>
                    <td>{item.panel_count}</td>
                    <td>{item.panel_capacity}</td>
                    <td>{item.panel_type}</td>
                    <td>{item.project}</td>
                    <td>{item.state}</td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">

                        <Link
                          to={`/view-production-panels/${item._id}`}
                          className="btn btn-info btn-xs sharp me-2"
                        >
                          <i className="fa fa-eye" />
                        </Link>

                        {/*NEW BUTTON — opens modal */}
                        <button
                          className="btn btn-primary btn-xs sharp me-2"
                          onClick={() => handleModalOpen(item._id)}
                          title="Add Entry"
                        >
                          <i className="fa fa-plus" />
                        </button>

                        <button
                          className="btn btn-success btn-xs sharp me-2"
                          onClick={() => downloadExcel(item._id)}
                        >
                          <i className="fa fa-file-excel" />
                        </button>

                        <button
                          className="btn btn-danger btn-xs sharp"
                          onClick={() => deleteProduction(item._id)}
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
      <Modal className="w-100" show={showModal} onHide={handleModalClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Production Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* FORM — fixed, no scroll */}
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
                  name="remark"
                  placeholder="Enter any remarks..."
                  value={modalForm.remark}
                  onChange={handleModalChange}
                />
              </div>
            </div>

            <div className="col-md-12 text-end mb-1">
              <Button
                variant="success"
                disabled={!modalForm.date || !modalForm.shift || !modalForm.panel_count}
              >
                <i className="fa fa-plus me-1" /> Add
              </Button>
            </div>
          </div>

          {/* TABLE — scrollable only */}
          <div className="table-responsive" style={{ overflowY: "auto", maxHeight: "450px" }}>
            <table className="table table-hover align-middle">
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                <tr>
                  <th>S No.</th>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Panel Count</th>
                  <th>Remark</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>

                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sno</td>
                  <td>Date</td>
                  <td>Shift  </td>
                  <td>
                    panel count
                  </td>
                  <td>done</td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-xs sharp"

                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </Modal.Body>


      </Modal>
    </Col>
  );
};

export default ViewProduction;