import { useState, useEffect } from "react";
import { Card, Col, Row, Table, Spinner } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import axios from "axios";
import { Link } from "react-router-dom";
import Search, { useSearch } from "../Common/Search";
import CommonPagination from "../Common/Pagination";

const ViewDispatchPanel = () => {

    /* ================= STATE ================= */

    const [dispatchList, setDispatchList] = useState([]);
    const [scannedMap, setScannedMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);



    /* ================= FETCH API ================= */

    const fetchDispatchPanels = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-all-dispatch-panel`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const list = res.data.data || [];
            setDispatchList(list);

            const scannedData = {};

            await Promise.all(
                list.map(async (item) => {
                    try {
                        const panelRes = await axios.get(
                            `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel-lot/${item._id}`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );
                        scannedData[item._id] = panelRes.data.total ?? 0;
                    } catch (err) {
                        console.error(`Failed to fetch panel lot for dispatch ${item._id}:`, err);
                        scannedData[item._id] = 0;
                    }
                })
            );

            setScannedMap({ ...scannedData });

        } catch (error) {
            console.error("Dispatch list API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDispatchPanels();
    }, []);

    /* ================= DELETE API ================= */

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to remove this panel from dispatch?");
        if (!confirmed) return;

        setDeletingId(id);
        try {
            const token = localStorage.getItem("token");

            await axios.get(
                `${import.meta.env.VITE_BACKEND_API_URL}dispatch/delete-dispatch-panel/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Remove deleted item from local state
            setDispatchList((prev) => prev.filter((item) => item._id !== id));

            // Clean up scannedMap entry
            setScannedMap((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });

        } catch (error) {
            console.error("Delete API Error:", error);
            alert("Failed to delete dispatch panel. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    /* ================= HELPERS ================= */

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /* ================= SEARCH + PAGINATION ================= */

    const SEARCH_KEYS = [
        "dispatch_id",
        "truck_no",
        "challan_no",
        "driver_name",
        "driver_no",
        "state",
    ];

    const {
        currentData,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        totalPages,
        startIndex,
    } = useSearch(dispatchList, SEARCH_KEYS, 100);

    /* ================= EXPORT ================= */

    const exportData = dispatchList.map((item, index) => {
        const scanned   = scannedMap[item._id] ?? 0;
        const total     = item.dispatch_panel_count ?? 0;
        const remaining = Math.max(0, total - scanned);

        return {
            sno          : index + 1,
            dispatchId   : item.dispatch_id,
            truckNo      : item.truck_no,
            challanNo    : item.challan_no,
            driver       : `${item.driver_name} (${item.driver_no})`,
            state        : item.state,
            date         : formatDate(item.createdAt),
            totalPanels  : total,
            scanned      : scanned,
            remaining    : remaining,
        };
    });

    const exportColumns = [
        { label: "S No",          key: "sno"         },
        { label: "Dispatch ID",   key: "dispatchId"  },
        { label: "Truck No",      key: "truckNo"     },
        { label: "Challan No",    key: "challanNo"   },
        { label: "Driver",        key: "driver"      },
        { label: "State",         key: "state"       },
        { label: "Date",          key: "date"        },
        { label: "Total Panels",  key: "totalPanels" },
        { label: "Scanned",       key: "scanned"     },
        { label: "Remaining",     key: "remaining"   },
    ];

    /* ================= UI ================= */

    return (
        <Col lg={12}>
            <Card>

                <Card.Header as={Row} className="align-items-center g-2">
                    <Col lg={4}>
                        <Card.Title className="mb-0">Dispatch Panel List</Card.Title>
                    </Col>
                    <Col lg={8} className="d-flex justify-content-end align-items-center gap-2">
                        <Search
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by dispatch ID, truck, driver, state..."
                        />
                        <TableExportActions
                            data={exportData}
                            columns={exportColumns}
                            fileName="Dispatch_Panel_Report"
                        />
                    </Col>
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <span className="text-muted">Loading dispatch records...</span>
                        </div>
                    ) : (
                        <>
                            <Table responsive className="table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>S No.</th>
                                        <th>Dispatch ID</th>
                                        <th>Truck No</th>
                                        <th>Challan No</th>
                                        <th>Driver</th>
                                        <th>State</th>
                                        <th>Date</th>
                                        <th>Panel Count</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="text-dark">
                                    {currentData.length > 0 ? (
                                        currentData.map((item, index) => {

                                            const scanned   = scannedMap[item._id] ?? 0;
                                            const total     = item.dispatch_panel_count ?? 0;
                                            const remaining = Math.max(0, total - scanned);

                                            return (
                                                <tr key={item._id}>

                                                    <td><strong>{startIndex + index + 1}</strong></td>

                                                    <td>{item.dispatch_id}</td>

                                                    <td>{item.truck_no}</td>

                                                    <td>{item.challan_no}</td>

                                                    <td>
                                                        <strong>{item.driver_name}</strong>
                                                        <br />
                                                        <small className="text-muted">{item.driver_no}</small>
                                                    </td>

                                                    <td>{item.state || "-"}</td>

                                                    <td>
                                                        <small>{formatDate(item.createdAt)}</small>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex flex-column gap-1">
                                                            <span>
                                                                <strong>Total: </strong>{total}
                                                            </span>
                                                            <small className="text-success fw-semibold">
                                                                Scanned: {scanned}
                                                            </small>
                                                            <small className="text-danger fw-semibold">
                                                                Remaining: {remaining}
                                                            </small>
                                                        </div>
                                                    </td>

                                                    <td className="text-center">
                                                        <div className="d-flex gap-1 justify-content-center">

                                                            <Link
                                                                to={`/view-dispatch-panels/${item._id}`}
                                                                className="btn btn-info btn-xs sharp"
                                                                title="View Panels"
                                                            >
                                                                <i className="fa fa-eye" />
                                                            </Link>

                                                            <Link
                                                                to={`/dispatch/panel/update/${item._id}`}
                                                                className="btn btn-warning btn-xs sharp"
                                                                title="Edit"
                                                            >
                                                                <i className="fa fa-pen" />
                                                            </Link>

                                                            {/* UPDATED DELETE BUTTON */}
                                                            <button
                                                                className="btn btn-danger btn-xs sharp"
                                                                title="Delete"
                                                                onClick={() => handleDelete(item._id)}
                                                                disabled={deletingId === item._id}
                                                            >
                                                                {deletingId === item._id
                                                                    ? <Spinner animation="border" size="sm" />
                                                                    : <i className="fa fa-trash" />
                                                                }
                                                            </button>

                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted py-4">
                                                {searchQuery
                                                    ? `No results for "${searchQuery}"`
                                                    : "No dispatch records found"}
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
        </Col>
    );
};

export default ViewDispatchPanel;