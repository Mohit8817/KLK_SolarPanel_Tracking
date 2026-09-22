import { useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";

const MOCK_RECEIVED = [
  { id: 1, boxNo: "BOX-2026-00089", units: 20, lights: 10, batteries: 10, warehouse: "Jaipur Depot", condition: "SAFE", date: "2026-09-07" },
  { id: 2, boxNo: "BOX-2026-00085", units: 20, lights: 20, batteries: 0, warehouse: "Jaipur Depot", condition: "DAMAGED (2 Units)", date: "2026-09-06" },
];

const ViewReceivedList = () => {
  const [list] = useState(MOCK_RECEIVED);

  return (
    <div className="view-received-list">
      <PageHeader
        title="Received Warehouse Inventory"
        subtitle="Track stock of received boxes and unboxed products in central warehouse"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Light Receiving" },
          { label: "Received Box List" },
        ]}
        action={
          <Link to="/light/receive/boxes" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> Scan Inward Boxes
          </Link>
        }
      />

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Box QR Number</th>
                  <th>Warehouse / Hub</th>
                  <th>Total Units</th>
                  <th>Product Mix</th>
                  <th>Receipt Condition</th>
                  <th>Received Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold font-monospace text-primary">{item.boxNo}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.units} Units</td>
                    <td>{item.lights}L + {item.batteries}B</td>
                    <td>
                      <Badge bg={item.condition.includes("SAFE") ? "success" : "danger"}>
                        {item.condition}
                      </Badge>
                    </td>
                    <td>{item.date}</td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm">
                        <i className="fa-solid fa-eye me-1"></i> View Items
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewReceivedList;
