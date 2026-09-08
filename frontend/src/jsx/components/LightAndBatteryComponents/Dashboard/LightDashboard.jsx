import React, { useState } from "react";
import { Row, Col, Card, Table, Badge, ProgressBar, Button, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import PageHeader from "../../Common/PageHeader";

const LightDashboard = () => {
  // Timeframe filter state for Production Chart
  const [timeRange, setTimeRange] = useState("week");
  const [tableFilter, setTableFilter] = useState("all");

  // Summary Metrics State
  const [stats] = useState({
    totalLightsGenerated: 12400,
    totalBatteriesGenerated: 11800,
    inProduction: 3500,
    qcPassedUnits: 3420,
    sealedBoxes: 820,
    readyToDispatchBoxes: 140,
    dispatchedBoxes: 680,
    receivedBoxes: 650,
    damagedUnits: 34,
  });

  // Chart 1: Production & Assembly Output Trends
  const chartDataMap = {
    day: {
      categories: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
      lights: [140, 220, 310, 290, 360, 280],
      batteries: [130, 210, 280, 270, 340, 260],
      qcPassed: [135, 205, 295, 280, 345, 270],
    },
    week: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      lights: [920, 1150, 1340, 1200, 1420, 1680, 890],
      batteries: [880, 1080, 1290, 1150, 1380, 1610, 840],
      qcPassed: [890, 1110, 1300, 1160, 1390, 1630, 860],
    },
    month: {
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
      lights: [3200, 3650, 4100, 3850],
      batteries: [3050, 3500, 3950, 3700],
      qcPassed: [3100, 3580, 4010, 3780],
    },
  };

  const currentChart = chartDataMap[timeRange];

  const productionChartOptions = {
    chart: {
      type: "area",
      height: 310,
      toolbar: { show: false },
      fontFamily: "Poppins, sans-serif",
    },
    colors: ["#0d6efd", "#0dcaf0", "#198754"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: currentChart.categories,
      labels: {
        style: { colors: "#6c757d", fontSize: "12px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#6c757d", fontSize: "12px" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      markers: { radius: 12 },
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
    },
  };

  const productionChartSeries = [
    { name: "Lights Produced", data: currentChart.lights },
    { name: "Batteries Assembled", data: currentChart.batteries },
    { name: "QC Passed", data: currentChart.qcPassed },
  ];

  // Chart 2: QC Status & Defects Donut Chart
  const qcDonutOptions = {
    chart: {
      type: "donut",
      height: 270,
      fontFamily: "Poppins, sans-serif",
    },
    labels: ["QC Passed (Ready)", "Under Re-test / Aging", "Flagged / Defect"],
    colors: ["#5bcfc6", "#ffc107", "#dc3545"],
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Yield Rate",
              formatter: () => "98.2%",
              style: { fontSize: "16px", fontWeight: 700, color: "#198754" },
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "12px",
      markers: { radius: 12 },
    },
    stroke: { width: 0 },
  };

  const qcDonutSeries = [stats.qcPassedUnits, 80, stats.damagedUnits];

  // Recent Packaging & Dispatch Log Data
  const recentBoxes = [
    {
      boxId: "BX-SOL-9081",
      itemType: "Solar All-in-One Light 40W",
      serialRange: "SL-40W-10480 ~ 10499",
      unitsPacked: 20,
      maxCapacity: 20,
      inspector: "Amit K. (QC-1)",
      destination: "Indore Phase-2 Site",
      status: "Ready for Dispatch",
      statusBadge: "warning",
      date: "Today, 14:20",
    },
    {
      boxId: "BX-BAT-4412",
      itemType: "LiFePO4 Battery 12.8V 30Ah",
      serialRange: "BAT-30AH-8820 ~ 8839",
      unitsPacked: 20,
      maxCapacity: 20,
      inspector: "Rahul S. (QC-2)",
      destination: "Jaipur Solar Farm",
      status: "Dispatched",
      statusBadge: "primary",
      date: "Today, 11:45",
    },
    {
      boxId: "BX-SOL-9080",
      itemType: "Solar All-in-One Light 60W",
      serialRange: "SL-60W-07401 ~ 07420",
      unitsPacked: 20,
      maxCapacity: 20,
      inspector: "Suresh P. (QC-1)",
      destination: "Bhopal Central Hub",
      status: "Received",
      statusBadge: "success",
      date: "Yesterday",
    },
    {
      boxId: "BX-BAT-4411",
      itemType: "LiFePO4 Battery 12.8V 42Ah",
      serialRange: "BAT-42AH-3101 ~ 3118",
      unitsPacked: 18,
      maxCapacity: 20,
      inspector: "Rahul S. (QC-2)",
      destination: "Nagpur Depot",
      status: "Packing In-Progress",
      statusBadge: "info",
      date: "Just Now",
    },
    {
      boxId: "BX-SOL-9079",
      itemType: "Solar Light Luminary 25W",
      serialRange: "SL-25W-12100 ~ 12119",
      unitsPacked: 20,
      maxCapacity: 20,
      inspector: "Amit K. (QC-1)",
      destination: "Jodhpur Highway Project",
      status: "Dispatched",
      statusBadge: "primary",
      date: "Yesterday",
    },
  ];

  // Filtered Box Records
  const filteredBoxes = recentBoxes.filter((item) => {
    if (tableFilter === "all") return true;
    if (tableFilter === "dispatch") return item.status === "Dispatched";
    if (tableFilter === "ready") return item.status === "Ready for Dispatch";
    if (tableFilter === "packing") return item.status === "Packing In-Progress";
    return true;
  });

  return (
    <div className="light-battery-dashboard pb-4">
      {/* Page Header */}
      <PageHeader
        title="Solar Light & Battery Dashboard"
        subtitle="End-to-end tracking: Serial Generation → Assembly → QC Testing → Packaging (Max 20/box) → Dispatch → Receiving"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Solar Light & Battery" },
        ]}
      />

      {/* QC Alert Banner */}
      {/* {stats.damagedUnits > 0 && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 bg-danger-subtle text-danger">
          <div className="d-flex align-items-center">
            <span className="badge bg-danger rounded-circle p-2 me-3">
              <i className="fa-solid fa-triangle-exclamation text-white fs-14"></i>
            </span>
            <div>
              <strong>Quality Alert:</strong> {stats.damagedUnits} Units flagged during QC Line testing (BMS Cutoff & Lumens Tolerance).
              <span className="ms-2 d-none d-md-inline text-muted fs-12">Immediate technician inspection required.</span>
            </div>
          </div>
          <Link to="/light/qc/inspection" className="btn btn-sm btn-danger px-3 py-1 fw-semibold text-white">
            Inspect Defect Log
          </Link>
        </div>
      )} */}

      {/* Quick Actions Toolbar (Compact Small Buttons) */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="py-2 px-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary-subtle text-primary p-2 rounded-2">
                <i className="fa-solid fa-bolt fs-13"></i>
              </span>
              <span className="fw-bold fs-13 text-dark text-uppercase tracking-wider">Quick Actions:</span>
            </div>

            {/* Compact Small Action Buttons (btn-sm) */}
            <div className="d-flex flex-wrap gap-1">
              <Link to="/light/serial/generate" className="btn btn-sm btn-outline-primary py-1 px-2 fs-12 rounded-2">
                <i className="fa-solid fa-barcode me-1 text-primary"></i> Serials
              </Link>
              <Link to="/light/bom/request" className="btn btn-sm btn-outline-info py-1 px-2 fs-12 rounded-2">
                <i className="fa-solid fa-boxes-stacked me-1 text-info"></i> Material Req
              </Link>
              <Link to="/light/production/add" className="btn btn-sm btn-outline-secondary py-1 px-2 fs-12 rounded-2">
                <i className="fa-solid fa-screwdriver-wrench me-1 text-secondary"></i> Production
              </Link>
              <Link to="/light/qc/inspection" className="btn btn-sm btn-outline-success py-1 px-2 fs-12 rounded-2">
                <i className="fa-solid fa-clipboard-check me-1 text-success"></i> QC Check
              </Link>
              <Link to="/light/box/packaging" className="btn btn-sm btn-success py-1 px-2 fs-12 rounded-2 text-white">
                <i className="fa-solid fa-box-open me-1"></i> Packaging (Max 20)
              </Link>
              <Link to="/light/dispatch/create" className="btn btn-sm btn-outline-warning py-1 px-2 fs-12 rounded-2">
                <i className="fa-solid fa-truck-fast me-1 text-warning"></i> Dispatch
              </Link>
              <Link to="/light/receive/boxes" className="btn btn-sm btn-outline-dark py-1 px-2 fs-12 rounded-2">
                <i className="fa-solid fa-warehouse me-1"></i> Receive
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>


      {/* KPI Cards Row 1: Generation & Assembly */}
      <Row className="mb-1">
        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">Lights Generated</span>
                  <h3 className="mb-0 mt-1 text-primary fw-bold">{stats.totalLightsGenerated.toLocaleString()}</h3>
                  <div className="mt-2 fs-12 text-success">
                    <i className="fa-solid fa-arrow-trend-up me-1"></i> +8.4% this week
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-primary-subtle text-primary" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-lightbulb fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">Batteries Generated</span>
                  <h3 className="mb-0 mt-1 text-info fw-bold">{stats.totalBatteriesGenerated.toLocaleString()}</h3>
                  <div className="mt-2 fs-12 text-info">
                    <i className="fa-solid fa-bolt me-1"></i> LiFePO4 12.8V / 24V
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-info-subtle text-info" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-car-battery fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">In Assembly Line</span>
                  <h3 className="mb-0 mt-1 text-secondary fw-bold">{stats.inProduction.toLocaleString()}</h3>
                  <div className="mt-2 fs-12 text-muted">
                    <i className="fa-solid fa-gears me-1"></i> 3 Lines active
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-secondary-subtle text-secondary" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-screwdriver-wrench fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">QC Passed (Ready)</span>
                  <h3 className="mb-0 mt-1 text-success fw-bold">{stats.qcPassedUnits.toLocaleString()}</h3>
                  <div className="mt-2 fs-12 text-success">
                    <i className="fa-solid fa-circle-check me-1"></i> 98.2% Pass Rate
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-success-subtle text-success" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-clipboard-check fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KPI Cards Row 2: Packaging & Dispatch */}
      <Row className="mb-4">
        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">Packed in Boxes (Max 20)</span>
                  <h3 className="mb-0 mt-1 text-success fw-bold">
                    {stats.sealedBoxes.toLocaleString()} <small className="text-muted fs-14 fw-normal">Boxes</small>
                  </h3>
                  <div className="mt-2 fs-12 text-muted">
                    <i className="fa-solid fa-cubes me-1"></i> {(stats.sealedBoxes * 20).toLocaleString()} Units Packed
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-success-subtle text-success" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-box-open fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">Ready for Dispatch</span>
                  <h3 className="mb-0 mt-1 text-warning fw-bold">
                    {stats.readyToDispatchBoxes.toLocaleString()} <small className="text-muted fs-14 fw-normal">Boxes</small>
                  </h3>
                  <div className="mt-2 fs-12 text-warning">
                    <i className="fa-solid fa-clock me-1"></i> Awaiting Carrier
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-warning-subtle text-warning" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-truck-fast fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">Dispatched Boxes</span>
                  <h3 className="mb-0 mt-1 text-primary fw-bold">
                    {stats.dispatchedBoxes.toLocaleString()} <small className="text-muted fs-14 fw-normal">Boxes</small>
                  </h3>
                  <div className="mt-2 fs-12 text-primary">
                    <i className="fa-solid fa-road me-1"></i> In transit to sites
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-primary-subtle text-primary" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-dolly fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted text-uppercase fs-12 fw-semibold">QC Defect / Rework</span>
                  <h3 className="mb-0 mt-1 text-danger fw-bold">{stats.damagedUnits.toLocaleString()}</h3>
                  <div className="mt-2 fs-12 text-danger">
                    <i className="fa-solid fa-screwdriver me-1"></i> In rework bay
                  </div>
                </div>
                <div className="rounded-circle p-3 bg-danger-subtle text-danger" style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-triangle-exclamation fa-xl"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section: Production Analytics & QC Breakdown */}
      <Row className="mb-4">
        {/* Main Production Output Trends */}
        <Col xl={8} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Production & QC Throughput</h5>
                <span className="text-muted fs-12">Comparative output tracking for Solar Lights, Battery Packs, and QC clearance</span>
              </div>
              <div className="btn-group mt-2 mt-sm-0" role="group">
                <Button
                  variant={timeRange === "day" ? "primary" : "outline-primary"}
                  size="sm"
                  className="py-1 px-3 fs-12"
                  onClick={() => setTimeRange("day")}
                >
                  Today
                </Button>
                <Button
                  variant={timeRange === "week" ? "primary" : "outline-primary"}
                  size="sm"
                  className="py-1 px-3 fs-12"
                  onClick={() => setTimeRange("week")}
                >
                  This Week
                </Button>
                <Button
                  variant={timeRange === "month" ? "primary" : "outline-primary"}
                  size="sm"
                  className="py-1 px-3 fs-12"
                  onClick={() => setTimeRange("month")}
                >
                  Monthly
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="pt-2">
              <ReactApexChart
                options={productionChartOptions}
                series={productionChartSeries}
                type="area"
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Quality Inspection & Yield Donut */}
        <Col xl={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Quality Inspection Yield</h5>
                <span className="text-muted fs-12">QC Clearance vs Rejection</span>
              </div>
              <Dropdown align="end">
                <Dropdown.Toggle as="button" className="btn btn-sm btn-link text-muted p-0 border-0">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end shadow-sm border-0 fs-13">
                  <Dropdown.Item as={Link} to="/light/qc/inspection">Full QC Report</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/light/qc/inspection">Calibrate Tester</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <ReactApexChart
                options={qcDonutOptions}
                series={qcDonutSeries}
                type="donut"
                height={260}
              />
              <div className="border-top pt-3 mt-2">
                <div className="row text-center">
                  <div className="col-4 border-end">
                    <span className="text-muted fs-11 d-block">Passed</span>
                    <strong className="text-success fs-14">{stats.qcPassedUnits}</strong>
                  </div>
                  <div className="col-4 border-end">
                    <span className="text-muted fs-11 d-block">Testing</span>
                    <strong className="text-warning fs-14">80</strong>
                  </div>
                  <div className="col-4">
                    <span className="text-muted fs-11 d-block">Defect</span>
                    <strong className="text-danger fs-14">{stats.damagedUnits}</strong>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Operational Tables: Packaging & Active Lines */}
      <Row>
        {/* Table 1: Box Packaging & Dispatch Log */}
        <Col xl={8} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Recent Packaging & Dispatch Batches</h5>
                <span className="text-muted fs-12">Box sealing and consignment movement tracking (Max 20 units/box)</span>
              </div>
              <div className="d-flex align-items-center gap-1 mt-2 mt-sm-0">
                <Button
                  variant={tableFilter === "all" ? "dark" : "outline-dark"}
                  size="sm"
                  className="py-1 px-2 fs-11 rounded-2"
                  onClick={() => setTableFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={tableFilter === "ready" ? "warning" : "outline-warning"}
                  size="sm"
                  className="py-1 px-2 fs-11 rounded-2"
                  onClick={() => setTableFilter("ready")}
                >
                  Ready
                </Button>
                <Button
                  variant={tableFilter === "dispatch" ? "primary" : "outline-primary"}
                  size="sm"
                  className="py-1 px-2 fs-11 rounded-2"
                  onClick={() => setTableFilter("dispatch")}
                >
                  Dispatched
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table table-hover align-middle mb-0 text-nowrap">
                  <thead className="table-light">
                    <tr className="fs-12 text-muted text-uppercase">
                      <th className="ps-3">Box ID</th>
                      <th>Product & Model</th>
                      <th>Capacity (Max 20)</th>
                      <th>Inspector</th>
                      <th>Status</th>
                      <th className="text-end pe-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="fs-13">
                    {filteredBoxes.map((box, index) => (
                      <tr key={index}>
                        <td className="ps-3">
                          <strong className="text-dark">{box.boxId}</strong>
                          <span className="d-block text-muted fs-11">{box.date}</span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark">{box.itemType}</span>
                          <span className="d-block text-muted fs-11 font-monospace">{box.serialRange}</span>
                        </td>
                        <td style={{ minWidth: "130px" }}>
                          <div className="d-flex align-items-center justify-content-between fs-11 mb-1">
                            <span className="fw-bold">{box.unitsPacked} / {box.maxCapacity}</span>
                            <span className="text-muted">{Math.round((box.unitsPacked / box.maxCapacity) * 100)}%</span>
                          </div>
                          <ProgressBar
                            now={(box.unitsPacked / box.maxCapacity) * 100}
                            variant={box.unitsPacked === 20 ? "success" : "info"}
                            style={{ height: "5px" }}
                          />
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border fs-11">{box.inspector}</span>
                        </td>
                        <td>
                          <Badge bg={`${box.statusBadge}-subtle`} className={`text-${box.statusBadge} border border-${box.statusBadge} px-2 py-1 fs-11`}>
                            {box.status}
                          </Badge>
                        </td>
                        <td className="text-end pe-3">
                          <Dropdown align="end">
                            <Dropdown.Toggle as="button" className="btn btn-xs btn-light border py-1 px-2">
                              <i className="fa-solid fa-gear fs-11"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-sm border-0 fs-12">
                              <Dropdown.Item as={Link} to="/light/box/packaging">
                                <i className="fa-solid fa-barcode me-2 text-primary"></i> View Box Serials
                              </Dropdown.Item>
                              <Dropdown.Item as={Link} to="/light/dispatch/create">
                                <i className="fa-solid fa-truck-fast me-2 text-warning"></i> Add to Dispatch
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item href="#print">
                                <i className="fa-solid fa-print me-2 text-dark"></i> Print Box Label
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Table 2: Active Assembly Lines & Stations */}
        <Col xl={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Assembly Stations</h5>
                <span className="text-muted fs-12">Real-time station progress</span>
              </div>
              <span className="badge bg-primary-subtle text-primary fs-11">Live Sync</span>
            </Card.Header>
            <Card.Body className="p-3">
              {/* Station 1 */}
              <div className="p-3 mb-3 border rounded-3 bg-light-subtle">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="fs-13 text-dark">Line 1: Solar LED Assembly</strong>
                  <span className="badge bg-success-subtle text-success fs-10">Running</span>
                </div>
                <div className="text-muted fs-12 mb-2">Driver fitment & Luminary body sealing</div>
                <div className="d-flex justify-content-between fs-11 text-muted mb-1">
                  <span>Target: 1,000 Units</span>
                  <span className="fw-bold text-dark">840 (84%)</span>
                </div>
                <ProgressBar now={84} variant="primary" style={{ height: "6px" }} />
              </div>

              {/* Station 2 */}
              <div className="p-3 mb-3 border rounded-3 bg-light-subtle">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="fs-13 text-dark">Line 2: BMS & Battery Pack</strong>
                  <span className="badge bg-success-subtle text-success fs-10">Running</span>
                </div>
                <div className="text-muted fs-12 mb-2">Spot welding & Cell balance testing</div>
                <div className="d-flex justify-content-between fs-11 text-muted mb-1">
                  <span>Target: 800 Units</span>
                  <span className="fw-bold text-dark">710 (88%)</span>
                </div>
                <ProgressBar now={88} variant="info" style={{ height: "6px" }} />
              </div>

              {/* Station 3 */}
              <div className="p-3 border rounded-3 bg-light-subtle">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="fs-13 text-dark">Line 3: Aging & QC Burn-in</strong>
                  <span className="badge bg-warning-subtle text-warning fs-10">High Load</span>
                </div>
                <div className="text-muted fs-12 mb-2">Continuous discharge & thermal test</div>
                <div className="d-flex justify-content-between fs-11 text-muted mb-1">
                  <span>Target: 600 Units</span>
                  <span className="fw-bold text-dark">540 (90%)</span>
                </div>
                <ProgressBar now={90} variant="warning" style={{ height: "6px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LightDashboard;