import { useEffect, useState } from "react";
import { Card, Col, Row, Table, Badge, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";
import PrefixCell from "../Common/PrefixCell";

const ViewDispatchPanels = () => {
  const { id } = useParams();

  /* ================= STATE ================= */

  const [panelList, setPanelList] = useState([]);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */

  useEffect(() => {
    if (id) fetchPanels();
  }, [id]);

  const fetchPanels = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel-lot/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDispatchInfo(res?.data?.dispatch || null);
      setPanelList(res?.data?.data || []);

    } catch (err) {
      console.error("Dispatch Fetch Error:", err);
      setError("Failed to fetch dispatch panels");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeletePanel = async (panelId, panelNo) => {
    if (!window.confirm("Are you sure you want to delete this panel?")) return;

    try {
      setDeletingId(panelId);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/scan-panel-delete`,
        {
          panel_no: panelNo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setPanelList((prev) => prev.filter((p) => p._id !== panelId));

    } catch (err) {
      console.error("Delete Error:", err);

      alert(
        err?.response?.data?.message || "Failed to delete panel"
      );
    } finally {
      setDeletingId(null);
    }
  };


  /* ================= SEARCH + PAGINATION ================= */

  const SEARCH_KEYS = [
    "panel_unique_no",
    "panel_no",
    "panel_capacity",
    "prefix",
    "dispatch_panel_type",
    "dispatch_status",
    "damage_status",
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

  /* ================= EXPORT ================= */

  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    panelUniqueNo: item.panel_unique_no,
    prefix: item.prefix,
    panelNo: item.panel_no,
    capacity: item.panel_capacity,
    panelType: item.dispatch_panel_type === 1
      ? "DCR"
      : item.dispatch_panel_type === 2
        ? "NON DCR"
        : "-",
    dispatchStatus: item.dispatch_status === 1 ? "Dispatched" : "Pending",
    damageStatus: item.damage_status === 1 ? "Damaged" : "Safe",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel Unique No", key: "panelUniqueNo" },
    { label: "Prefix", key: "prefix" },
    { label: "Panel No", key: "panelNo" },
    { label: "Capacity", key: "capacity" },
    { label: "Panel Type", key: "panelType" },
    { label: "Dispatch Status", key: "dispatchStatus" },
    { label: "Damage Status", key: "damageStatus" },
  ];

  /* ================= PDF DOWNLOAD ================= */

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 14;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Dispatch Details Report", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 8;

    doc.setDrawColor(180, 180, 180);
    doc.line(14, cursorY, pageWidth - 14, cursorY);
    cursorY += 6;

    if (dispatchInfo) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Dispatch Information", 14, cursorY);
      cursorY += 5;

      const infoFields = [
        ["Dispatch ID", dispatchInfo.dispatch_id ?? "-"],
        ["Truck No", dispatchInfo.truck_no ?? "-"],
        ["Challan No", dispatchInfo.challan_no ?? "-"],
        ["State", dispatchInfo.state ?? "-"],
        ["Driver Name", dispatchInfo.driver_name ?? "-"],
        ["Driver No", dispatchInfo.driver_no ?? "-"],
        ["Total Panels", String(dispatchInfo.dispatch_panel_count ?? "-")],
        ["Collect Status", dispatchInfo.collect_status === 1 ? "Collected" : "Pending"],
      ];

      doc.setFontSize(9);
      const colW = (pageWidth - 28) / 2;
      const rowH = 7;
      const labelX1 = 14;
      const valueX1 = labelX1 + 30;
      const labelX2 = 14 + colW + 4;
      const valueX2 = labelX2 + 30;

      infoFields.forEach((field, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const y = cursorY + row * rowH;
        const lx = col === 0 ? labelX1 : labelX2;
        const vx = col === 0 ? valueX1 : valueX2;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(`${field[0]}:`, lx, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.text(String(field[1]), vx, y);
      });

      const gridRows = Math.ceil(infoFields.length / 2);
      cursorY += gridRows * rowH + 6;

      doc.setDrawColor(200, 200, 200);
      doc.line(14, cursorY, pageWidth - 14, cursorY);
      cursorY += 6;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Dispatch Panel Details", 14, cursorY);
    cursorY += 4;

    const tableHead = [["S No", "Panel Unique No", "Prefix", "Panel No", "Capacity", "Panel Type", "Dispatch Status", "Damage Status"]];

    const tableBody = panelList.map((item, index) => [
      index + 1,
      item.panel_unique_no ?? "-",
      item.prefix ?? "-",
      item.panel_no ?? "-",
      item.panel_capacity ?? "-",
      item.dispatch_panel_type === 1 ? "DCR" : item.dispatch_panel_type === 2 ? "NON DCR" : "-",
      item.dispatch_status === 1 ? "Dispatched" : "Pending",
      item.damage_status === 1 ? "Damaged" : "Safe",
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: tableHead,
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      },
    });

    doc.save(`Dispatch_${dispatchInfo?.dispatch_id || id}.pdf`);
  };

  /* ================= UI ================= */

  return (
    <>
      <PageHeader
        title="Dispatch Panel Details"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Dispatch", to: "/dispatch/list" },
          { label: "Panel Details" },
        ]}
        subtitle={dispatchInfo?.dispatch_id ? `Dispatch ID: ${dispatchInfo.dispatch_id}` : undefined}
        action={
          !loading && dispatchInfo ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDownloadPDF}
              className="d-flex align-items-center gap-1"
            >
              <i className="fa fa-file-pdf-o me-1" />
              Download PDF
            </Button>
          ) : null
        }
      />
      <Col lg={12}>

      {/* ── TOP: Dispatch Info Card ── */}
      {!loading && dispatchInfo && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Dispatch Information</span>
          </Card.Header>

          <Card.Body>
            <Row className="g-3">
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Dispatch ID</small>
                  <strong>{dispatchInfo.dispatch_id}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Truck No</small>
                  <strong>{dispatchInfo.truck_no}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Challan No</small>
                  <strong>{dispatchInfo.challan_no}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">State</small>
                  <strong>{dispatchInfo.state}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Driver Name</small>
                  <strong>{dispatchInfo.driver_name}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Driver No</small>
                  <strong>{dispatchInfo.driver_no}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Total Panels</small>
                  <strong>{dispatchInfo.dispatch_panel_count}</strong>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="border rounded p-3 h-100">
                  <small className="text-muted d-block mb-1">Collect Status</small>
                  {dispatchInfo.collect_status === 1 ? (
                    <Badge bg="success">Collected</Badge>
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* ── BOTTOM: Panels Table Card ── */}
      <Card className="klk-list-card">

        <Card.Header>
          <ListToolbar>
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by panel no, capacity..."
            />
            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName={`Dispatch_Panels_${dispatchInfo?.dispatch_id || id}`}
            />
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <p className="text-center text-muted py-4">Loading panels...</p>
          ) : error ? (
            <p className="text-danger text-center py-4">{error}</p>
          ) : (
            <>
              <Table responsive className="table-hover align-middle">
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Panel Unique No</th>
                    <th>Prefix</th>
                    <th>Panel No</th>
                    <th>Capacity</th>
                    <th>Panel Type</th>
                    <th>Dispatch Status</th>
                    <th>Damage Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td><strong>{startIndex + index + 1}</strong></td>
                        <td>{item.panel_unique_no}</td>
                        <td><PrefixCell value={item.prefix} /></td>
                        <td>{item.panel_no}</td>
                        <td>{item.panel_capacity}</td>
                        <td>
                          {item.dispatch_panel_type === 1
                            ? "DCR"
                            : item.dispatch_panel_type === 2
                              ? "NON DCR"
                              : "-"}
                        </td>
                        <td>
                          {item.dispatch_status === 1 ? (
                            <Badge bg="success">Dispatched</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>
                        <td>
                          {item.damage_status === 1 ? (
                            <Badge bg="danger">Damaged</Badge>
                          ) : (
                            <Badge bg="success">Safe</Badge>
                          )}
                        </td>

                        <td>
                          <i
                            className=" fa fa-remove btn fw-bold text-danger"
                            disabled={deletingId === item._id}
                            onClick={() => handleDeletePanel(item._id, item.panel_unique_no)}
                          >
                          </i>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No panels found"}
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

export default ViewDispatchPanels;