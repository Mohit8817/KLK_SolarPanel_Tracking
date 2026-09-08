import { useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import BoxDetailsModal from "./BoxDetailsModal";

const MOCK_BOXES = [
  { id: 1, boxNo: "BOX-2026-00089", totalUnits: 20, lights: 10, batteries: 10, status: "READY_FOR_DISPATCH", date: "2026-09-07" },
  { id: 2, boxNo: "BOX-2026-00090", totalUnits: 20, lights: 20, batteries: 0, status: "READY_FOR_DISPATCH", date: "2026-09-07" },
  { id: 3, boxNo: "BOX-2026-00091", totalUnits: 18, lights: 8, batteries: 10, status: "DISPATCHED", date: "2026-09-06" },
];

const ViewBoxList = () => {
  const [boxes] = useState(MOCK_BOXES);
  const [selectedBox, setSelectedBox] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenDetails = (box) => {
    setSelectedBox(box);
    setShowModal(true);
  };

  return (
    <div className="view-box-list">
      <PageHeader
        title="Sealed Boxes Directory"
        subtitle="Inventory of packed boxes (Max 20 units) ready for Truck Loading & Dispatch"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Packaging" },
          { label: "Sealed Boxes List" },
        ]}
        action={
          <Link to="/light/box/packaging" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> Open Packaging Console
          </Link>
        }
      />

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Box QR / Number</th>
                  <th>Total Units</th>
                  <th>Lights Count</th>
                  <th>Batteries Count</th>
                  <th>Status</th>
                  <th>Pack Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {boxes.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold font-monospace text-primary">{item.boxNo}</td>
                    <td>
                      <Badge bg="dark" className="fs-13">{item.totalUnits} / 20 Units</Badge>
                    </td>
                    <td>{item.lights} pcs</td>
                    <td>{item.batteries} pcs</td>
                    <td>
                      <Badge bg={item.status === "DISPATCHED" ? "secondary" : "success"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.date}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleOpenDetails(item)}
                      >
                        <i className="fa-solid fa-eye me-1"></i> View Items
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        <i className="fa-solid fa-print"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <BoxDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        box={selectedBox}
      />
    </div>
  );
};

export default ViewBoxList;
