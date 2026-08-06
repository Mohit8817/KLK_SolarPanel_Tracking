import { useState, useEffect } from "react";
import { Card, Table } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";
import { ViewAction, EditAction, DeleteAction } from "../Common/ActionButtons";
import { PageLoader } from "../Common/LoadingState";
import { notifyError } from "../../utils/toast";
import axios from "axios";
import { Link } from "react-router-dom";
import Search, { useSearch } from "../Common/Search";
import CommonPagination from "../Common/Pagination";
import BreakdownChips from "../Common/BreakdownChips";

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
            notifyError("Failed to delete dispatch. Please try again.");
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
        "prefix",
        "capacities",
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
            prefix       : item.prefix,
            companies    : (item.prefixBreakdown || [])
              .map(({ prefix, count }) => `${prefix} (${count})`)
              .join(", "),
            capacities   : (item.capacityBreakdown || [])
              .map(({ capacity, count }) => `${capacity} W (${count})`)
              .join(", "),
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
        { label: "Companies",     key: "companies"   },
        { label: "Capacities",    key: "capacities"  },
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
        <>
            <PageHeader
                title="Dispatch List"
                breadcrumbs={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Dispatch" },
                ]}
                action={
                    <Link to="/dispatch/create" className="btn btn-primary btn-sm">
                        <i className="fa fa-plus me-1" /> New Dispatch
                    </Link>
                }
            />
            <Card className="klk-list-card">
                <Card.Header>
                    <ListToolbar>
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
                    </ListToolbar>
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <PageLoader message="Loading dispatch records..." />
                    ) : (
                        <>
                            <Table responsive className="table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>S No.</th>
                                        <th>Dispatch ID</th>
                                        <th>Company</th>
                                        <th>Capacities</th>
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

                                                    <td>
                                                      <BreakdownChips
                                                        items={item.prefixBreakdown || []}
                                                        labelKey="prefix"
                                                      />
                                                    </td>

                                                    <td>
                                                      <BreakdownChips
                                                        items={item.capacityBreakdown || []}
                                                        labelKey="capacity"
                                                        suffix=" W"
                                                      />
                                                    </td>

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
                                                        <div className="klk-actions">
                                                            <ViewAction to={`/view-dispatch-panels/${item._id}`} title="View panels" />
                                                            <EditAction to={`/dispatch/panel/update/${item._id}`} title="Edit dispatch" />
                                                            <DeleteAction
                                                                title="Delete"
                                                                onClick={() => handleDelete(item._id)}
                                                                disabled={deletingId === item._id}
                                                            />
                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="text-center text-muted py-4">
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
        </>
    );
};

export default ViewDispatchPanel;