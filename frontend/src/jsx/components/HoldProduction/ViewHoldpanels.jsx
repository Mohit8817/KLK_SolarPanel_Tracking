import { Card, Col, Table, Badge } from "react-bootstrap";
import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";

const ViewHoldPanels = () => {
  const panelList = [
    {
      _id: 1,
      panel_unique_no: "PNL20260001",
      panel_no: "1001",
      panel_capacity: "550",
      hold_status: 1,
      dispatch_status: 0,
      production_damage_status: 0,
    },
    {
      _id: 2,
      panel_unique_no: "PNL20260002",
      panel_no: "1002",
      panel_capacity: "550",
      hold_status: 1,
      dispatch_status: 1,
      production_damage_status: 0,
    },
    {
      _id: 3,
      panel_unique_no: "PNL20260003",
      panel_no: "1003",
      panel_capacity: "550",
      hold_status: 1,
      dispatch_status: 0,
      production_damage_status: 1,
    },
  ];

  const SEARCH_KEYS = [
    "panel_unique_no",
    "panel_no",
    "panel_capacity",
    "hold_status",
    "dispatch_status",
    "production_damage_status"  
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(panelList, SEARCH_KEYS, 100);

  const exportData = panelList.map((item, index) => ({
    sno: index + 1,
    panel_unique_no: item.panel_unique_no,
    panel_no: item.panel_no,
    panel_capacity: item.panel_capacity,
    hold_status: item.hold_status ? "Hold" : "Released",
    dispatch_status: item.dispatch_status ? "Dispatch" : "Pending",
    production_damage_status: item.production_damage_status ? "Damage" : "Safe",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel Unique No", key: "panel_unique_no" },
    { label: "Panel No", key: "panel_no" },
    { label: "Capacity", key: "panel_capacity" },
    { label: "Hold Status", key: "hold_status" },
    { label: "Dispatch Status", key: "dispatch_status" },
    { label: "Damage Status", key: "production_damage_status" },
  ];

  return (
    <Col lg={12}>
      <Card>
        <Card.Header>
          <Col lg={4}>
            <Card.Title className="mb-0">
              Hold Panel Details
            </Card.Title>
          </Col>

          <Col
            lg={8}
            className="d-flex justify-content-end align-items-center gap-2"
          >
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search panel..."
            />

            <TableExportActions
              data={exportData}
              columns={exportColumns}
              fileName="Hold_Panel_Report"
            />
          </Col>
        </Card.Header>

        <Card.Body>
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Panel Unique No</th>
                <th>Panel No</th>
                <th>Capacity</th>
                <th>Hold Status</th>
                <th>Dispatch Status</th>
                <th>Damage Status</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((item, index) => (
                <tr key={item._id}>
                  <td>
                    <strong>{startIndex + index + 1}</strong>
                  </td>

                  <td>{item.panel_unique_no}</td>
                  <td>{item.panel_no}</td>
                  <td>{item.panel_capacity} WP</td>

                  <td>
                    <Badge bg="danger">
                      Hold
                    </Badge>
                  </td>

                  <td>
                    {item.dispatch_status === 1 ? (
                      <Badge bg="success">
                        Dispatch
                      </Badge>
                    ) : (
                      <Badge bg="warning">
                        Pending
                      </Badge>
                    )}
                  </td>

                  <td>
                    {item.production_damage_status === 1 ? (
                      <Badge bg="danger">
                        Damage
                      </Badge>
                    ) : (
                      <Badge bg="success">
                        Safe
                      </Badge>
                    )}
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
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ViewHoldPanels;