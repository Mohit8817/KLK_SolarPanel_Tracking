import { useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import { ViewAction } from "../../Common/ActionButtons";
import ViewDispatchBoxes from "./ViewDispatchBoxes";

const MOCK_DISPATCHES = [
  { id: 1, challanNo: "DSP-2409-001", truckNo: "RJ 14 GA 5432", state: "Rajasthan", vendor: "Jaipur Central Depot", boxesCount: 50, totalUnits: 1000, status: "IN_TRANSIT", date: "2026-09-07" },
  { id: 2, challanNo: "DSP-2409-002", truckNo: "UP 32 BK 9811", state: "Uttar Pradesh", vendor: "Lucknow Regional Hub", boxesCount: 40, totalUnits: 800, status: "DELIVERED", date: "2026-09-05" },
  { id: 3, challanNo: "DSP-2409-003", truckNo: "MP 09 CD 7765", state: "Madhya Pradesh", vendor: "Indore Central Depot", boxesCount: 30, totalUnits: 600, status: "IN_TRANSIT", date: "2026-09-08" },
  { id: 4, challanNo: "DSP-2409-004", truckNo: "GJ 01 LM 4321", state: "Gujarat", vendor: "Ahmedabad Warehouse", boxesCount: 25, totalUnits: 500, status: "DISPATCHED", date: "2026-09-09" },
];

const ViewDispatchList = () => {
  const [list] = useState(MOCK_DISPATCHES);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenBoxes = (dsp) => {
    setSelectedDispatch(dsp);
    setShowModal(true);
  };

  // ── SEARCH + PAGINATION ──
  const SEARCH_KEYS = ["challanNo", "truckNo", "state", "vendor", "status", "date"];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(list, SEARCH_KEYS, 10);

  // ── EXPORT ──
  const exportData = list.map((item, index) => ({
    sno: index + 1,
    challanNo: item.challanNo,
    truckNo: item.truckNo,
    state: item.state,
    vendor: item.vendor,
    boxesCount: `${item.boxesCount} Boxes`,
    totalUnits: `${item.totalUnits} Units`,
    status: item.status,
    date: item.date,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Challan No", key: "challanNo" },
    { label: "Truck Number", key: "truckNo" },
    { label: "Destination State", key: "state" },
    { label: "Vendor / Warehouse", key: "vendor" },
    { label: "Total Boxes", key: "boxesCount" },
    { label: "Total Units", key: "totalUnits" },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" },
  ];

  return (
    <div className="view-dispatch-list">
      <PageHeader
        title="Dispatch Shipments Directory"
        subtitle="Track trucks and shipments containing sealed boxes"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Dispatch" },
          { label: "Dispatch List" },
        ]}
        action={
          <Link to="/light/dispatch/create" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> New Dispatch
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
                  placeholder="Search challan, truck, vendor, state..."
                />
              </div>

              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{ minWidth: "145px", whiteSpace: "nowrap" }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName="Dispatch_Shipments_Directory"
                />
              </div>
            </div>
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle" style={{ minWidth: "1100px" }}>
            <thead>
              <tr>
                <th style={{ width: "65px" }}>S no.</th>
                <th style={{ minWidth: "150px" }}>Challan No</th>
                <th style={{ minWidth: "140px" }}>Truck Number</th>
                <th style={{ width: "130px" }}>Destination</th>
                <th style={{ minWidth: "180px" }}>Vendor / Warehouse</th>
                <th style={{ width: "120px" }}>Total Boxes</th>
                <th style={{ width: "120px" }}>Total Units</th>
                <th style={{ width: "130px" }}>Status</th>
                <th style={{ width: "120px" }}>Date</th>
                <th className="text-center" style={{ width: "100px", minWidth: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No records found"}
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={item.id}>
                    <td><strong>{startIndex + idx + 1}</strong></td>
                    <td className="fw-bold font-monospace text-primary">{item.challanNo}</td>
                    <td>{item.truckNo}</td>
                    <td>{item.state}</td>
                    <td>{item.vendor}</td>
                    <td>
                      <Badge bg="dark" className="py-2 px-2 fs-12">{item.boxesCount} Boxes</Badge>
                    </td>
                    <td>
                      <strong>{item.totalUnits} Units</strong>
                    </td>
                    <td>
                      <Badge
                        bg={item.status === "DELIVERED" ? "success" : item.status === "DISPATCHED" ? "info" : "warning"}
                        className="py-2 px-2 fs-12"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-nowrap">{item.date}</td>
                    <td className="text-center">
                      <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">
                        <ViewAction
                          onClick={() => handleOpenBoxes(item)}
                          title="View Shipment Boxes"
                        />
                        <button
                          type="button"
                          className="btn btn-xs sharp btn-secondary me-1"
                          onClick={() => window.print()}
                          title="Print Challan"
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

      <ViewDispatchBoxes
        show={showModal}
        onHide={() => setShowModal(false)}
        dispatch={selectedDispatch}
      />
    </div>
  );
};

export default ViewDispatchList;
