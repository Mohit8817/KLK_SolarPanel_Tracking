import { useState, useEffect } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Tab,
  Nav,
  Table,
  Badge,
  Button,
  ProgressBar,
  Form,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";

import PageTitle from "../../../layouts/PageTitle";
import profileImg from "../../../../assets/images/profile/profile.png";

const AppProfile = () => {
  // =========================================================
  // MODAL / UI STATES
  // =========================================================

  const [showLogModal, setShowLogModal] = useState(false);
  const [logText, setLogText] = useState("");
  const [selectedLine, setSelectedLine] = useState("line-1");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // =========================================================
  // PROFILE DATA
  // =========================================================

  const [profileData, setProfileData] = useState({
    name: "",
    empId: "",
    role: "",
    department: "",
    warehouse: "",
    email: "",
    phone: "",
    shift: "",
    scannerId: "",
    joinedDate: "",
    totalQcCertified: "0",
    yieldRate: "0%",
    boxesSealed: "0",
  });

  // =========================================================
  // ACTIVITY LOGS
  // =========================================================

  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      badgeClass: "bg-success-subtle text-success",
      icon: "fa-solid fa-check",
      title: "QC Clearance Approved — 20 Units (Box #BX-SOL-9081)",
      desc: "40W Solar Street Light luminary burn-in test passed at 14:15 today.",
    },
    { 
      id: 2,
      badgeClass: "bg-primary-subtle text-primary",
      icon: "fa-solid fa-barcode",
      title: "Serial Numbers Batch Generated — 500 Units",
      desc: "LiFePO4 12.8V 30Ah Battery serial range (BAT-30AH-8800 ~ 9300).",
    },
    {
      id: 3,
      badgeClass: "bg-danger-subtle text-danger",
      icon: "fa-solid fa-triangle-exclamation",
      title: "Flagged 4 Battery Packs for BMS Voltage Deviation",
      desc: "Sent to Station 2 Rework Bay for cell re-balancing.",
    },
    {
      id: 4,
      badgeClass: "bg-info-subtle text-info",
      icon: "fa-solid fa-file-invoice",
      title: "Created Material BOM #BOM511250207120307",
      desc: "12W Capsule Street Light BOM recipe configured for HO Warehouse.",
    },
  ]);

  // =========================================================
  // EDIT PROFILE FORM
  // =========================================================

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    warehouse: "",
    shift: "",
  });

  // =========================================================
  // FETCH LOGGED-IN USER PROFILE
  // API: users/my-profile
  // =========================================================

  const fetchMyProfile = async () => {
    setLoading(true);
    setApiError("");

    try {
      // -----------------------------------------------------
      // Get authentication token
      // -----------------------------------------------------

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      // -----------------------------------------------------
      // API Request
      // -----------------------------------------------------

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}users/my-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = res.data;

      console.log("MY PROFILE API RESPONSE:", result);

      // -----------------------------------------------------
      // Support different API response structures
      //
      // { success: true, user: {...} }
      // OR
      // { success: true, data: {...} }
      // OR
      // {...user}
      // -----------------------------------------------------

      const u = result?.user || result?.data || result;

      if (!u || typeof u !== "object") {
        throw new Error("Invalid profile response");
      }

      // -----------------------------------------------------
      // Full name
      // -----------------------------------------------------

      const fullName =
        [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
        u?.name ||
        "";

      // -----------------------------------------------------
      // Role
      // -----------------------------------------------------

      const roleName =
        u?.role && typeof u.role === "object" ? u.role?.name : u?.role;

      // -----------------------------------------------------
      // Profile object
      // -----------------------------------------------------

      const updatedProfile = {  
        name: fullName,
        empId:
          u?.emp_id ||
          u?.employee_id ||
          u?.employee_code ||
          u?.empCode ||
          "",

        role: roleName || "",

        department:
          u?.department?.name || u?.department_name || u?.department || "",

        warehouse:
          u?.warehouse?.name || u?.warehouse_name || u?.warehouse || "",

        email: u?.email || "",

        phone:
          u?.contact_no || u?.phone || u?.mobile || u?.mobile_no || "",

        shift: u?.shift?.name || u?.shift_name || u?.shift || "",

        scannerId: u?.scanner_id || u?.scannerId || "",

        joinedDate:
          u?.joined_date || u?.joining_date || u?.date_of_joining || "",

        totalQcCertified:
          u?.total_qc_certified || u?.totalQcCertified || "0",

        yieldRate: u?.yield_rate || u?.yieldRate || "0%",

        boxesSealed: u?.boxes_sealed || u?.boxesSealed || "0",
      };

      // -----------------------------------------------------
      // Set Profile
      // -----------------------------------------------------

      setProfileData((prev) => ({
        ...prev,
        ...updatedProfile,
      }));

      // -----------------------------------------------------
      // Set Edit Form
      // -----------------------------------------------------

      setEditFormData({
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        warehouse: updatedProfile.warehouse,
        shift: updatedProfile.shift,
      });

      // -----------------------------------------------------
      // Update localStorage user
      // -----------------------------------------------------

      localStorage.setItem("user", JSON.stringify(u));
    } catch (error) {
      console.error(
        "Failed to fetch my profile:",
        error?.response?.data || error.message
      );

      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch profile from server."
      );

      // =====================================================
      // FALLBACK TO LOCAL STORAGE
      // =====================================================

      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const u = JSON.parse(storedUser);

          const fullName =
            [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
            u?.name ||
            "";

          const roleName =
            u?.role && typeof u.role === "object" ? u?.role?.name : u?.role;

          const fallbackProfile = {
            name: fullName,
            empId: u?.emp_id || u?.employee_id || u?.employee_code || "",

            role: roleName || "",

            department:
              u?.department?.name ||
              u?.department_name ||
              u?.department ||
              "",

            warehouse:
              u?.warehouse?.name || u?.warehouse_name || u?.warehouse || "",

            email: u?.email || "",

            phone:
              u?.contact_no || u?.phone || u?.mobile || u?.mobile_no || "",

            shift: u?.shift?.name || u?.shift_name || u?.shift || "",
          };

          setProfileData((prev) => ({
            ...prev,
            ...fallbackProfile,
          }));

          setEditFormData({
            name: fallbackProfile.name,
            email: fallbackProfile.email,
            phone: fallbackProfile.phone,
            warehouse: fallbackProfile.warehouse,
            shift: fallbackProfile.shift,
          });
        }
      } catch (fallbackError) {
        console.error("LocalStorage fallback failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  // =========================================================
  // HANDOVER SUBMIT
  // =========================================================

  const handleHandoverSubmit = (e) => {
    e.preventDefault();

    if (!logText.trim()) return;

    const lineNames = {
      "line-1": "Line 1 (Street Light)",
      "line-2": "Line 2 (LiFePO4 Battery)",
      "line-3": "Line 3 (Aging & Burn-in)",
    };

    const newLog = {
      id: Date.now(),
      badgeClass: "bg-warning-subtle text-warning",
      icon: "fa-solid fa-clock-rotate-left",
      title: `Handover Log: ${lineNames[selectedLine] || selectedLine}`,
      desc: logText.trim(),
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    setLogText("");
    setShowLogModal(false);
  };

  // =========================================================
  // SAVE PROFILE SETTINGS
  // =========================================================

  const handleSaveSettings = (e) => {
    e.preventDefault();

    setProfileData((prev) => ({
      ...prev,
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      warehouse: editFormData.warehouse,
      shift: editFormData.shift,
    }));

    setSaveSuccessMsg("Profile & Station settings updated successfully!");

    setTimeout(() => {
      setSaveSuccessMsg("");
    }, 3500);
  };

  // =========================================================
  // RETURN UI
  // =========================================================

  return (
    <div className="solar-profile-page pb-4">
      {/* =====================================================
          STYLE
      ====================================================== */}

      <style>{`
        .solar-profile-page {
          --plant-ink: #1B2733;
          --plant-steel: #2C4A66;
          --plant-steel-dark: #16283A;
          --plant-amber: #E8A33D;
          --plant-concrete: #F2F4F6;
          --plant-line: #E1E5EA;
          --plant-success: #2F8F5B;
        }

        .plant-header {
          background: var(--plant-concrete);
          border: 1px solid var(--plant-line);
          border-left: 4px solid var(--plant-amber);
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          padding: 18px 20px;
        }

        .plant-header::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 90px;
          height: 100%;
          background: repeating-linear-gradient(
            135deg,
            rgba(27,39,51,0.06) 0px,
            rgba(27,39,51,0.06) 8px,
            transparent 8px,
            transparent 16px
          );
        }

        .plant-facility-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--plant-steel-dark);
          background: #fff;
          border: 1px solid var(--plant-line);
          border-radius: 4px;
          padding: 4px 10px;
        }

        .plant-photo-ring {
          border: 3px solid #fff;
          box-shadow: 0 0 0 1px var(--plant-line);
        }

        .kpi-tile {
          padding: 10px 6px;
          border-right: 1px solid var(--plant-line);
        }

        .kpi-tile:last-child {
          border-right: none;
        }

        .kpi-tile .kpi-figure {
          font-size: 20px;
          font-weight: 700;
          color: var(--plant-steel-dark);
        }

        .kpi-tile .kpi-label {
          font-size: 11px;
          color: #6B7885;
        }

        .ws-card {
          background: #fff;
          border: 1px solid var(--plant-line);
          border-left: 3px solid var(--ws-color, var(--plant-steel));
          border-radius: 4px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .info-tile {
          padding: 10px 12px;
          border: 1px solid var(--plant-line);
          border-radius: 4px;
          background: #fff;
        }

        .info-tile .info-label {
          font-size: 12px;
          color: #6B7885;
          display: block;
        }

        .plant-tabs .nav-link {
          color: #6B7885;
          border: none;
          border-bottom: 2px solid transparent;
          font-weight: 600;
          padding-left: 4px;
          padding-right: 4px;
          margin-right: 22px;
        }

        .plant-tabs .nav-link.active {
          color: var(--plant-steel-dark);
          background: transparent;
          border-bottom: 2px solid var(--plant-amber);
        }
      `}</style>

      {/* =====================================================
          PAGE TITLE
      ====================================================== */}

      <PageTitle activeMenu="Operator Profile" motherMenu="Solar & Battery System" />

      {/* =====================================================
          API ERROR
      ====================================================== */}

      {apiError && (
        <Alert
          variant="warning"
          dismissible
          onClose={() => setApiError("")}
          className="mb-3 py-2 fs-13"
        >
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          Profile API could not be loaded. Showing saved user data.
        </Alert>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {saveSuccessMsg && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSaveSuccessMsg("")}
          className="mb-3 py-2 fs-13"
        >
          <i className="fa-solid fa-circle-check me-2"></i>
          {saveSuccessMsg}
        </Alert>
      )}

      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}

      <Row>
        <Col lg={12}>
          <div className="profile plant-header mb-4">
            <div className="d-flex flex-wrap align-items-center gap-3">

              {/* Profile Image */}

              <div className="position-relative">
                <img
                  src={profileImg}
                  className="plant-photo-ring rounded-circle"
                  alt="profile"
                  style={{
                    width: "84px",
                    height: "84px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />

                <span
                  className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  title="Active On-Duty"
                ></span>
              </div>

              {/* User Information */}

              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h4 className="mb-0 fw-bold" style={{ color: "var(--plant-steel-dark)" }}>
                    {loading ? <Spinner animation="border" size="sm" /> : profileData.name || "User"}
                  </h4>

                  {profileData.empId && (
                    <span className="plant-facility-tag">
                      <i className="fa-solid fa-id-badge"></i>
                      {profileData.empId}
                    </span>
                  )}
                </div>

                <p className="mb-1 text-muted fs-13">
                  <i className="fa-solid fa-briefcase me-1"></i>
                  {profileData.role || "Role not assigned"}
                </p>

                <div className="d-flex flex-wrap gap-3 fs-12 text-muted">
                  {profileData.department && (
                    <span>
                      <i className="fa-solid fa-industry me-1"></i>
                      {profileData.department}
                    </span>
                  )}

                  {profileData.warehouse && (
                    <span>
                      <i className="fa-solid fa-location-dot me-1"></i>
                      {profileData.warehouse}
                    </span>
                  )}
                </div>
              </div>

              {/* Buttons */}

              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  className="px-3 fs-12 rounded-2 border-0"
                  style={{ background: "var(--plant-steel-dark)" }}
                  onClick={() => setShowLogModal(true)}
                >
                  <i className="fa-solid fa-pen-to-square me-1"></i>
                  Log Shift Handover
                </Button>

                <Button variant="outline-dark" size="sm" className="px-3 fs-12 rounded-2">
                  <i className="fa-solid fa-id-card me-1"></i>
                  Operator ID
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <Row>
        <Col xl={12} lg={12}>
          <Card className="border shadow-none">
            <Card.Body className="p-4">
              <div className="custom-tab-1">
                <Tab.Container defaultActiveKey="overview">
                  {/* =================================================
                      TAB NAVIGATION
                  ================================================== */}

                  <Nav as="ul" className="nav plant-tabs mb-4 border-bottom">
                    <Nav.Item as="li">
                      <Nav.Link eventKey="overview" className="fs-13">
                        <i className="fa-solid fa-circle-user me-1"></i>
                        Overview & Activity
                      </Nav.Link>
                    </Nav.Item>

                    <Nav.Item as="li">
                      <Nav.Link eventKey="skills" className="fs-13">
                        <i className="fa-solid fa-list-check me-1"></i>
                        Competencies & Skills
                      </Nav.Link>
                    </Nav.Item>

                    <Nav.Item as="li">
                      <Nav.Link eventKey="permissions" className="fs-13">
                        <i className="fa-solid fa-shield-halved me-1"></i>
                        Software Permissions
                      </Nav.Link>
                    </Nav.Item>

                    <Nav.Item as="li">
                      <Nav.Link eventKey="settings" className="fs-13">
                        <i className="fa-solid fa-sliders me-1"></i>
                        Profile Settings
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  {/* =================================================
                      TAB CONTENT
                  ================================================== */}

                  <Tab.Content>
                    {/* =================================================
                        OVERVIEW
                    ================================================== */}

                    <Tab.Pane eventKey="overview">
                      <div className="profile-personal-info mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--plant-steel-dark)" }}>
                          Operator Master Information
                        </h5>

                        <Row className="g-2 fs-13">
                          <Col md={6}>
                            <div className="info-tile">
                              <span className="info-label">Full name</span>
                              <strong className="text-dark">{profileData.name || "-"}</strong>
                            </div>
                          </Col>

                          <Col md={6}>
                            <div className="info-tile">
                              <span className="info-label">Official email</span>
                              <strong className="text-dark">{profileData.email || "-"}</strong>
                            </div>
                          </Col>

                          <Col md={6}>
                            <div className="info-tile">
                              <span className="info-label">Contact mobile</span>
                              <strong className="text-dark">{profileData.phone || "-"}</strong>
                            </div>
                          </Col>

                          <Col md={6}>
                            <div className="info-tile">
                              <span className="info-label">Active shift</span>
                              <strong className="text-dark">{profileData.shift || "-"}</strong>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      {/* Recent Activity */}

                      <div className="recent-activity-log">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--plant-steel-dark)" }}>
                          Recent Production & QC Actions
                        </h5>

                        <div className="timeline-items">
                          {activityLogs.map((item) => (
                            <div key={item.id} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                              <span className={`badge ${item.badgeClass} p-2 rounded-circle align-self-start`}>
                                <i className={`${item.icon} fs-13`}></i>
                              </span>

                              <div>
                                <strong className="fs-13 text-dark d-block">{item.title}</strong>
                                <span className="text-muted fs-12">{item.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Tab.Pane>

                    {/* =================================================
                        SKILLS
                    ================================================== */}

                    <Tab.Pane eventKey="skills">
                      <div className="profile-skills mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--plant-steel-dark)" }}>
                          Manufacturing & Technical Competencies
                        </h5>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between fs-12 mb-1">
                            <strong className="text-dark">LiFePO4 Cell Balancing & BMS Calibration</strong>
                            <span className="fw-bold text-success">98% (Master)</span>
                          </div>
                          <ProgressBar now={98} variant="success" style={{ height: "7px" }} />
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between fs-12 mb-1">
                            <strong className="text-dark">Solar Luminary LED Driver Fitment & SMT Assembly</strong>
                            <span className="fw-bold text-primary">95% (Expert)</span>
                          </div>
                          <ProgressBar now={95} variant="primary" style={{ height: "7px" }} />
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between fs-12 mb-1">
                            <strong className="text-dark">Photometric Lux & CCT Spectrometer Testing</strong>
                            <span className="fw-bold text-info">90% (Advanced)</span>
                          </div>
                          <ProgressBar now={90} variant="info" style={{ height: "7px" }} />
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between fs-12 mb-1">
                            <strong className="text-dark">Box Packaging Console & Barcode Serialization</strong>
                            <span className="fw-bold text-warning">99% (Master)</span>
                          </div>
                          <ProgressBar now={99} variant="warning" style={{ height: "7px" }} />
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{ background: "var(--plant-concrete)" }}>
                        <h6 className="fw-bold text-dark fs-13 mb-2">Technical tags & specializations</h6>

                        <div className="d-flex flex-wrap gap-1">
                          <span className="badge bg-white text-dark border">Solar Charge Controller</span>
                          <span className="badge bg-white text-dark border">LiFePO4 Spot Welding</span>
                          <span className="badge bg-white text-dark border">IP66 Waterproof Gasket</span>
                          <span className="badge bg-white text-dark border">BOM Requisition</span>
                          <span className="badge bg-white text-dark border">Consignment Gatepass</span>
                          <span className="badge bg-white text-dark border">Quality Assurance (QC)</span>
                        </div>
                      </div>
                    </Tab.Pane>

                    {/* =================================================
                        PERMISSIONS
                    ================================================== */}

                    <Tab.Pane eventKey="permissions">
                      <h5 className="fw-bold mb-3" style={{ color: "var(--plant-steel-dark)" }}>
                        Assigned Software Privileges
                      </h5>

                      <div className="table-responsive border rounded">
                        <Table hover className="mb-0 align-middle text-nowrap fs-13">
                          <thead style={{ background: "var(--plant-concrete)" }} className="fs-12 text-muted">
                            <tr>
                              <th>Module Name</th>
                              <th>Access Rights</th>
                              <th>Approval Authority</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr>
                              <td>
                                <strong className="text-dark">BOM Management</strong>
                                <span className="d-block text-muted fs-11">Bill of Materials Creation</span>
                              </td>
                              <td>
                                <Badge bg="light" className="text-dark border">Read / Write / Delete</Badge>
                              </td>
                              <td><span className="text-success fw-semibold">Authorized</span></td>
                              <td><Badge bg="success">Active</Badge></td>
                            </tr>

                            <tr>
                              <td>
                                <strong className="text-dark">Serial Generation</strong>
                                <span className="d-block text-muted fs-11">Lights & Battery Serials</span>
                              </td>
                              <td>
                                <Badge bg="light" className="text-dark border">Batch Generate & Export</Badge>
                              </td>
                              <td><span className="text-success fw-semibold">Authorized</span></td>
                              <td><Badge bg="success">Active</Badge></td>
                            </tr>

                            <tr>
                              <td>
                                <strong className="text-dark">Quality Check (QC) Bay</strong>
                                <span className="d-block text-muted fs-11">Line Inspection & Testing</span>
                              </td>
                              <td>
                                <Badge bg="light" className="text-dark border">Pass / Rework / Scrap</Badge>
                              </td>
                              <td><span className="text-success fw-semibold">Chief Inspector</span></td>
                              <td><Badge bg="success">Active</Badge></td>
                            </tr>

                            <tr>
                              <td>
                                <strong className="text-dark">Box Packaging Console</strong>
                                <span className="d-block text-muted fs-11">Max 20 Units per Box</span>
                              </td>
                              <td>
                                <Badge bg="light" className="text-dark border">Scan & Seal Box</Badge>
                              </td>
                              <td><span className="text-success fw-semibold">Authorized</span></td>
                              <td><Badge bg="success">Active</Badge></td>
                            </tr>

                            <tr>
                              <td>
                                <strong className="text-dark">Dispatch & Logistics</strong>
                                <span className="d-block text-muted fs-11">Outward Consignment Gatepass</span>
                              </td>
                              <td>
                                <Badge bg="light" className="text-dark border">View & Verify Only</Badge>
                              </td>
                              <td><span className="text-warning fw-semibold">Supervisor Sign Required</span></td>
                              <td><Badge bg="success">Active</Badge></td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </Tab.Pane>

                    {/* =================================================
                        SETTINGS
                    ================================================== */}

                    <Tab.Pane eventKey="settings">
                      <div className="settings-form">
                        <h5 className="fw-bold mb-3" style={{ color: "var(--plant-steel-dark)" }}>
                          Update Profile & Station Settings
                        </h5>

                        <Form onSubmit={handleSaveSettings}>
                          <Row>
                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Full Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={editFormData.name}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, name: e.target.value })
                                }
                              />
                            </Form.Group>

                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Employee Code</Form.Label>
                              <Form.Control type="text" value={profileData.empId} disabled readOnly />
                            </Form.Group>
                          </Row>

                          <Row>
                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Official Email</Form.Label>
                              <Form.Control
                                type="email"
                                value={editFormData.email}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, email: e.target.value })
                                }
                              />
                            </Form.Group>

                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Contact Phone</Form.Label>
                              <Form.Control
                                type="text"
                                value={editFormData.phone}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, phone: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Row>

                          <Row>
                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Default Plant / Warehouse</Form.Label>
                              <Form.Select
                                value={editFormData.warehouse}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, warehouse: e.target.value })
                                }
                              >
                                <option value="">Select Warehouse</option>
                                <option value="HO Central Warehouse (Line 1, 2 & 3)">HO Central Warehouse</option>
                                <option value="Indore Manufacturing Bay 2">Indore Manufacturing Bay 2</option>
                                <option value="Jaipur Regional Depot">Jaipur Regional Depot</option>
                              </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Assigned Shift</Form.Label>
                              <Form.Select
                                value={editFormData.shift}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, shift: e.target.value })
                                }
                              >
                                <option value="">Select Shift</option>
                                <option value="Morning Shift-A (08:00 AM – 04:30 PM)">
                                  Morning Shift-A (08:00 AM – 04:30 PM)
                                </option>
                                <option value="Evening Shift-B (04:30 PM – 01:00 AM)">
                                  Evening Shift-B (04:30 PM – 01:00 AM)
                                </option>
                                <option value="General Plant Shift (09:30 AM – 06:00 PM)">
                                  General Plant Shift (09:30 AM – 06:00 PM)
                                </option>
                              </Form.Select>
                            </Form.Group>
                          </Row>

                          <hr className="my-3 text-muted" />

                          <h6 className="fw-bold text-dark fs-13 mb-3">Security & Password Update</h6>

                          <Row>
                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">New Password</Form.Label>
                              <Form.Control type="password" placeholder="Enter new password" />
                            </Form.Group>

                            <Form.Group className="mb-3 col-md-6">
                              <Form.Label className="fs-12 fw-semibold">Confirm New Password</Form.Label>
                              <Form.Control type="password" placeholder="Repeat new password" />
                            </Form.Group>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="alertCheck"
                              label="Receive SMS alert for critical QC Line rejections (>5 units in a single batch)"
                              defaultChecked
                              className="fs-12"
                            />
                          </Form.Group>

                          <Button
                            type="submit"
                            className="px-4 fs-13 border-0"
                            style={{ background: "var(--plant-steel-dark)" }}
                          >
                            Save Changes
                          </Button>
                        </Form>
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          SHIFT HANDOVER MODAL
      ====================================================== */}

      <Modal show={showLogModal} onHide={() => setShowLogModal(false)} centered>
        <Modal.Header closeButton className="py-3">
          <Modal.Title className="fs-14 fw-bold text-dark">
            <i className="fa-solid fa-pen-to-square text-primary me-2"></i>
            Plant Shift Handover Entry
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          <Form onSubmit={handleHandoverSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12 fw-semibold">Workstation / Line</Form.Label>
              <Form.Select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
                <option value="line-1">Line 1: Solar Street Light Luminary</option>
                <option value="line-2">Line 2: LiFePO4 Battery Assembly</option>
                <option value="line-3">Line 3: Aging & Burn-in Chamber</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-12 fw-semibold">Handover Notes / Next Shift Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Mention pending serials, testing status or material shortages..."
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowLogModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit Handover
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AppProfile;