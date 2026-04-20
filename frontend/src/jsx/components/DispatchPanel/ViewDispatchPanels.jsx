import { useEffect, useState } from "react";
import { Card, Col, Row, Table, Badge, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

const ViewDispatchPanels = () => {
  const { id } = useParams();

  /* ================= STATE ================= */

  const [panelList, setPanelList]       = useState([]);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  // PAGINATION
  const itemsPerPage                    = 30;
  const [currentPage, setCurrentPage]   = useState(1);

  const totalPages  = Math.ceil(panelList.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const currentData = panelList.slice(startIndex, startIndex + itemsPerPage);

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

  /* ================= EXPORT ================= */

  const exportData = panelList.map((item, index) => ({
    sno           : index + 1,
    panelUniqueNo : item.panel_unique_no,
    panelNo       : item.panel_no,
    capacity      : item.panel_capacity,
    panelType     : item.dispatch_panel_type === 1
                      ? "DCR"
                      : item.dispatch_panel_type === 2
                      ? "NON DCR"
                      : "-",
    dispatchStatus: item.dispatch_status === 1 ? "Dispatched" : "Pending",
    damageStatus  : item.damage_status === 1 ? "Damaged" : "Safe",
  }));

  const exportColumns = [
    { label: "S No",            key: "sno"           },
    { label: "Panel Unique No", key: "panelUniqueNo" },
    { label: "Panel No",        key: "panelNo"       },
    { label: "Capacity",        key: "capacity"      },
    { label: "Panel Type",      key: "panelType"     },
    { label: "Dispatch Status", key: "dispatchStatus"},
    { label: "Damage Status",   key: "damageStatus"  },
  ];

  /* ================= PDF DOWNLOAD ================= */

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth  = doc.internal.pageSize.getWidth();
    let cursorY      = 14;

    // ── TITLE ──
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Dispatch Details Report", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 8;

    // ── DIVIDER ──
    doc.setDrawColor(180, 180, 180);
    doc.line(14, cursorY, pageWidth - 14, cursorY);
    cursorY += 6;

    // ── DISPATCH INFORMATION SECTION ──
    if (dispatchInfo) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Dispatch Information", 14, cursorY);
      cursorY += 5;

      const infoFields = [
        ["Dispatch ID",    dispatchInfo.dispatch_id       ?? "-"],
        ["Truck No",       dispatchInfo.truck_no          ?? "-"],
        ["Challan No",     dispatchInfo.challan_no        ?? "-"],
        ["State",          dispatchInfo.state             ?? "-"],
        ["Driver Name",    dispatchInfo.driver_name       ?? "-"],
        ["Driver No",      dispatchInfo.driver_no         ?? "-"],
        ["Total Panels",   String(dispatchInfo.dispatch_panel_count ?? "-")],
        ["Collect Status", dispatchInfo.collect_status === 1 ? "Collected" : "Pending"],
      ];

      // Render info in 2-column grid
      doc.setFontSize(9);
      const colW     = (pageWidth - 28) / 2;   // 2 equal columns
      const rowH     = 7;
      const labelX1  = 14;
      const valueX1  = labelX1 + 30;
      const labelX2  = 14 + colW + 4;
      const valueX2  = labelX2 + 30;

      infoFields.forEach((field, i) => {
        const col  = i % 2;          // 0 = left, 1 = right
        const row  = Math.floor(i / 2);
        const y    = cursorY + row * rowH;
        const lx   = col === 0 ? labelX1 : labelX2;
        const vx   = col === 0 ? valueX1 : valueX2;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(`${field[0]}:`, lx, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.text(String(field[1]), vx, y);
      });

      // Move cursor below info grid
      const gridRows = Math.ceil(infoFields.length / 2);
      cursorY += gridRows * rowH + 6;

      // ── DIVIDER ──
      doc.setDrawColor(200, 200, 200);
      doc.line(14, cursorY, pageWidth - 14, cursorY);
      cursorY += 6;
    }

    // ── PANELS TABLE SECTION ──
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Dispatch Panel Details", 14, cursorY);
    cursorY += 4;

    const tableHead = [["S No", "Panel Unique No", "Panel No", "Capacity", "Panel Type", "Dispatch Status", "Damage Status"]];

    const tableBody = panelList.map((item, index) => [
      index + 1,
      item.panel_unique_no  ?? "-",
      item.panel_no         ?? "-",
      item.panel_capacity   ?? "-",
      item.dispatch_panel_type === 1
        ? "DCR"
        : item.dispatch_panel_type === 2
        ? "NON DCR"
        : "-",
      item.dispatch_status === 1 ? "Dispatched" : "Pending",
      item.damage_status   === 1 ? "Damaged"    : "Safe",
    ]);

    autoTable(doc, {
      startY       : cursorY,
      head         : tableHead,
      body         : tableBody,
      theme        : "striped",
      headStyles   : { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles   : { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles : {
        0: { cellWidth: 12, halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
      },
      margin       : { left: 14, right: 14 },
      didDrawPage  : (data) => {
        // Footer: page number
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
    <Col lg={12}>

      {/* ── TOP: Dispatch Info Card ── */}
      {!loading && dispatchInfo && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0">Dispatch Information</Card.Title>

            {/* ── PDF DOWNLOAD BUTTON ── */}
            <Button
              variant="danger"
              size="sm"
              onClick={handleDownloadPDF}
              className="d-flex align-items-center gap-1"
            >
              {/* PDF icon (inline SVG — no extra lib needed) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z" />
              </svg>
              Download PDF
            </Button>
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
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <Card.Title className="mb-0">Dispatch Panel Details</Card.Title>

          <TableExportActions
            data={exportData}
            columns={exportColumns}
            fileName={`Dispatch_Panels_${dispatchInfo?.dispatch_id || id}`}
          />
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
                    <th>Panel No</th>
                    <th>Capacity</th>
                    <th>Panel Type</th>
                    <th>Dispatch Status</th>
                    <th>Damage Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>

                        <td><strong>{startIndex + index + 1}</strong></td>

                        <td>{item.panel_unique_no}</td>

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

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No panels found
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

export default ViewDispatchPanels;