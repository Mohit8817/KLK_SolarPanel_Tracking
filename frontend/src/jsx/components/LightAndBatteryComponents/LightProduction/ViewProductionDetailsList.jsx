import { Fragment, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Table, Badge, Button, Row, Col } from "react-bootstrap";

import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import CommonPagination from "../../Common/Pagination";
import TableExportActions from "../../Common/TableExportActions";
import PrefixCell from "../../Common/PrefixCell";
import { notifyError, notifySuccess } from "../../../utils/toast";

// ================= GENERATE SERIAL LIST (FRONTEND ONLY) =================
const generateSerials = (record) => {
    const count = Number(record?.item_count) || 0;
    if (!count) return [];

    const startingNo = record.starting_no;
    const startingUniqueNo = record.starting_unique_no;

    const startNoIsNumeric =
        startingNo !== undefined &&
        startingNo !== null &&
        startingNo !== "" &&
        !isNaN(Number(startingNo));

    let uniquePrefix = "";
    let uniquePadLength = 0;
    let uniqueStartNum = null;

    if (startingUniqueNo) {
        const match = String(startingUniqueNo).match(/^(.*?)(\d+)$/);
        if (match) {
            uniquePrefix = match[1];
            uniquePadLength = match[2].length;
            uniqueStartNum = parseInt(match[2], 10);
        }
    }

    const list = [];
    for (let i = 0; i < count; i++) {
        const serialNo = startNoIsNumeric
            ? Number(startingNo) + i
            : startingNo
                ? `${startingNo}-${i + 1}`
                : "-";

        let uniqueNo = "-";
        if (uniqueStartNum !== null) {
            uniqueNo = `${uniquePrefix}${String(uniqueStartNum + i).padStart(
                uniquePadLength,
                "0"
            )}`;
        } else if (startingUniqueNo) {
            uniqueNo = `${startingUniqueNo}-${i + 1}`;
        }

        list.push({
            srNo: i + 1,
            serialNo,
            uniqueNo,
            production: "Assigned",
            pDamage: "Safe",
            dispatch: "Pending",
            dDamage: "Safe",
            receive: "Pending",
            rDamage: "Safe",
        });
    }

    return list;
};

const StatusBadge = ({ value }) => {
    let bg = "warning";
    if (value === "Assigned" || value === "Safe" || value === "Dispatched" || value === "Received") {
        bg = "success";
    } else if (value === "Damaged" || value === "Failed") {
        bg = "danger";
    } else {
        bg = "warning";
    }

    return (
        <Badge
            bg={bg}
            className="py-2 px-2"
        >
            {value}
        </Badge>
    );
};

// ================= DETAIL SUMMARY CARD =================
const DetailItem = ({ label, value }) => (
    <div className="border rounded-3 p-3 h-100">
        <small className="text-muted d-block mb-1">{label}</small>
        <strong className="text-dark">{value || "-"}</strong>
    </div>
);

const RecordSummaryCard = ({ record, isLight, itemLabel }) => {
    const vendorName = record.vendor
        ? `${record.vendor.first_name || ""} ${record.vendor.last_name || ""}`.trim()
        : record.vendor_name || "Not Assigned";

    return (
        <Card className="klk-form-card mb-3 border-primary">
            <Card.Header className=" py-2 d-flex justify-content-between align-items-center">
                <strong>
                    <i className="fa-solid fa-circle-info me-2"></i>
                    {itemLabel} Production Details
                </strong>
                <Badge
                    bg="white"
                    text="dark"
                    className="py-2 px-3 border border-primary rounded-pill"
                >
                    {record.item_count || 0} {itemLabel}s
                </Badge>
            </Card.Header>

            <Card.Body>
                <Row className="g-3">
                    <Col md={2} sm={4} xs={6}>
                        <DetailItem
                            label="Date"
                            value={record.date ? new Date(record.date).toLocaleDateString() : "-"}
                        />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem label="Item Count" value={record.item_count} />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem
                            label="Category"
                            value={isLight ? "Street Light" : "Battery Pack"}
                        />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem
                            label={isLight ? "Light Type" : "Chemistry"}
                            value={
                                isLight
                                    ? record.light_type === "INBUILT"
                                        ? "All-In-One"
                                        : "Semi-Integrated"
                                    : record.chemistry
                            }
                        />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem
                            label={isLight ? "Wattage" : "Capacity"}
                            value={isLight ? record.wattage : record.capacity}
                        />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem label="Year" value={record.generated_year} />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem label="Prefix" value={record.prefix} />
                    </Col>

                    <Col md={4} sm={8} xs={12}>
                        <DetailItem label="Project" value={record.project} />
                    </Col>

                    <Col md={2} sm={4} xs={6}>
                        <DetailItem label="State" value={record.state} />
                    </Col>

                    <Col md={4} sm={8} xs={12}>
                        <DetailItem label="Vendor" value={vendorName} />
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

const ViewProductionDetailsList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const record = location.state?.record;
    const category = location.state?.category || "LIGHT";
    const isLight = category === "LIGHT";
    const itemLabel = isLight ? "Light" : "Battery";

    const items = useMemo(() => generateSerials(record), [record]);

    const SEARCH_KEYS = ["uniqueNo", "serialNo"];

    const {
        currentData,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        totalPages,
        startIndex,
    } = useSearch(items, SEARCH_KEYS, 10);

    const exportData = useMemo(
        () =>
            items.map((p) => ({
                sno: p.srNo,
                uniqueNo: p.uniqueNo,
                prefix: record?.prefix || "-",
                capacity: isLight ? record?.wattage : record?.capacity,
                category: isLight ? record?.light_type : record?.chemistry,
                production: p.production,
                pDamage: p.pDamage,
                dispatch: p.dispatch,
                dDamage: p.dDamage,
                receive: p.receive,
                rDamage: p.rDamage,
            })),
        [items, record, isLight]
    );

    const exportColumns = [
        { label: "S No", key: "sno" },
        { label: `${itemLabel} Unique No`, key: "uniqueNo" },
        { label: "Prefix", key: "prefix" },
        { label: isLight ? "Wattage" : "Capacity", key: "capacity" },
        { label: "Category", key: "category" },
        { label: "Production", key: "production" },
        { label: "P Damage", key: "pDamage" },
        { label: "Dispatch", key: "dispatch" },
        { label: "D Damage", key: "dDamage" },
        { label: "Receive", key: "receive" },
        { label: "R Damage", key: "rDamage" },
    ];

    const handleExportGuard = (exportFn) => {
        if (items.length === 0) {
            notifyError("No data available to export");
            return;
        }
        exportFn?.();
        notifySuccess("File exported successfully");
    };

    if (!record) {
        return (
            <Fragment>
                <PageHeader
                    title="List"
                    breadcrumbs={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Production", to: "/production/light-battery/list" },
                        { label: "List" },
                    ]}
                />
                <Card>
                    <Card.Body className="text-center py-5">
                        <i className="fa-solid fa-triangle-exclamation fa-2x text-warning mb-3 d-block"></i>
                        <h6>No production record selected</h6>
                        <p className="text-muted">
                            Please open the list from the production list page.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate("/production/light-battery/list")}
                        >
                            Back to Production List
                        </Button>
                    </Card.Body>
                </Card>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <PageHeader
                title={`${itemLabel} List`}
                subtitle={`${record.prefix || ""} • ${record.project || ""}`}
                breadcrumbs={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Production", to: "/production/light-battery/list" },
                    { label: `${itemLabel} List` },
                ]}
            />

            <RecordSummaryCard record={record} isLight={isLight} itemLabel={itemLabel} />

            <Card className="klk-list-card">
                <Card.Header>
                    <ListToolbar>
                        <Search
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={`Search by ${itemLabel.toLowerCase()} no`}
                        />
                        <TableExportActions
                            data={exportData}
                            columns={exportColumns}
                            fileName={`${itemLabel}_Production_List`}
                            onBeforeExport={handleExportGuard}
                        />
                    </ListToolbar>
                </Card.Header>

                <Card.Body>
                    <Table
                        responsive
                        className="table-hover align-middle"
                        style={{ minWidth: "1200px" }}
                    >
                        <thead>
                            <tr>
                                <th style={{ width: "65px" }}>S no.</th>
                                <th style={{ minWidth: "180px" }}>{itemLabel} Unique No</th>
                                <th style={{ width: "110px" }}>Prefix</th>
                                <th style={{ width: "110px" }}>
                                    {isLight ? "Wattage" : "Capacity"}
                                </th>
                                <th style={{ width: "130px" }}>Category</th>
                                <th style={{ width: "120px" }}>Production</th>
                                <th style={{ width: "110px" }}>P Damage</th>
                                <th style={{ width: "110px" }}>Dispatch</th>
                                <th style={{ width: "110px" }}>D Damage</th>
                                <th style={{ width: "110px" }}>Receive</th>
                                <th style={{ width: "110px" }}>R Damage</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((item, index) => (
                                    <tr key={item.uniqueNo + index}>
                                        <td><strong>{startIndex + index + 1}</strong></td>
                                        <td className="font-monospace fw-bold text-primary">
                                            {item.uniqueNo}
                                        </td>
                                        <td>
                                            <PrefixCell value={record.prefix} />
                                        </td>
                                        <td>{isLight ? record.wattage : record.capacity}</td>
                                        <td>
                                            <Badge bg={isLight ? "primary" : "info"} className="py-2 px-2">
                                                {isLight ? "Street Light" : "Battery Pack"}
                                            </Badge>
                                        </td>
                                        <td>
                                            <StatusBadge value={item.production} />
                                        </td>
                                        <td>
                                            <StatusBadge value={item.pDamage} />
                                        </td>
                                        <td>
                                            <StatusBadge value={item.dispatch} />
                                        </td>
                                        <td>
                                            <StatusBadge value={item.dDamage} />
                                        </td>
                                        <td>
                                            <StatusBadge value={item.receive} />
                                        </td>
                                        <td>
                                            <StatusBadge value={item.rDamage} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="text-center py-5 text-muted">
                                        {searchQuery
                                            ? `No results for "${searchQuery}"`
                                            : `No ${itemLabel.toLowerCase()} data available for this record.`}
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
                </Card.Body>
            </Card>
        </Fragment>
    );
};

export default ViewProductionDetailsList;