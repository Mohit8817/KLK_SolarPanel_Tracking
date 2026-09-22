import { useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import { ViewAction } from "../../Common/ActionButtons";
import BoxDetailsModal from "./BoxDetailsModal";

const MOCK_BOXES = [
  { id: 1, boxNo: "BOX-2026-00089", totalUnits: 20, lights: 10, batteries: 10, status: "READY_FOR_DISPATCH", date: "2026-09-07", project: "Rajasthan Smart Highway" },
  { id: 2, boxNo: "BOX-2026-00090", totalUnits: 20, lights: 20, batteries: 0, status: "READY_FOR_DISPATCH", date: "2026-09-07", project: "UP Rural Solar Grid" },
  { id: 3, boxNo: "BOX-2026-00091", totalUnits: 18, lights: 8, batteries: 10, status: "DISPATCHED", date: "2026-09-06", project: "MP Urban Streetlight" },
  { id: 4, boxNo: "BOX-2026-00092", totalUnits: 20, lights: 10, batteries: 10, status: "READY_FOR_DISPATCH", date: "2026-09-08", project: "Rajasthan Smart Highway" },
  { id: 5, boxNo: "BOX-2026-00093", totalUnits: 20, lights: 0, batteries: 20, status: "READY_FOR_DISPATCH", date: "2026-09-08", project: "Gujarat Industrial Park" },
];

const ViewBoxList = () => {
  const [boxes] = useState(() => {
    try {
      const saved = localStorage.getItem("klk_sealed_boxes");
      if (saved) {
        const list = JSON.parse(saved);
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_BOXES;
  });

  const [selectedBox, setSelectedBox] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenDetails = (box) => {
    setSelectedBox(box);
    setShowModal(true);
  };

  // ── SEARCH + PAGINATION ──
  const SEARCH_KEYS = ["boxNo", "status", "date", "project"];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(boxes, SEARCH_KEYS, 10);

  // ── EXPORT ──
  const exportData = boxes.map((item, index) => ({
    sno: index + 1,
    boxNo: item.boxNo,
    totalUnits: `${item.totalUnits} / 20 Units`,
    lights: `${item.lights || 0} pcs`,
    batteries: `${item.batteries || 0} pcs`,
    project: item.project || "-",
    status: item.status,
    date: item.date,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Box QR / Number", key: "boxNo" },
    { label: "Total Units", key: "totalUnits" },
    { label: "Lights Count", key: "lights" },
    { label: "Batteries Count", key: "batteries" },
    { label: "Project", key: "project" },
    { label: "Status", key: "status" },
    { label: "Pack Date", key: "date" },
  ];

  return (
    <div className="view-box-list">
      <PageHeader
        title="Sealed Boxes Directory"
        subtitle="Inventory of packed boxes (Max 20 units) ready for Truck Loading & Dispatch"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Packaging" },
          { label: "Sealed Boxes List" },
        ]}
        action={
          <Link to="/light/box/packaging" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> Open Packaging Console
          </Link>
        }
      />

      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
            {/* RIGHT SIDE - SEARCH + EXPORT ACTIONS */}
            <div className="d-flex align-items-center gap-3 ms-auto flex-nowrap">
              <div style={{ width: "260px", minWidth: "220px" }}>
                <Search
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search box no, status, date..."
                />
              </div>

              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{ minWidth: "145px", whiteSpace: "nowrap" }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName="Sealed_Boxes_Directory"
                />
              </div>
            </div>
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle" style={{ minWidth: "1050px" }}>
            <thead>
              <tr>
                <th style={{ width: "65px" }}>S no.</th>
                <th style={{ minWidth: "170px" }}>Box QR / Number</th>
                <th style={{ width: "130px" }}>Total Units</th>
                <th style={{ width: "120px" }}>Lights Count</th>
                <th style={{ width: "130px" }}>Batteries Count</th>
                <th style={{ minWidth: "170px" }}>Project</th>
                <th style={{ width: "150px" }}>Status</th>
                <th style={{ width: "120px" }}>Pack Date</th>
                <th className="text-center" style={{ width: "100px", minWidth: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No records found"}
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={item.id || item.boxNo || idx}>
                    <td><strong>{startIndex + idx + 1}</strong></td>
                    <td className="fw-bold font-monospace text-primary">{item.boxNo}</td>
                    <td>
                      <Badge bg="dark" className="py-2 px-2 fs-12">{item.totalUnits} / 20 Units</Badge>
                    </td>
                    <td>{item.lights} pcs</td>
                    <td>{item.batteries} pcs</td>
                    <td className="fw-medium">{item.project || "-"}</td>
                    <td>
                      <Badge
                        bg={item.status === "DISPATCHED" ? "secondary" : "success"}
                        className="py-2 px-2 fs-12"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-nowrap">{item.date}</td>
                    <td className="text-center">
                      <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">
                        <ViewAction
                          onClick={() => handleOpenDetails(item)}
                          title="View Box Items"
                        />
                        <button
                          type="button"
                          className="btn btn-xs sharp btn-secondary me-1"
                          onClick={() => window.print()}
                          title="Print Box Label"
                        >
                          <i className="fa fa-print" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </Card.Body>
      </Card>

      <BoxDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        box={selectedBox}
      />
    </div>
  );
};

export default ViewBoxList;
