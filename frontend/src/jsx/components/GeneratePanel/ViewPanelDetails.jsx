import { useEffect, useState } from "react";
import { Card, Col, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getPanelDetailsByLot } from "./GeneratepanelApis";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";

const ViewPanelDetails = () => {
  const { id } = useParams();
  const [panelList, setPanelList] = useState([]);
  const [ setLoading] = useState(true);

  // PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      const res = await getPanelDetailsByLot(id);
      setPanelList(res?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // PAGINATION LOGIC
  const totalPages = Math.ceil(panelList.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = panelList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // EXPORT DATA
  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    uniqueNo: item.panel_unique_no,
    panelNo: item.panel_no,
    capacity: item.panel_capacity,
    category:
      item.panel_category === 1
        ? "DCR"
        : item.panel_category === 2
        ? "NON DCR"
        : "-",
    production:
      item.production_status === 1 ? "Assigned" : "Pending",
    dispatch:
      item.dispatch_status === 1 ? "Dispatched" : "Pending",
    damage:
      item.damage_status === 1 ? "Damaged" : "Safe",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel Unique No", key: "uniqueNo" },
    { label: "Panel No", key: "panelNo" },
    { label: "Capacity", key: "capacity" },
    { label: "Category", key: "category" },
    { label: "Production", key: "production" },
    { label: "Dispatch", key: "dispatch" },
    { label: "Damage", key: "damage" },
  ];

  return (
    <Col lg={12}>
      <Card>

        {/* HEADER */}
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          
          <div>
            <Card.Title className="mb-0">
              Panel Details
            </Card.Title>
            <div>
              <strong>Lot ID:</strong> {id}
            </div>
          </div>

          <TableExportActions
            data={exportData}
            columns={exportColumns}
            fileName="Panel_Details_Report"
          />

        </Card.Header>

        <Card.Body>
            <>
              {/* RESPONSIVE TABLE */}
              <Table responsive className="table-hover align-middle">
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Panel Unique No</th>
                    <th>Panel No</th>
                    <th>Capacity</th>
                    <th>Category</th>
                    <th>Production</th>
                    <th>Dispatch</th>
                    <th>Damage</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id}>
                        <td>
                          <strong>
                            {startIndex + index + 1}
                          </strong>
                        </td>

                        <td>{item.panel_unique_no}</td>
                        <td>{item.panel_no}</td>
                        <td>{item.panel_capacity}</td>

                        {/* Category */}
                        <td>
                          {item.panel_category === 1 ? (
                            <Badge bg="success">DCR</Badge>
                          ) : item.panel_category === 2 ? (
                            <Badge bg="secondary">NON DCR</Badge>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Production */}
                        <td>
                          {item.production_status === 1 ? (
                            <Badge bg="success">Assigned</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>

                        {/* Dispatch */}
                        <td>
                          {item.dispatch_status === 1 ? (
                            <Badge bg="success">Dispatched</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>

                        {/* Damage */}
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
                      <td colSpan="8" className="text-center text-muted">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* PAGINATION */}
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

export default ViewPanelDetails;