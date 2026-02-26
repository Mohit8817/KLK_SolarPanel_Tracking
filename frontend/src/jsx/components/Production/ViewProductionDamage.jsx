import { useEffect, useState } from "react";
import { Card, Col, Table } from "react-bootstrap";
import PageTitle from "../../layouts/PageTitle";
import CommonPagination from "../Common/Pagination";
import TableExportActions from "../Common/TableExportActions";

const ProductionDamagePanels = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}damage/get-production-damage-panel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (res.ok) {
        setData(result.data || []);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Pagination ================= */
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = data.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ================= Export Data ================= */
  const exportData = data.map((item, index) => ({
    sno: index + 1,
    panelNo: item.panel_no,
    damage: "Production Damage",
    remarks: item.remarks || "-",
    date: new Date(item.createdAt).toLocaleDateString(),
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel No", key: "panelNo" },
    { label: "Damage", key: "damage" },
    { label: "Remarks", key: "remarks" },
    { label: "Date", key: "date" },
  ];

  return (
    <>
      <PageTitle
        activeMenu="Production Damage"
        motherMenu="Panel Management"
        pageContent="Production Damaged Panels"
      />

      <Col lg={12}>
        <Card>

          {/* HEADER */}
          <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Card.Title className="mb-0">
              Production Damage Panels
            </Card.Title>

            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Production_Damage_Panels"
            />
          </Card.Header>

          <Card.Body>

            {loading ? (
              <p>Loading...</p>
            ) : data.length === 0 ? (
              <p className="text-muted text-center">
                No Production damaged panels found
              </p>
            ) : (
              <>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>S No</th>
                      <th>Panel No</th>
                      <th>Damage</th>
                      <th>Remarks</th>
                      <th>Date</th>
                      <th>Image</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{item.panel_no}</td>
                        <td>Production Damage</td>
                        <td>{item.remarks || "-"}</td>
                        <td>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {item.image ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`}
                              alt="damage"
                              width="50"
                              style={{ borderRadius: "6px" }}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
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
    </>
  );
};

export default ProductionDamagePanels;