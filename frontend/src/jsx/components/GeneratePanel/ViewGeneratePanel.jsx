import { useEffect, useState, useCallback } from "react";
import { Card, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getAllPanelLots,
  deletePanelLot,
} from "./GeneratepanelApis";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

const ViewGeneratePanel = () => {
  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const res = await getAllPanelLots();
      const data = res?.data?.data || [];
      setPanelList(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await deletePanelLot(id);
      fetchLots();
    } catch (error) {
      console.log(error);
    }
  };

  // PAGINATION LOGIC
  const totalPages = Math.ceil(panelList.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = panelList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // EXPORT
  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    totalPanels: item.total_panels,
    capacity: item.panel_capacity,
    panelType: item.panel_type,
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

        {/* HEADER */}
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
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
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td>
                          <strong>
                            {startIndex + index + 1}
                          </strong>
                        </td>

                        <td>{item.date}</td>
                        <td>{item.total_panels}</td>
                        <td>{item.panel_capacity}</td>
                        <td>{item.panel_type}</td>
    <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">

                          

                          {/* VIEW */}
                          <Link
                            to={`/view-panel-details/${item._id}`}
                            className="btn btn-primary btn-xs sharp me-2"
                          >
                            <i className="fa fa-eye" />
                          </Link>

                          

                          {/* DELETE */}
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
                      <td colSpan="6" className="text-center text-muted">
                        No records found
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

export default ViewGeneratePanel;