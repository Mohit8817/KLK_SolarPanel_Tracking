import { useState, useMemo } from "react";
import { Card, Table, Badge,  Row, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import { ViewAction } from "../../Common/ActionButtons";
import QCDetailsModal from "./QCDetailsModal";

const INITIAL_QC_DATA = [
  {
    id: 1,
    serialNo: "SL24090001",
    type: "LIGHT",
    model: "20W Semi-Integrated Street Light",
    poNo: "PO-2026-089",
    status: "PASSED",
    defectReason: "",
    remarks: "All 5 checkpoints cleared. Standard lumens achieved.",
    date: "2026-09-07",
    time: "02:15 PM",
    inspector: "Ajay Verma",
    station: "Station 1",
    testValues: {
      physical: "Clean surface, zero blemish",
      physicalResult: "PASS",
      lux: "148 lm/W (2960 lm)",
      luxResult: "PASS",
      wiring: "Output 12.0V stable",
      wiringResult: "PASS",
      sensor: "Sensor response < 2s",
      sensorResult: "PASS",
      ipSeal: "Pressure seal intact",
      ipSealResult: "PASS",
    },
  },
  {
    id: 2,
    serialNo: "BAT24090001",
    type: "BATTERY",
    model: "12.8V 30Ah Battery Pack",
    poNo: "PO-2026-089",
    status: "PASSED",
    defectReason: "",
    remarks: "Pack balanced, BMS overcharge cut-off verified at 14.6V.",
    date: "2026-09-07",
    time: "02:18 PM",
    inspector: "Ajay Verma",
    station: "Station 1",
    testValues: {
      voltage: "12.84 V",
      voltageResult: "PASS",
      cellDelta: "Delta: 8 mV",
      deltaResult: "PASS",
      bms: "Trigger & Recovery OK",
      bmsResult: "PASS",
      welding: "Clean welds, firm hold",
      weldingResult: "PASS",
      ir: "11.4 mΩ",
      irResult: "PASS",
    },
  },
  {
    id: 3,
    serialNo: "SL24090002",
    type: "LIGHT",
    model: "20W Semi-Integrated Street Light",
    poNo: "PO-2026-089",
    status: "FAILED",
    defectReason: "LED Flicker & Uneven Lumens",
    remarks: "Fluctuation observed during burn test. Driver needs check.",
    date: "2026-09-07",
    time: "02:22 PM",
    inspector: "Ajay Verma",
    station: "Station 1",
    testValues: {
      physical: "Clean surface",
      physicalResult: "PASS",
      lux: "Flicker < 90 lm/W",
      luxResult: "FAIL",
      wiring: "Voltage spike to 14.5V",
      wiringResult: "FAIL",
      sensor: "Sensor response OK",
      sensorResult: "PASS",
      ipSeal: "Seal OK",
      ipSealResult: "PASS",
    },
  },
  {
    id: 4,
    serialNo: "BAT24090002",
    type: "BATTERY",
    model: "12.8V 30Ah Battery Pack",
    poNo: "PO-2026-089",
    status: "REWORK",
    defectReason: "Cell Balance High Delta (>20mV)",
    remarks: "Cell #2 delta 34mV. Sent to balancer bench.",
    date: "2026-09-07",
    time: "02:28 PM",
    inspector: "Ramesh Sharma",
    station: "Station 2",
    testValues: {
      voltage: "12.71 V",
      voltageResult: "PASS",
      cellDelta: "Delta: 34 mV",
      deltaResult: "FAIL",
      bms: "BMS active",
      bmsResult: "PASS",
      welding: "Spot welds OK",
      weldingResult: "PASS",
      ir: "13.8 mΩ",
      irResult: "PASS",
    },
  },
  {
    id: 5,
    serialNo: "SL24090003",
    type: "LIGHT",
    model: "40W Inbuilt Solar Street Light",
    poNo: "PO-2026-088",
    status: "PASSED",
    defectReason: "",
    remarks: "All parameters passed testing.",
    date: "2026-09-06",
    time: "11:45 AM",
    inspector: "Ajay Verma",
    station: "Station 1",
    testValues: {
      physical: "Clean surface",
      physicalResult: "PASS",
      lux: "152 lm/W",
      luxResult: "PASS",
      wiring: "Stable",
      wiringResult: "PASS",
      sensor: "OK",
      sensorResult: "PASS",
      ipSeal: "OK",
      ipSealResult: "PASS",
    },
  },
  {
    id: 6,
    serialNo: "BAT24090003",
    type: "BATTERY",
    model: "12.8V 42Ah Battery Pack",
    poNo: "PO-2026-088",
    status: "PASSED",
    defectReason: "",
    remarks: "Full capacity & IR test approved.",
    date: "2026-09-06",
    time: "12:10 PM",
    inspector: "Ramesh Sharma",
    station: "Station 2",
    testValues: {
      voltage: "12.88 V",
      voltageResult: "PASS",
      cellDelta: "Delta: 6 mV",
      deltaResult: "PASS",
      bms: "Passed",
      bmsResult: "PASS",
      welding: "Passed",
      weldingResult: "PASS",
      ir: "9.8 mΩ",
      irResult: "PASS",
    },
  },
];

const ViewQCList = () => {
  const [list] = useState(() => {
    try {
      const saved = localStorage.getItem("klk_qc_records");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QC_DATA;
  });

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Overall Statistics
  const totalInspected = list.length;
  const totalPassed = list.filter((i) => i.status === "PASSED").length;
  const totalFailed = list.filter((i) => i.status === "FAILED").length;
  const totalRework = list.filter((i) => i.status === "REWORK").length;

  // Filter by Status and Category
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchType = typeFilter === "ALL" || item.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [list, statusFilter, typeFilter]);

  // ── SEARCH + PAGINATION (Standard useSearch hook) ──
  const SEARCH_KEYS = [
    "serialNo",
    "type",
    "model",
    "poNo",
    "inspector",
    "defectReason",
    "status",
    "date",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(filteredList, SEARCH_KEYS, 10);

  // ── EXPORT ──
  const exportData = filteredList.map((item, index) => ({
    sno: index + 1,
    serialNo: item.serialNo,
    type: item.type === "LIGHT" ? "Solar Light" : "Battery Pack",
    model: item.model,
    poNo: item.poNo,
    status: item.status,
    defectReason: item.defectReason || "None",
    inspector: item.inspector,
    date: item.date,
    time: item.time || "",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Serial No", key: "serialNo" },
    { label: "Category", key: "type" },
    { label: "Model", key: "model" },
    { label: "PO Number", key: "poNo" },
    { label: "QC Status", key: "status" },
    { label: "Defect Reason", key: "defectReason" },
    { label: "Inspector", key: "inspector" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
  ];

  const handleOpenModal = (item) => {
    setSelectedUnit(item);
    setShowModal(true);
  };

  return (
    <div className="view-qc-list">
      <PageHeader
        title="QC Inspection Records & Audit Directory"
        subtitle="Complete history of quality checked solar lights & batteries ready for Box Packaging"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Quality Check" },
          { label: "QC Tested List" },
        ]}
        action={
          <div className="d-flex gap-2">
            <Link to="/light/qc/inspection" className="btn btn-primary btn-sm">
              <i className="fa-solid fa-plus me-1"></i> New QC Inspection
            </Link>
            <Link to="/light/box/packaging" className="btn btn-success btn-sm">
              <i className="fa-solid fa-box-open me-1"></i> Packaging Console
            </Link>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <Row className="mb-4">
        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">Total Inspected</span>
                <h3 className="mb-0 mt-1 text-primary">{totalInspected}</h3>
              </div>
              <div className="rounded-circle p-3 bg-primary-subtle text-primary">
                <i className="fa-solid fa-clipboard-check fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm border-start border-success border-4">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">Passed &amp; Approved</span>
                <h3 className="mb-0 mt-1 text-success">{totalPassed}</h3>
              </div>
              <div className="rounded-circle p-3 bg-success-subtle text-success">
                <i className="fa-solid fa-circle-check fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm border-start border-danger border-4">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">Failed / Rejected</span>
                <h3 className="mb-0 mt-1 text-danger">{totalFailed}</h3>
              </div>
              <div className="rounded-circle p-3 bg-danger-subtle text-danger">
                <i className="fa-solid fa-circle-xmark fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3 mb-xl-0">
          <Card className="border-0 shadow-sm border-start border-warning border-4">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fs-12 fw-semibold">Under Rework</span>
                <h3 className="mb-0 mt-1 text-warning">{totalRework}</h3>
              </div>
              <div className="rounded-circle p-3 bg-warning-subtle text-warning">
                <i className="fa-solid fa-screwdriver-wrench fa-xl"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QC Tested Records Table in standard klk-list-card */}
      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
            {/* Filters */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Form.Select
                size="sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select-sm"
                style={{ width: "160px", height: "36px" }}
              >
                <option value="ALL">All Statuses ({totalInspected})</option>
                <option value="PASSED">Passed Only ({totalPassed})</option>
                <option value="FAILED">Failed / Rejected ({totalFailed})</option>
                <option value="REWORK">In Rework ({totalRework})</option>
              </Form.Select>

              <Form.Select
                size="sm"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select-sm"
                style={{ width: "170px", height: "36px" }}
              >
                <option value="ALL">All Categories</option>
                <option value="LIGHT">Solar Lights Only</option>
                <option value="BATTERY">Battery Packs Only</option>
              </Form.Select>
            </div>

            {/* RIGHT SIDE - SEARCH + EXPORT ACTIONS */}
            <div className="d-flex align-items-center gap-3 ms-auto flex-nowrap">
              <div style={{ width: "260px", minWidth: "220px" }}>
                <Search
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search serial, model, PO..."
                />
              </div>

              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{ minWidth: "145px", whiteSpace: "nowrap" }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName="Solar_Light_Battery_QC_Report"
                />
              </div>
            </div>
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle" style={{ minWidth: "1150px" }}>
            <thead>
              <tr>
                <th style={{ width: "65px" }}>S no.</th>
                <th style={{ minWidth: "160px" }}>Serial Number</th>
                <th style={{ width: "140px" }}>Category</th>
                <th style={{ minWidth: "180px" }}>Model / Specs</th>
                <th style={{ width: "130px" }}>PO / Work Order</th>
                <th style={{ width: "120px" }}>QC Status</th>
                <th style={{ minWidth: "160px" }}>Defect / Finding</th>
                <th style={{ width: "130px" }}>Inspector</th>
                <th style={{ width: "140px" }}>Date &amp; Time</th>
                <th className="text-center" style={{ width: "110px", minWidth: "110px" }}>Action</th>
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
                    <td className="font-monospace fw-bold text-primary">{item.serialNo}</td>
                    <td>
                      {item.type === "LIGHT" ? (
                        <Badge bg="primary" className="py-2 px-2 d-inline-flex align-items-center gap-1">
                          <i className="fa-solid fa-lightbulb"></i> Street Light
                        </Badge>
                      ) : (
                        <Badge bg="info" className="py-2 px-2 d-inline-flex align-items-center gap-1">
                          <i className="fa-solid fa-car-battery"></i> Battery Pack
                        </Badge>
                      )}
                    </td>
                    <td>{item.model}</td>
                    <td>{item.poNo}</td>
                    <td>
                      <Badge
                        bg={
                          item.status === "PASSED"
                            ? "success"
                            : item.status === "FAILED"
                            ? "danger"
                            : "warning"
                        }
                        className="fs-12 py-2 px-2"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>
                      {item.defectReason ? (
                        <span className="text-danger fw-semibold">{item.defectReason}</span>
                      ) : (
                        <span className="text-success fs-12">
                          <i className="fa-solid fa-check me-1"></i> Passed
                        </span>
                      )}
                    </td>
                    <td>{item.inspector}</td>
                    <td className="text-nowrap">
                      {item.date} <small className="text-muted">{item.time}</small>
                    </td>
                    <td className="text-center">
                      <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">
                        <ViewAction
                          onClick={() => handleOpenModal(item)}
                          title="View QC Test Sheet"
                        />
                        {item.status === "PASSED" && (
                          <Link
                            to="/light/box/packaging"
                            className="btn btn-xs sharp btn-success me-1"
                            title="Ready for packaging - Pack into Box"
                          >
                            <i className="fa fa-box" />
                          </Link>
                        )}
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

      {/* QC Detail Inspection Modal */}
      <QCDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        qcData={selectedUnit}
      />
    </div>
  );
};

export default ViewQCList;
