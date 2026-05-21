import { Card, Col, Table } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const VendorProduction = () => {
  const [productionList, setProductionList] = useState([]);

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
      fetchVendorProduction();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete");
    }
  };

  // Export Data
  const exportData = productionList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    panel_count: item.panel_count,
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
    { label: "Capacity", key: "panel_capacity" },
    { label: "Panel Type", key: "panel_type" },
    { label: "Project", key: "project" },
    { label: "State", key: "state" },
    { label: "Vendor Name", key: "vendor_name" },
    { label: "Vendor Email", key: "vendor_email" },
    { label: "Vendor WhatsApp", key: "vendor_whatsapp" },
  ];

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <Card.Title className="mb-0">View Vendor Production Details</Card.Title>
          <TableExportActions
            data={exportData}
            columns={exportColumns}
            fileName="Vendor_Production_Report"
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
                <th>Vendor Name</th>
                <th>Email</th>
                <th>WhatsApp</th>
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
                    <td>{item.panel_capacity}</td>
                    <td>{item.panel_type}</td>
                    <td>{item.project}</td>
                    <td>{item.state}</td>
                    <td>
                      {item.vendor_details
                        ? `${item.vendor_details.first_name} ${item.vendor_details.last_name}`
                        : "—"}
                    </td>
                    <td>{item.vendor_details?.email || "—"}</td>
                    <td>{item.vendor_details?.whatsapp_no || "—"}</td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Link
                          to={`/view-production-panels/${item._id}`}
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
                  <td colSpan="11" className="text-center text-muted">
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
    </Col>
  );
};

export default VendorProduction;