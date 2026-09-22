import { useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import ViewDispatchBoxes from "./ViewDispatchBoxes";

const MOCK_DISPATCHES = [
  { id: 1, challanNo: "DSP-2409-001", truckNo: "RJ 14 GA 5432", state: "Rajasthan", vendor: "Jaipur Central Depot", boxesCount: 50, totalUnits: 1000, status: "IN_TRANSIT", date: "2026-09-07" },
  { id: 2, challanNo: "DSP-2409-002", truckNo: "UP 32 BK 9811", state: "Uttar Pradesh", vendor: "Lucknow Regional Hub", boxesCount: 40, totalUnits: 800, status: "DELIVERED", date: "2026-09-05" },
];

const ViewDispatchList = () => {
  const [list] = useState(MOCK_DISPATCHES);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenBoxes = (dsp) => {
    setSelectedDispatch(dsp);
    setShowModal(true);
  };

  return (
    <div className="view-dispatch-list">
      <PageHeader
        title="Dispatch Shipments Directory"
        subtitle="Track trucks and shipments containing sealed boxes"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Dispatch" },
          { label: "Dispatch List" },
        ]}
        action={
          <Link to="/light/dispatch/create" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> New Dispatch
          </Link>
        }
      />

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Challan No</th>
                  <th>Truck Number</th>
                  <th>Destination</th>
                  <th>Vendor / Warehouse</th>
                  <th>Total Boxes</th>
                  <th>Total Units</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold font-monospace text-primary">{item.challanNo}</td>
                    <td>{item.truckNo}</td>
                    <td>{item.state}</td>
                    <td>{item.vendor}</td>
                    <td>
                      <Badge bg="dark">{item.boxesCount} Boxes</Badge>
                    </td>
                    <td>
                      <strong>{item.totalUnits} Units</strong>
                    </td>
                    <td>
                      <Badge bg={item.status === "DELIVERED" ? "success" : "warning"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.date}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleOpenBoxes(item)}
                      >
                        <i className="fa-solid fa-boxes-stacked me-1"></i> View Boxes
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        <i className="fa-solid fa-print"></i> Challan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <ViewDispatchBoxes
        show={showModal}
        onHide={() => setShowModal(false)}
        dispatch={selectedDispatch}
      />
    </div>
  );
};

export default ViewDispatchList;
