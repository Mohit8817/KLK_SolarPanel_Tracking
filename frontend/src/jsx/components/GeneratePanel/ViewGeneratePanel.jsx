import { useEffect, useState, useCallback } from "react";
import { Card, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

const ViewGeneratePanel = () => {
  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION STATE
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  const fetchLots = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}panels/all-panel-serial`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const safeData = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setPanelList(safeData);
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this panel?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}panels/delete-panel-serial/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPanelList((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log("Delete Error:", error);
      alert("Delete failed");
    }
  };

  // PAGINATION LOGIC
  const totalPages = Math.ceil(panelList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = panelList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // EXPORT DATA
  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    date: item.date || "-",
    totalPanels: item.total_panels || "-",
    capacity: item.panel_capacity || "-",
    panelType: item.panel_type || "-",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Total Panels", key: "totalPanels" },
    { label: "Capacity", key: "capacity" },
    { label: "Panel Type", key: "panelType" },
  ];

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">
            View Generate Panel Serial Number
          </Card.Title>

          <TableExportActions
            data={exportData}
            columns={exportColumns}
            fileName="Generated_Panel_Report"
          />
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
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td>
                          <strong>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </strong>
                        </td>

                        <td>{item.date}</td>
                        <td>{item.total_panels}</td>
                        <td>{item.panel_capacity}</td>
                        <td>{item.panel_type}</td>

                        <td className="text-center">
                          <Link
                            to={`/edit-panel/${item._id}`}
                            className="btn btn-primary btn-xs sharp me-2"
                          >
                            <i className="fa fa-pencil" />
                          </Link>

                          <Link
                            to={`/view-panel-details/${item._id}`}
                            className="btn btn-info btn-xs sharp me-2"
                          >
                            <i className="fa fa-eye" />
                          </Link>

                          <button
                            className="btn btn-danger btn-xs sharp"
                            onClick={() => handleDelete(item._id)}
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No records found
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