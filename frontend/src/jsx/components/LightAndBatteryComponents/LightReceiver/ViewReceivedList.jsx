import { useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import { ViewAction } from "../../Common/ActionButtons";

const MOCK_RECEIVED = [
  { id: 1, boxNo: "BOX-2026-00089", units: 20, lights: 10, batteries: 10, warehouse: "Jaipur Depot", condition: "SAFE", date: "2026-09-07" },
  { id: 2, boxNo: "BOX-2026-00085", units: 20, lights: 20, batteries: 0, warehouse: "Jaipur Depot", condition: "DAMAGED (2 Units)", date: "2026-09-06" },
  { id: 3, boxNo: "BOX-2026-00082", units: 20, lights: 10, batteries: 10, warehouse: "Lucknow Regional Hub", condition: "SAFE", date: "2026-09-05" },
  { id: 4, boxNo: "BOX-2026-00078", units: 18, lights: 8, batteries: 10, warehouse: "Indore Central Depot", condition: "SAFE", date: "2026-09-04" },
  { id: 5, boxNo: "BOX-2026-00074", units: 20, lights: 0, batteries: 20, warehouse: "Ahmedabad Warehouse", condition: "SAFE", date: "2026-09-03" },
];

const ViewReceivedList = () => {
  const [list] = useState(MOCK_RECEIVED);

  // ── SEARCH + PAGINATION ──
  const SEARCH_KEYS = ["boxNo", "warehouse", "condition", "date"];

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
    boxNo: item.boxNo,
    warehouse: item.warehouse,
    units: `${item.units} Units`,
    mix: `${item.lights}L + ${item.batteries}B`,
    condition: item.condition,
    date: item.date,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Box QR Number", key: "boxNo" },
    { label: "Warehouse / Hub", key: "warehouse" },
    { label: "Total Units", key: "units" },
    { label: "Product Mix", key: "mix" },
    { label: "Receipt Condition", key: "condition" },
    { label: "Received Date", key: "date" },
  ];

  return (
    <div className="view-received-list">
      <PageHeader
        title="Received Warehouse Inventory"
        subtitle="Track stock of received boxes and unboxed products in central warehouse"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Receiving" },
          { label: "Received Box List" },
        ]}
        action={
          <Link to="/light/receive/boxes" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> Scan Inward Boxes
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
                  placeholder="Search box no, warehouse, condition..."
                />
              </div>

              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{ minWidth: "145px", whiteSpace: "nowrap" }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName="Received_Warehouse_Inventory"
                />
              </div>
            </div>
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle" style={{ minWidth: "1000px" }}>
            <thead>
              <tr>
                <th style={{ width: "65px" }}>S no.</th>
                <th style={{ minWidth: "160px" }}>Box QR Number</th>
                <th style={{ minWidth: "170px" }}>Warehouse / Hub</th>
                <th style={{ width: "120px" }}>Total Units</th>
                <th style={{ width: "140px" }}>Product Mix</th>
                <th style={{ width: "160px" }}>Receipt Condition</th>
                <th style={{ width: "120px" }}>Received Date</th>
                <th className="text-center" style={{ width: "100px", minWidth: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No records found"}
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={item.id}>
                    <td><strong>{startIndex + idx + 1}</strong></td>
                    <td className="fw-bold font-monospace text-primary">{item.boxNo}</td>
                    <td className="fw-medium">{item.warehouse}</td>
                    <td>
                      <Badge bg="dark" className="py-2 px-2 fs-12">{item.units} Units</Badge>
                    </td>
                    <td>{item.lights}L + {item.batteries}B</td>
                    <td>
                      <Badge
                        bg={item.condition.includes("SAFE") ? "success" : "danger"}
                        className="py-2 px-2 fs-12"
                      >
                        {item.condition}
                      </Badge>
                    </td>
                    <td className="text-nowrap">{item.date}</td>
                    <td className="text-center">
                      <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">
                        <ViewAction
                          onClick={() => alert(`Box ${item.boxNo}: ${item.lights} Lights, ${item.batteries} Batteries`)}
                          title="View Items"
                        />
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
    </div>
  );
};

export default ViewReceivedList;
