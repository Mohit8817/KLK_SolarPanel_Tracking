import { useEffect, useState } from "react";
import { Card, Col, Row, Table } from "react-bootstrap";
import PageTitle from "../../layouts/PageTitle";
import CommonPagination from "../Common/Pagination";
import TableExportActions from "../Common/TableExportActions";
import Search, { useSearch } from "../Common/Search";

const OnsiteDamagePanels = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}damage/get-damage-panel-onsite`,
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

  // ── SEARCH + PAGINATION ──────────────────────────────────────────────────
  const SEARCH_KEYS = ["panel_no", "remarks"];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(data, SEARCH_KEYS, 100);
  // ─────────────────────────────────────────────────────────────────────────

  /* ================= Export ================= */
  const exportData = data.map((item, index) => ({
    sno: index + 1,
    panelNo: item.panel_no,
    damage: "Onsite Damage",
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
        activeMenu="Onsite Damage"
        motherMenu="Panel Management"
        pageContent="Onsite Damaged Panels"
      />

      <Col lg={12}>
        <Card>

          {/* HEADER */}
          <Card.Header as={Row} className="align-items-center g-2">
            <Col lg={4}>
              <Card.Title className="mb-0">
                Onsite Damage Panels
              </Card.Title>
            </Col>

            <Col lg={8} className="d-flex justify-content-end align-items-center gap-2">
              <Search
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by panel no, remarks..."
              />
              <TableExportActions
                data={exportData}
                columns={exportColumns}
                fileName="Onsite_Damage_Panels"
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
                      <th>S No.</th>
                      <th>Panel No</th>
                      <th>Damage</th>
                      <th>Remarks</th>
                      <th>Date</th>
                      <th>Image</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, index) => (
                        <tr key={item._id}>
                          <td>
                            <strong>{startIndex + index + 1}</strong>
                          </td>

                          <td>{item.panel_no}</td>

                          <td>
                            <span className="badge bg-warning text-dark">
                              Onsite Damage
                            </span>
                          </td>

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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "No onsite damaged panels found"}
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
    </>
  );
};

export default OnsiteDamagePanels;