import { useState, useMemo } from "react";
import { Card, Table, Badge, Button, Row, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import TableExportActions from "../../Common/TableExportActions";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtered List
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchType = typeFilter === "ALL" || item.type === typeFilter;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.serialNo.toLowerCase().includes(search) ||
        item.model.toLowerCase().includes(search) ||
        item.poNo.toLowerCase().includes(search) ||
        item.inspector.toLowerCase().includes(search) ||
        (item.defectReason && item.defectReason.toLowerCase().includes(search));

      return matchStatus && matchType && matchSearch;
    });
  }, [list, statusFilter, typeFilter, searchTerm]);

  // Overall Statistics
  const totalInspected = list.length;
  const totalPassed = list.filter((i) => i.status === "PASSED").length;
  const totalFailed = list.filter((i) => i.status === "FAILED").length;
  const totalRework = list.filter((i) => i.status === "REWORK").length;

  const exportColumns = [
    { label: "Serial No", key: "serialNo" },
    { label: "Category", key: "type" },
    { label: "Model", key: "model" },
    { label: "PO Number", key: "poNo" },
    { label: "QC Status", key: "status" },
    { label: "Defect Reason", key: "defectReason" },
    { label: "Inspector", key: "inspector" },
    { label: "Date", key: "date" },
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
          <Card className="border-0 shadow-sm">
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
          <Card className="border-0 shadow-sm">
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
          <Card className="border-0 shadow-sm">
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

      {/* Filter & Search Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            {/* Search Input */}
            <Col md={4}>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search Serial, PO, Model, Inspector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>

            {/* Status Filter */}
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({totalInspected})</option>
                <option value="PASSED">Passed Only ({totalPassed})</option>
                <option value="FAILED">Failed / Rejected ({totalFailed})</option>
                <option value="REWORK">In Rework ({totalRework})</option>
              </Form.Select>
            </Col>

            {/* Category Filter */}
            <Col md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All Categories (Lights &amp; Batteries)</option>
                <option value="LIGHT">Solar Street Lights Only</option>
                <option value="BATTERY">Battery Packs Only</option>
              </Form.Select>
            </Col>

            {/* Export Actions */}
            <Col md={2} className="text-end">
              <TableExportActions
                data={filteredList}
                columns={exportColumns}
                fileName="Solar_Light_Battery_QC_Report"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* QC Tested Records Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">
            Inspection History ({filteredList.length} Records Found)
          </h5>
          <span className="text-muted fs-13">
            Showing verified results from production testing stations
          </span>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Serial Number</th>
                  <th>Product Category</th>
                  <th>Model / Specs</th>
                  <th>PO / Work Order</th>
                  <th>QC Status</th>
                  <th>Defect / Finding</th>
                  <th>Inspector</th>
                  <th>Date &amp; Time</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-muted">
                      Koi record nahi mila. Filters check karein ya naya inspection karein.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{idx + 1}</td>
                      <td className="font-monospace fw-bold text-primary">{item.serialNo}</td>
                      <td>
                        <Badge bg={item.type === "LIGHT" ? "primary" : "info"}>
                          {item.type === "LIGHT" ? "Solar Light" : "Battery Pack"}
                        </Badge>
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
                          className="fs-12 p-2"
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
                      <td>
                        {item.date} <small className="text-muted">{item.time}</small>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleOpenModal(item)}
                          title="View QC Test Sheet"
                        >
                          <i className="fa-solid fa-eye me-1"></i> Details
                        </Button>
                        {item.status === "PASSED" && (
                          <Link
                            to="/light/box/packaging"
                            className="btn btn-outline-success btn-sm"
                            title="Ready for packaging - Pack into Box"
                          >
                            <i className="fa-solid fa-box me-1"></i> Pack
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
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
