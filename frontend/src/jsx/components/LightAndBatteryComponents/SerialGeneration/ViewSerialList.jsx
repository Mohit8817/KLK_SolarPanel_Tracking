import { useEffect, useMemo, useState } from "react";
import { Card, Table, Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import Search, { useSearch } from "../../Common/Search";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import { ViewAction, DeleteAction } from "../../Common/ActionButtons";
import PrefixCell from "../../Common/PrefixCell";
import { PageLoader } from "../../Common/LoadingState";

const INITIAL_MOCK_LOTS = [
  {
    _id: "lot-1",
    date: "2026-09-07",
    category: "LIGHT",
    light_type: "Semi-Integrated",
    prefix: "SL",
    model: "20W LED Street Light",
    total_quantity: 250,
    starting_no: 1,
    ending_no: 250,
    serial_range: "SL000001 - SL000250",
    alot_state: "Rajasthan",
    alot_project: "Jaipur Smart Highway",
    status: "IN_PRODUCTION",
  },
  {
    _id: "lot-2",
    date: "2026-09-07",
    category: "BATTERY",
    light_type: "LiFePO4 Pack",
    prefix: "BAT",
    model: "12.8V 30Ah Battery",
    total_quantity: 250,
    starting_no: 1,
    ending_no: 250,
    serial_range: "BAT000001 - BAT000250",
    alot_state: "Rajasthan",
    alot_project: "Jaipur Smart Highway",
    status: "IN_PRODUCTION",
  },
  {
    _id: "lot-3",
    date: "2026-09-06",
    category: "LIGHT",
    light_type: "All-In-One",
    prefix: "AIO",
    model: "40W Solar Street Light",
    total_quantity: 200,
    starting_no: 1,
    ending_no: 200,
    serial_range: "AIO000001 - AIO000200",
    alot_state: "Uttar Pradesh",
    alot_project: "Lucknow Rural Solar",
    status: "COMPLETED",
  },
  {
    _id: "lot-4",
    date: "2026-09-05",
    category: "BATTERY",
    light_type: "LiFePO4 Pack",
    prefix: "BAT",
    model: "12.8V 42Ah Battery",
    total_quantity: 150,
    starting_no: 251,
    ending_no: 400,
    serial_range: "BAT000251 - BAT000400",
    alot_state: "Madhya Pradesh",
    alot_project: "Bhopal Street Lighting",
    status: "COMPLETED",
  },
];

const ViewSerialList = () => {
  const [serialList, setSerialList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [_selectedLot] = useState(null);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      // Fallback to mock data until backend endpoint is linked
      setTimeout(() => {
        setSerialList(INITIAL_MOCK_LOTS);
        setLoading(false);
      }, 400);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this serial lot?")) return;
    try {
      setSerialList((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log(error);
    }
  };




  // ── FILTER BY CATEGORY ──────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    if (filterType === "ALL") return serialList;
    return serialList.filter((item) => item.category === filterType);
  }, [serialList, filterType]);

  // ── SEARCH + PAGINATION (Matching ViewGeneratePanel pattern) ────────────
  const SEARCH_KEYS = [
    "date",
    "prefix",
    "category",
    "model",
    "light_type",
    "total_quantity",
    "serial_range",
    "alot_state",
    "alot_project",
    "status",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(filteredList, SEARCH_KEYS, 100);



  // ── EXPORT CONFIG ────────────────────────────────────────────────────────
  const exportData = filteredList.map((item, index) => ({
    sno: index + 1,
    date: item.date,
    category: item.category === "LIGHT" ? "Street Light" : "Battery Pack",
    prefix: item.prefix,
    model: item.model,
    type: item.light_type || "N/A",
    totalQuantity: item.total_quantity,
    serialRange: item.serial_range,
    state: item.alot_state,
    project: item.alot_project,
    status: item.status,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Category", key: "category" },
    { label: "Prefix", key: "prefix" },
    { label: "Model", key: "model" },
    { label: "Type / Specs", key: "type" },
    { label: "Total Qty", key: "totalQuantity" },
    { label: "Serial Range", key: "serialRange" },
    { label: "State", key: "state" },
    { label: "Project", key: "project" },
    { label: "Status", key: "status" },
  ];

  return (
    <>
      <PageHeader
        title="Generated Light & Battery Lots"
        subtitle="Manage and track serialized production lots for Solar Street Lights & Battery Packs"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Serial Generation" },
          { label: "View Serial List" },
        ]}
        action={
          <Link to="/light/serial/generate" className="btn btn-primary btn-sm">
            <i className="fa fa-plus me-1" /> Generate Serial
          </Link>
        }
      />

      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
            {/* LEFT SIDE - CATEGORY FILTER DROPDOWN */}
            <div className="d-flex align-items-center">
              <Form.Select
                size="sm"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select-sm"
                style={{
                  minWidth: "180px",
                  height: "36px",
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="LIGHT">Solar Street Lights</option>
                <option value="BATTERY">Battery Packs</option>
              </Form.Select>
            </div>

            {/* RIGHT SIDE - SEARCH + EXPORT ACTIONS */}
            <div className="d-flex align-items-center gap-3 ms-auto flex-nowrap">
              <div style={{ width: "260px", minWidth: "220px" }}>
                <Search
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search prefix, model, state..."
                />
              </div>

              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{ minWidth: "145px", whiteSpace: "nowrap" }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName="Generated_Light_Battery_Report"
                />
              </div>
            </div>
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <PageLoader message="Loading serial lots..." />
          ) : (
            <>
              <Table responsive className="table-hover align-middle" style={{ minWidth: "1150px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "65px" }}>S no.</th>
                    <th style={{ width: "110px" }}>Date</th>
                    <th style={{ width: "135px" }}>Category</th>
                    <th style={{ width: "80px" }}>Prefix</th>
                    <th style={{ minWidth: "160px" }}>Model & Specs</th>
                    <th style={{ width: "95px" }}>Total Qty</th>
                    <th style={{ minWidth: "175px" }}>Serial Number Range</th>
                    <th style={{ width: "130px" }}>Status</th>
                    <th style={{ width: "110px" }}>State</th>
                    <th style={{ minWidth: "150px" }}>Project</th>
                    <th className="text-center" style={{ width: "120px", minWidth: "120px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td>
                          <strong>{startIndex + index + 1}</strong>
                        </td>
                        <td className="text-nowrap">{item.date}</td>
                        <td>
                          {item.category === "LIGHT" ? (
                            <Badge bg="primary" className="py-2 px-2 d-inline-flex align-items-center gap-1">
                              <i className="fa-solid fa-lightbulb"></i> Street Light
                            </Badge>
                          ) : (
                            <Badge bg="info" className="py-2 px-2 d-inline-flex align-items-center gap-1">
                              <i className="fa-solid fa-car-battery"></i> Battery Pack
                            </Badge>
                          )}
                        </td>
                        <td>
                          <PrefixCell value={item.prefix} />
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.model}</div>
                          {item.light_type && (
                            <div className="text-muted fs-11">{item.light_type}</div>
                          )}
                        </td>
                        <td>
                          <span className="text-primary fw-bold fs-14">
                            {Number(item.total_quantity).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="badge text-dark font-monospace fs-13 px-2 py-1">
                            {item.serial_range}
                          </span>
                        </td>
                        <td>
                          <Badge
                            bg={
                              item.status === "COMPLETED"
                                ? "success"
                                : item.status === "IN_PRODUCTION"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-uppercase px-2 py-1"
                          >
                            {item.status === "IN_PRODUCTION" ? "In Production" : item.status}
                          </Badge>
                        </td>
                        <td>{item.alot_state}</td>
                        <td className="text-truncate" style={{ maxWidth: "160px" }} title={item.alot_project}>
                          {item.alot_project}
                        </td>
                        <td className="text-center" style={{ width: "120px", minWidth: "120px" }}>
                          <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">
                           <ViewAction to={`/light/serial/generate-details/${item._id}`} title="View Lot Details" />
                     
                            <DeleteAction onClick={() => handleDelete(item._id)} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center py-5 text-muted">
                        <div className="py-3">
                          <i className="fa-solid fa-boxes-stacked fa-3x text-secondary mb-3 d-block opacity-50"></i>
                          <h6 className="fw-bold text-dark">
                            {searchQuery ? `No results for "${searchQuery}"` : "No serial lots found"}
                          </h6>
                          <p className="text-muted fs-13 mb-3">
                            {searchQuery
                              ? "Try changing your search terms or clearing the category filter."
                              : "Get started by generating your first serial lot."}
                          </p>
                          {searchQuery && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setSearchQuery("")}
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

 
     
    </>
  );
};

export default ViewSerialList;