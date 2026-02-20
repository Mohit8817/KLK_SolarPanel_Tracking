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
    if (id) fetchPanels();
  }, [id]);

  const fetchPanels = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}dispatch/fetch-dispatch-panel-lot/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPanelList(res?.data?.data || []);

    } catch (err) {
      console.log("Dispatch Fetch Error:", err);
      setError("Failed to fetch dispatch panels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col lg={12}>
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <Card.Title>Dispatch Panel Details</Card.Title>
          <div><strong>Dispatch ID:</strong> {id}</div>
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
                  <th>Damage Status</th>
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
                       <td>
                        {item.dispatch_panel_type === 1
                          ? "DCR"
                          : item.dispatch_panel_type === 2
                          ? "NON DCR"
                          : "-"}
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
                    <td colSpan="6" className="text-center">
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
