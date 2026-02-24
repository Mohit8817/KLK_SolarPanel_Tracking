import { useEffect, useState } from "react";
import { Card, Col, Table } from "react-bootstrap";

import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

import {
    getAllManufactureDamage,
    deleteManufactureDamage,
} from "./ManufactureDamageApis";

const ViewManufactureDamage = () => {

    const [data, setData] = useState([]);
    const [setLoading] = useState(true);

    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await getAllManufactureDamage();
        setData(res.data.data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        await deleteManufactureDamage(id);
        fetchData();
    };

    const totalPages = Math.ceil(data.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentData = data.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const exportData = data.map((item, index) => ({
        sno: index + 1,
        panelNo: item.panel_no,
        type: item.panel_type,
        damage: item.damage_type,
        remarks: item.remarks,
        date: item.date,
    }));

    const exportColumns = [
        { label: "S No", key: "sno" },
        { label: "Panel No", key: "panelNo" },
        { label: "Type", key: "type" },
        { label: "Damage", key: "damage" },
        { label: "Remarks", key: "remarks" },
        { label: "Date", key: "date" },
    ];

    return (
        <Col lg={12}>
            <Card>
                {/* HEADER */}
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <Card.Title className="mb-0">
                        Manufacture Damage Panels
                    </Card.Title>

                    <TableExportActions
                        data={exportData}
                        columns={exportColumns}
                        fileName="Manufacture_Damage"
                    />
                </Card.Header>

                <Card.Body>

                    <>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>S No</th>
                                    <th>Panel No</th>
                                    <th>Damage</th>
                                    <th>Remarks</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentData.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{item.panel_no}</td>
                                        <td>{item.damage_type}</td>
                                        <td>{item.remarks}</td>
                                        <td>{item.date}</td>

                                        <td>
                                             <button
                            className="btn btn-danger btn-xs sharp"
                            onClick={() => handleDelete(item._id)}
                          >
                            <i className="fa fa-trash" />
                          </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <CommonPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />

                    </>

                </Card.Body>
            </Card>
        </Col>
    );
};

export default ViewManufactureDamage;