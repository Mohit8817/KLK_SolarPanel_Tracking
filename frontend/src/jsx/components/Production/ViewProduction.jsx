import { Card, Col, Table } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ViewProduction = () => {
  const [productionList, setProductionList] = useState([]);

const fetchProduction = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}production/production-panel`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProductionList(res.data.data);
  } catch (err) {
    console.log("API ERROR:", err);
  }
};

  useEffect(() => {
    fetchProduction();
  }, []);

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
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "production_panel_numbers.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("Download Error:", error);
    alert("Failed to download file");
  }
};


  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">
            View Production Details
          </Card.Title>

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
              {productionList.length > 0 ? (
                productionList.map((item, index) => (
                  <tr key={item._id}>
                    <td><strong>{index + 1}</strong></td>
                    <td>{item.date}</td>
                    <td>{item.panel_count}</td>
                    <td>{item.panel_capacity}</td>
                    <td>{item.panel_type}</td>
                    <td>{item.project}</td>
                    <td>{item.state}</td>

                    <td className="text-center">
                      <Link
                        to={`/edit-production/${item._id}`}
                        className="btn btn-primary btn-xs sharp me-2"
                      >
                        <i className="fa fa-pencil" />
                      </Link>
                      <Link
                      to={`/view-production-panels/${item._id}`}
                      className="btn btn-info btn-xs sharp"
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
                        onClick={() => console.log("Delete", item._id)}
                      >
                        <i className="fa fa-trash" />
                      </button>
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
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ViewProduction;
