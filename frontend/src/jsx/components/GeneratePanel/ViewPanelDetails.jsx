import { useEffect, useState } from "react";
import { Card, Col, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewPanelDetails = () => {
  const { id } = useParams(); // panel_lot_id from URL
  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (id) {
      fetchPanels();
    }
  }, [id]);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}panels/allpanels/lot/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API RESPONSE:", res.data);

      const data = res?.data?.data || [];
      setPanelList(Array.isArray(data) ? data : []);
    } catch (err) {
  console.log("FULL ERROR:", err);
  console.log("ERROR RESPONSE:", err.response);
  console.log("ERROR DATA:", err.response?.data);
  setError(err.response?.data?.message || "Failed to fetch panel details");
}finally {
      setLoading(false);
    }
  };

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">
            Panel Lot Details
          </Card.Title>

          <div>
            <strong>Lot ID:</strong> {id}
          </div>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <Table responsive className="table-hover align-middle">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Panel Unique No</th>
                  <th>Panel No</th>
                  <th>Capacity</th>
                  <th>State</th>
                  <th>Category</th>
                  <th>Production</th>
                  <th>Dispatch</th>
                  <th>Damage</th>
                </tr>
              </thead>

              <tbody>
                {panelList.length > 0 ? (
                  panelList.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.panel_unique_no}</td>
                      <td>{item.panel_no}</td>
                      <td>{item.panel_capacity}</td>
                      <td>{item.state || "-"}</td>

                      <td>
                        {item.panel_category === 1 ? (
                          <Badge bg="success">DCR</Badge>
                        ) : item.panel_category === 2 ? (
                          <Badge bg="secondary">NON DCR</Badge>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        {item.production_status === 1 ? (
                          <Badge bg="success">Assigned</Badge>
                        ) : (
                          <Badge bg="warning">Pending</Badge>
                        )}
                      </td>

                      <td>
                        {item.dispatch_status === 1 ? (
                          <Badge bg="success">Dispatched</Badge>
                        ) : (
                          <Badge bg="warning">Pending</Badge>
                        )}
                      </td>

                      <td>
                        {item.damage_status === 1 ? (
                          <Badge bg="danger">Damaged</Badge>
                        ) : (
                          <Badge bg="success">Safe</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ViewPanelDetails;
