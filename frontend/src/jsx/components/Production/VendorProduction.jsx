import { Card, Col, Table, Modal, Button } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ReleaseProduction from "./ReleaseProduction";

const VendorProduction = () => {
  const [productionList, setProductionList] = useState([]);

  // Modal state
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // PAGINATION
  const itemsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(productionList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = productionList.slice(startIndex, startIndex + itemsPerPage);

  // Fetch Vendor Production List
  const fetchVendorProduction = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}production/vendor-production-panel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductionList(res.data.data);
    } catch (err) {
      console.log("API ERROR:", err);
    }
  };

  useEffect(() => {
    fetchVendorProduction();
  }, []);

  // Open Release Modal
  const handleOpenReleaseModal = (item) => {
    setSelectedItem(item);
    setShowReleaseModal(true);
  };

  // Close Release Modal
  const handleCloseReleaseModal = () => {
    setShowReleaseModal(false);
    setSelectedItem(null);
  };

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
      link.download = `vendor_production_${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Error:", error.response || error);
      alert("File download failed");
    }
  };

  // Export Data
  const exportData = productionList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    panel_count: item.panel_count,
    Old_panel_count: item.old_panel_count,
    panel_capacity: item.panel_capacity,
    panel_type: item.panel_type,
    project: item.project,
    state: item.state,
    vendor_name: item.vendor_details
      ? `${item.vendor_details.first_name} ${item.vendor_details.last_name}`
      : "—",
    vendor_email: item.vendor_details?.email || "—",
    vendor_whatsapp: item.vendor_details?.whatsapp_no || "—",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Panel Count", key: "panel_count" },
    { label: "Old Panel Count", key: "old_panel_count" },

    { label: "Capacity", key: "panel_capacity" },
    { label: "Panel Type", key: "panel_type" },
    { label: "Project", key: "project" },
    { label: "State", key: "state" },
    { label: "Vendor Name", key: "vendor_name" },
    { label: "Vendor Email", key: "vendor_email" },
    { label: "Vendor WhatsApp", key: "vendor_whatsapp" },
  ];

  return (
    <>
      <PageHeader
        title="Vendor Production List"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Production" },
        ]}
      />
      <Col lg={12}>
      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Vendor_Production_Report"
            />
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Date</th>
                <th>Current Count</th>
                <th>Old Panel Count</th>
                <th>Capacity</th>
                <th>Panel Type</th>
                <th>Project</th>
                <th>State</th>
                <th>Vendor Name</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th className="text-center">Release Panel</th>
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
                    <td>{item.panel_count}</td>
                    <td>{item.old_panel_count}</td>
                    <td>{item.panel_capacity}</td>
                    <td>
                      {{
                        "1": "Polly",
                        "2": "Mono",
                        "3": "Bifacial",
                      }[item.panel_type] || "NA"}
                    </td>
                    <td>{item.project}</td>
                    <td>{item.state}</td>
                    <td>
                      {item.vendor_details
                        ? `${item.vendor_details.first_name} ${item.vendor_details.last_name}`
                        : "—"}
                    </td>
                    <td>{item.vendor_details?.email || "—"}</td>
                    <td>{item.vendor_details?.whatsapp_no || "—"}</td>


                    {/* Release Panel Column */}
                    <td className="text-center">
                      <button
                        className="btn btn-warning btn-xs sharp"
                        title="Release Panel"
                        onClick={() => handleOpenReleaseModal(item)}
                      >
                        <i className="fa fa-paper-plane" />
                      </button>
                    </td>


                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Link
                          to={`/view-production-panels/${item._id}?vendor=1`}
                          className="btn btn-info btn-xs sharp me-2"
                        >
                          <i className="fa fa-eye" />
                        </Link>

                        <button
                          className="btn btn-success btn-xs sharp me-2"
                          onClick={() => downloadExcel(item._id)}
                        >
                          <i className="fa fa-file-excel" />
                        </button>
                      </div>
                    </td>


                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center text-muted">
                    No vendor production records found
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

      {/*  Release Production Modal */}
      <Modal
        show={showReleaseModal}
        onHide={handleCloseReleaseModal}
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Release Panel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <ReleaseProduction
              item={selectedItem}
              onClose={handleCloseReleaseModal}
              onSuccess={() => {
                handleCloseReleaseModal();
                fetchVendorProduction();
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Col>
    </>
  );
};

export default VendorProduction;