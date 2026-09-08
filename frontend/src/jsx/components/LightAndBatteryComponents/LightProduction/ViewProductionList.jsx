import { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Badge,
  Form,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import CommonPagination from "../../Common/Pagination";
import TableExportActions from "../../Common/TableExportActions";
import PrefixCell from "../../Common/PrefixCell";
import { PageLoader } from "../../Common/LoadingState";
import { notifyError, notifySuccess } from "../../../utils/toast";


const MOCK_LIGHT_RECORDS = [
  {
    _id: "demo-l1",
    date: "2026-09-01",
    item_count: 100,
    light_type: "SEMI",
    wattage: "20W",
    generated_year: "2026",
    prefix: "SL-",
    project: "Bihar Rural Electrification",
    state: "Bihar",
    vendor: {
      first_name: "Rahul",
      last_name: "Sharma",
    },
  },
  {
    _id: "demo-l2",
    date: "2026-08-20",
    item_count: 250,
    light_type: "INBUILT",
    wattage: "30W",
    generated_year: "2026",
    prefix: "SL-",
    project: "UP Highway Lighting",
    state: "Uttar Pradesh",
    vendor: {
      first_name: "Amit",
      last_name: "Verma",
    },
  },
  {
    _id: "demo-l3",
    date: "2026-08-05",
    item_count: 60,
    light_type: "SEMI",
    wattage: "40W",
    generated_year: "2026",
    prefix: "SLX-",
    project: "MP Village Solar Program",
    state: "Madhya Pradesh",
    vendor: null,
  },
];


const MOCK_BATTERY_RECORDS = [
  {
    _id: "demo-b1",
    date: "2026-09-02",
    item_count: 150,
    chemistry: "LiFePO4",
    capacity: "12.8V 30Ah",
    generated_year: "2026",
    prefix: "BAT-",
    project: "Bihar Rural Electrification",
    state: "Bihar",
    vendor: {
      first_name: "Suresh",
      last_name: "Yadav",
    },
  },
  {
    _id: "demo-b2",
    date: "2026-08-18",
    item_count: 80,
    chemistry: "Li-ion",
    capacity: "25.6V 30Ah",
    generated_year: "2026",
    prefix: "BATX-",
    project: "UP Highway Lighting",
    state: "Uttar Pradesh",
    vendor: null,
  },
];


const ViewLightBatteryProduction = () => {
  const [category, setCategory] = useState("LIGHT");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);

  // const [showViewModal, setShowViewModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [selectedRecord, setSelectedRecord] = useState(null);

const [editForm, setEditForm] = useState({});

  const isLight = category === "LIGHT";

  const navigate = useNavigate();


  // ================= CATEGORY CHANGE =================
  const handleCategoryChange = (selectedCategory) => {
    if (selectedCategory === category) return;

    setCategory(selectedCategory);
    setRecords([]);
    setIsDemoData(false);
  };


  const handleView = (record) => {
  navigate("/production/light-battery/series", {
    state: { record, category },
  });
};

  // ================= FETCH RECORDS =================
  const fetchRecords = useCallback(async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      

      const endpoint =
        category === "LIGHT"
          ? "production/list-production-light"
          : "production/list-production-battery";

      const baseUrl =
        import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, "") || "";

      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = await response.json();

      if (
        response.ok &&
        data?.success &&
        Array.isArray(data?.data) &&
        data.data.length > 0
      ) {
        setRecords(data.data);
        setIsDemoData(false);
      } else {
        setRecords(
          category === "LIGHT"
            ? MOCK_LIGHT_RECORDS
            : MOCK_BATTERY_RECORDS
        );
        setIsDemoData(true);
      }
    } catch (error) {
      console.error("Fetch Error:", error);

      setRecords(
        category === "LIGHT"
          ? MOCK_LIGHT_RECORDS
          : MOCK_BATTERY_RECORDS
      );

      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [category]);


  // ================= FETCH ON CATEGORY CHANGE =================
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);



  

  // ================= FLATTEN RECORDS =================
  const flattenedRecords = useMemo(() => {
    return records.map((row) => ({
      ...row,

      type_or_chem:
        category === "LIGHT"
          ? row.light_type === "INBUILT"
            ? "All-In-One"
            : row.light_type === "SEMI"
            ? "Semi-Integrated"
            : row.light_type || "-"
          : row.chemistry || "-",

      spec_value:
        category === "LIGHT"
          ? row.wattage || "-"
          : row.capacity || "-",

      vendor_name: row.vendor
        ? `${row.vendor.first_name || ""} ${
            row.vendor.last_name || ""
          }`.trim()
        : "Not Assigned",
    }));
  }, [records, category]);


  // ================= GENERATE PANEL SERIAL LIST (FRONTEND ONLY) =================

  // ================= SEARCH KEYS =================
  const SEARCH_KEYS = [
    "date",
    "prefix",
    "project",
    "state",
    "generated_year",
    "type_or_chem",
    "spec_value",
    "vendor_name",
  ];


  // ================= SEARCH + PAGINATION =================
  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(flattenedRecords, SEARCH_KEYS, 10);


  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, setCurrentPage]);


  // ================= EXPORT DATA =================
  const exportData = useMemo(() => {
    return flattenedRecords.map((row, index) => ({
      sno: index + 1,
      date: row.date
        ? new Date(row.date).toLocaleDateString()
        : "-",
      itemCount: row.item_count ?? "-",
      typeOrChemistry: row.type_or_chem || "-",
      specValue: row.spec_value || "-",
      year: row.generated_year || "-",
      prefix: row.prefix || "-",
      project: row.project || "-",
      state: row.state || "-",
      vendor: row.vendor_name || "Not Assigned",
    }));
  }, [flattenedRecords]);


  // ================= EXPORT COLUMNS =================
  const exportColumns = useMemo(
    () => [
      { label: "S No", key: "sno" },
      { label: "Date", key: "date" },
      { label: "Item Count", key: "itemCount" },
      {
        label: isLight ? "Light Type" : "Chemistry",
        key: "typeOrChemistry",
      },
      {
        label: isLight ? "Wattage" : "Capacity",
        key: "specValue",
      },
      { label: "Year", key: "year" },
      { label: "Prefix", key: "prefix" },
      { label: "Project", key: "project" },
      { label: "State", key: "state" },
      { label: "Vendor", key: "vendor" },
    ],
    [isLight]
  );


  // ================= EXPORT GUARD =================
  const handleExportGuard = (exportFn) => {
    if (flattenedRecords.length === 0) {
      notifyError("No data available to export");
      return;
    }

    exportFn?.();
    notifySuccess("File exported successfully");
  };


// ================= EDIT RECORD =================
const handleEdit = (record) => {
  setSelectedRecord(record);

  setEditForm({
    date: record.date
      ? new Date(record.date).toISOString().split("T")[0]
      : "",

    item_count: record.item_count || "",

    type_or_chem: record.type_or_chem || "",

    spec_value: record.spec_value || "",

    generated_year: record.generated_year || "",

    prefix: record.prefix || "",

    project: record.project || "",

    state: record.state || "",

    vendor_name: record.vendor_name || "",
  });

  setShowEditModal(true);
};


// ================= EDIT INPUT CHANGE =================
const handleEditChange = (e) => {
  const { name, value } = e.target;

  setEditForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};


// ================= UPDATE RECORD =================
const handleUpdateRecord = async () => {
  try {
    if (!selectedRecord?._id) return;

    /*
      Yaha API integration kar sakte ho.

      Example endpoint:

      LIGHT:
      production/update-production-light/:id

      BATTERY:
      production/update-production-battery/:id
    */

    const token = localStorage.getItem("token");

    const endpoint =
      category === "LIGHT"
        ? `production/update-production-light/${selectedRecord._id}`
        : `production/update-production-battery/${selectedRecord._id}`;

    const baseUrl =
      import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, "") || "";

    const payload =
      category === "LIGHT"
        ? {
            date: editForm.date,
            item_count: Number(editForm.item_count),
            light_type: editForm.type_or_chem,
            wattage: editForm.spec_value,
            generated_year: editForm.generated_year,
            prefix: editForm.prefix,
            project: editForm.project,
            state: editForm.state,
          }
        : {
            date: editForm.date,
            item_count: Number(editForm.item_count),
            chemistry: editForm.type_or_chem,
            capacity: editForm.spec_value,
            generated_year: editForm.generated_year,
            prefix: editForm.prefix,
            project: editForm.project,
            state: editForm.state,
          };


    // Demo record check
    if (selectedRecord._id?.startsWith("demo-")) {
      setRecords((prev) =>
        prev.map((item) =>
          item._id === selectedRecord._id
            ? {
                ...item,
                date: editForm.date,
                item_count: Number(editForm.item_count),
                ...(category === "LIGHT"
                  ? {
                      light_type: editForm.type_or_chem,
                      wattage: editForm.spec_value,
                    }
                  : {
                      chemistry: editForm.type_or_chem,
                      capacity: editForm.spec_value,
                    }),
                generated_year: editForm.generated_year,
                prefix: editForm.prefix,
                project: editForm.project,
                state: editForm.state,
              }
            : item
        )
      );

      notifySuccess("Record updated successfully");

      setShowEditModal(false);

      return;
    }


    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify(payload),
    });


    const data = await response.json();


    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message || "Failed to update record"
      );
    }


    notifySuccess(
      data?.message || "Record updated successfully"
    );


    setShowEditModal(false);

    fetchRecords();

  } catch (error) {
    console.error("Update Error:", error);

    notifyError(
      error.message || "Failed to update record"
    );
  }
};


  return (
    <Fragment>
      <PageHeader
        title="View Light & Battery Production"
        subtitle="View, search and export Solar Street Light & Battery Pack production records"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Production" },
          { label: "View Production" },
        ]}
      />


      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>

            {/* LEFT SIDE - CATEGORY */}
            <div className="d-flex align-items-center gap-2 flex-wrap">


              <Button
                variant={
                  category === "LIGHT"
                    ? "primary"
                    : "outline-secondary"
                }
                   className="px-4 py-2"
                onClick={() => handleCategoryChange("LIGHT")}
              >
                <i className="fa-solid fa-lightbulb me-2"></i>
                Solar Street Light
              </Button>


              <Button
                variant={
                  category === "BATTERY"
                    ? "primary"
                    : "outline-secondary"
                }
                   className="px-4 py-2"
                onClick={() => handleCategoryChange("BATTERY")}
              >
                <i className="fa-solid fa-car-battery me-2"></i>
                Battery Pack
              </Button>

            </div>


            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center gap-3 ms-auto flex-nowrap">

              <div style={{ width: "260px", minWidth: "220px" }}>
                <Search
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search prefix, project, state..."
                />
              </div>


              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{
                  minWidth: "145px",
                  whiteSpace: "nowrap",
                }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName={`${
                    isLight ? "Light" : "Battery"
                  }_Production_Report`}
                  onBeforeExport={handleExportGuard}
                />
              </div>

            </div>

          </ListToolbar>
        </Card.Header>


        <Card.Body>

          {/* DEMO DATA ALERT */}
          {isDemoData && !loading && (
            <div className="alert alert-info shadow-sm border py-2 px-3 mb-3 d-flex align-items-center">
              <i className="fa-solid fa-circle-info me-2"></i>

              <small>
                Showing demo data — live records will appear here once the
                production list API returns data.
              </small>
            </div>
          )}


          {loading ? (
            <PageLoader message="Loading production records..." />
          ) : (
            <>
              <Table
                responsive
                className="table-hover align-middle"
                style={{ minWidth: "1100px" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "65px" }}>
                      S No.
                    </th>

                    <th style={{ width: "110px" }}>
                      Date
                    </th>

                    <th style={{ width: "100px" }}>
                      Item Count
                    </th>

                    <th style={{ width: "135px" }}>
                      Category
                    </th>

                    <th style={{ minWidth: "140px" }}>
                      {isLight
                        ? "Light Type"
                        : "Chemistry"}
                    </th>

                    <th style={{ minWidth: "120px" }}>
                      {isLight
                        ? "Wattage"
                        : "Capacity"}
                    </th>

                    <th style={{ width: "90px" }}>
                      Year
                    </th>

                    <th style={{ width: "90px" }}>
                      Prefix
                    </th>

                    <th style={{ minWidth: "160px" }}>
                      Project
                    </th>

                    <th style={{ width: "130px" }}>
                      State
                    </th>

                    <th style={{ minWidth: "140px" }}>
                      Vendor
                    </th>

                    <th
                      className="text-center"
                      style={{
                        width: "110px",
                        minWidth: "110px",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>


                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((row, index) => (
                      <tr key={row._id}>

                        <td>
                          <strong>
                            {startIndex + index + 1}
                          </strong>
                        </td>


                        <td className="text-nowrap">
                          {row.date
                            ? new Date(
                                row.date
                              ).toLocaleDateString()
                            : "-"}
                        </td>


                        <td className="fw-semibold">
                          {row.item_count ?? "-"}
                        </td>


                        <td>
                          {isLight ? (
                            <Badge
                              bg="primary"
                              className="py-2 px-2 d-inline-flex align-items-center gap-1"
                            >
                              <i className="fa-solid fa-lightbulb"></i>
                              Street Light
                            </Badge>
                          ) : (
                            <Badge
                              bg="info"
                              className="py-2 px-2 d-inline-flex align-items-center gap-1"
                            >
                              <i className="fa-solid fa-car-battery"></i>
                              Battery Pack
                            </Badge>
                          )}
                        </td>


                        <td>
                          {row.type_or_chem || "-"}
                        </td>


                        <td className="fw-medium">
                          {row.spec_value || "-"}
                        </td>


                        <td>
                          {row.generated_year || "-"}
                        </td>


                        <td>
                          <PrefixCell
                            value={row.prefix}
                          />
                        </td>


                        <td className="fw-medium">
                          {row.project || "-"}
                        </td>


                        <td>
                          {row.state || "-"}
                        </td>


                        <td>
                          {row.vendor_name ||
                            "Not Assigned"}
                        </td>


                        <td
                          className="text-center"
                          style={{
                            width: "110px",
                            minWidth: "110px",
                          }}
                        >
                          <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">

                          <button
  type="button"
  className="btn btn-xs sharp btn-primary"
  title="View Details"
  onClick={() => handleView(row)}
>
  <i className="fa-solid fa-eye"></i>
</button>

<button
  type="button"
  className="btn btn-xs sharp btn-secondary ms-1"
  title="Edit Record"
  onClick={() => handleEdit(row)}
>
  <i className="fa-solid fa-pen"></i>
</button>

                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="12"
                        className="text-center py-5 text-muted"
                      >
                        <div className="py-3">

                          <i className="fa-solid fa-box-open fa-3x text-secondary mb-3 d-block opacity-50"></i>

                          <h6 className="fw-bold text-dark">
                            {searchQuery
                              ? `No results for "${searchQuery}"`
                              : `No ${
                                  isLight
                                    ? "light"
                                    : "battery"
                                } production records found.`}
                          </h6>


                          <p className="text-muted fs-13 mb-3">
                            {searchQuery
                              ? "Try changing your search terms or clearing the filter."
                              : "New production records will appear here once generated."}
                          </p>


                          {searchQuery && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                setSearchQuery("")
                              }
                            >
                              Clear Search
                            </button>
                          )}

                        </div>
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

{/* ================= EDIT MODAL ================= */}
<Modal
  show={showEditModal}
  onHide={() => setShowEditModal(false)}
  centered
  size="lg"
>
  <Modal.Header closeButton>
    <Modal.Title className="fw-bold">

      <i className="fa-solid fa-pen-to-square me-2 text-primary"></i>

      Edit {isLight
        ? "Light Production"
        : "Battery Production"}

    </Modal.Title>
  </Modal.Header>


  <Modal.Body className="p-4">

    <Form>

      <Row className="g-3">

        {/* DATE */}
        <Col md={6}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              Date
            </Form.Label>

            <Form.Control
              type="date"
              name="date"
              value={editForm.date || ""}
              onChange={handleEditChange}
            />

          </Form.Group>
        </Col>


        {/* ITEM COUNT */}
        <Col md={6}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              Item Count
            </Form.Label>

            <Form.Control
              type="number"
              name="item_count"
              value={editForm.item_count || ""}
              onChange={handleEditChange}
            />

          </Form.Group>
        </Col>


        {/* TYPE / CHEMISTRY */}
        <Col md={6}>
          <Form.Group>

            <Form.Label className="fw-semibold">

              {isLight
                ? "Light Type"
                : "Chemistry"}

            </Form.Label>

            {isLight ? (

              <Form.Select
                name="type_or_chem"
                value={editForm.type_or_chem || ""}
                onChange={handleEditChange}
              >
                <option value="">
                  Select Light Type
                </option>

                <option value="SEMI">
                  Semi-Integrated
                </option>

                <option value="INBUILT">
                  All-In-One
                </option>

              </Form.Select>

            ) : (

              <Form.Control
                type="text"
                name="type_or_chem"
                value={editForm.type_or_chem || ""}
                onChange={handleEditChange}
                placeholder="Enter Chemistry"
              />

            )}

          </Form.Group>
        </Col>


        {/* WATTAGE / CAPACITY */}
        <Col md={6}>
          <Form.Group>

            <Form.Label className="fw-semibold">

              {isLight
                ? "Wattage"
                : "Capacity"}

            </Form.Label>

            <Form.Control
              type="text"
              name="spec_value"
              value={editForm.spec_value || ""}
              onChange={handleEditChange}
              placeholder={
                isLight
                  ? "Example: 30W"
                  : "Example: 12.8V 30Ah"
              }
            />

          </Form.Group>
        </Col>


        {/* YEAR */}
        <Col md={4}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              Generated Year
            </Form.Label>

            <Form.Control
              type="number"
              name="generated_year"
              value={editForm.generated_year || ""}
              onChange={handleEditChange}
            />

          </Form.Group>
        </Col>


        {/* PREFIX */}
        <Col md={4}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              Prefix
            </Form.Label>

            <Form.Control
              type="text"
              name="prefix"
              value={editForm.prefix || ""}
              onChange={handleEditChange}
              placeholder="Example: SL-"
            />

          </Form.Group>
        </Col>


        {/* VENDOR */}
        <Col md={4}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              Vendor
            </Form.Label>

            <Form.Control
              type="text"
              name="vendor_name"
              value={editForm.vendor_name || ""}
              disabled
            />

          </Form.Group>
        </Col>


        {/* PROJECT */}
        <Col md={6}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              Project
            </Form.Label>

            <Form.Control
              type="text"
              name="project"
              value={editForm.project || ""}
              onChange={handleEditChange}
            />

          </Form.Group>
        </Col>


        {/* STATE */}
        <Col md={6}>
          <Form.Group>

            <Form.Label className="fw-semibold">
              State
            </Form.Label>

            <Form.Control
              type="text"
              name="state"
              value={editForm.state || ""}
              onChange={handleEditChange}
            />

          </Form.Group>
        </Col>

      </Row>

    </Form>

  </Modal.Body>


  <Modal.Footer>

    <Button
      variant="light"
      onClick={() => setShowEditModal(false)}
    >
      Cancel
    </Button>


    <Button
      variant="primary"
      onClick={handleUpdateRecord}
    >
      <i className="fa-solid fa-floppy-disk me-2"></i>

      Update Record
    </Button>

  </Modal.Footer>

</Modal>
    </Fragment>
  );
};


export default ViewLightBatteryProduction;