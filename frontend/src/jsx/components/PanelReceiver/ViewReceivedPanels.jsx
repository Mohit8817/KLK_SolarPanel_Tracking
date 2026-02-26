import { useEffect, useState } from "react";
import { Card, Col, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewDispatchPanels = () => {
  const { id } = useParams();
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
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/recieve-panel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("FULL RESPONSE:", res.data);

      // 🔥 Smart Data Extraction
      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data.data?.panels)) {
        data = res.data.data.panels;
      } else if (Array.isArray(res.data.panels)) {
        data = res.data.panels;
      }

      setPanelList(data);

    } catch (err) {
      console.error("Dispatch Fetch Error:", err);
      setError("Failed to fetch dispatch panels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <Card.Title>Receive Panel Details</Card.Title>
          <div><strong>Receive ID:</strong> {id}</div>
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
                  <th>Panel Type</th>
                  <th>Dispatch Status</th>
                  <th>Recieved Status</th>
                  <th>Damage Status</th>
                </tr>
              </thead>

              <tbody>
                {panelList && panelList.length > 0 ? (
                  panelList.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{index + 1}</td>
                      <td>{item.panel_unique_no || "-"}</td>
                      <td>{item.panel_no || "-"}</td>
                      <td>{item.panel_capacity || "-"}</td>

                      <td>
                        {item.dispatch_panel_type === 1
                          ? "DCR"
                          : item.dispatch_panel_type === 2
                          ? "NON DCR"
                          : "-"}
                      </td>

                      <td>
                        {item.dispatch_status === 1 ? (
                          <Badge bg="success">Dispatch</Badge>
                        ) : (
                          <Badge bg="warning">Pending</Badge>
                        )}
                      </td>

                      <td>
                        {item.collect_status === 1 ? (
                          <Badge bg="success">Recieved</Badge>
                        ) : (
                          <Badge bg="warning">Pending</Badge>
                        )}
                      </td>

                      <td>
                        {item.collect_damage_status === 1 ? (
                          <Badge bg="danger">Damaged</Badge>
                        ) : (
                          <Badge bg="success">Safe</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No panels found
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

export default ViewDispatchPanels;