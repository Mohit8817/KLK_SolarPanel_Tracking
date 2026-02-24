import { useState, useEffect } from "react";
import { Card, Col, Table } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import ScannedPanelsModal from "./ScannedPanelsModal";
import axios from "axios";
import { Link } from "react-router-dom";


const ViewDispatchPanel = () => {

    /* ================= STATE ================= */

    const [dispatchList, setDispatchList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDispatch, setSelectedDispatch] = useState(null);



    const closeModal = () => {
        setShowModal(false);
        setSelectedDispatch(null);
    };

    /* ================= FETCH API ================= */

    const fetchDispatchPanels = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-all-dispatch-panel`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Dispatch API:", res.data);

            setDispatchList(res.data.data || res.data || []);

        } catch (error) {
            console.log("Dispatch API Error:", error);
        }
    };

    useEffect(() => {
        fetchDispatchPanels();
    }, []);

    /* ================= EXPORT ================= */

    const exportData = dispatchList.map((item, index) => ({
        sno: index + 1,
        date: item.date,
        state: item.state,
        truckNo: item.truckNo,
        driver: `${item.driverName} (${item.driverNo})`,
        dispatchType: item.dispatchType,
        scannedPanels:
            item.dispatchType === "DCR"
                ? item.dcrScannedPanels?.length || 0
                : item.nonDcrScannedPanels?.length || 0,
        status: item.isCompleted,
    }));

    const exportColumns = [
        { label: "S No", key: "sno" },
        { label: "Date", key: "date" },
        { label: "State", key: "state" },
        { label: "Truck No", key: "truckNo" },
        { label: "Driver", key: "driver" },
        { label: "Dispatch Type", key: "dispatchType" },
        { label: "Scanned Panels", key: "scannedPanels" },
        { label: "Status", key: "status" },
    ];

    /* ================= UI ================= */

    return (
        <Col lg={12}>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                    <Card.Title className="mb-0">
                        Dispatch Panel List
                    </Card.Title>

                    <TableExportActions
                        data={exportData}
                        columns={exportColumns}
                        fileName="Dispatch_Panel_Report"
                    />
                </Card.Header>

                <Card.Body>
                    <Table responsive className="table-hover align-middle">
                        <thead>
                            <tr>
                                <th>S No.</th>
                                <th>Dispatch ID</th>
                                <th>Truck No</th>
                                <th>Challan No</th>
                                <th>Driver</th>
                                <th>Panel Count</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dispatchList.length > 0 ? (
                                dispatchList.map((item, index) => (
                                    <tr key={item._id}>
                                        <td><strong>{index + 1}</strong></td>

                                        <td>{item.dispatch_id}</td>

                                        <td>{item.truck_no}</td>

                                        <td>{item.challan_no}</td>

                                        <td>
                                            <strong>{item.driver_name}</strong>
                                            <br />
                                            <small>{item.driver_no}</small>
                                        </td>

                                        <td>
                                            <strong>{item.dispatch_panel_count}</strong>
                                        </td>

                                           <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">

                          
                                            <Link
                                                to={`/view-dispatch-panels/${item._id}`}
                                                className="btn btn-info btn-xs sharp"
                                            >
                                                <i className="fa fa-eye" />
                                            </Link>

                                            <button className="btn btn-danger btn-xs sharp">
                                                <i className="fa fa-trash" />
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted">
                                        No dispatch records found
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </Table>
                </Card.Body>
            </Card>

            <ScannedPanelsModal
                show={showModal}
                onHide={closeModal}
                dispatch={selectedDispatch}
            />
        </Col>
    );
};

export default ViewDispatchPanel;
