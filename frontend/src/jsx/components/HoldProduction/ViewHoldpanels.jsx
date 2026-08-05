import { useEffect, useState } from "react";
import { Card, Col, Table, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

import TableExportActions from "../Common/TableExportActions";
import CommonPagination from "../Common/Pagination";
import Search, { useSearch } from "../Common/Search";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";

const ViewHoldPanels = () => {
  const { id } = useParams();

  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHoldPanels = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/hold-panel/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response:", response.data);

    if (response.data.success) {
      setPanelList(response.data.data || []);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchHoldPanels();
  }, [id]);

  const SEARCH_KEYS = [
    "panel_unique_no",
    "panel_no",
    "panel_capacity",
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
    hold_status:
      item.hold_status === 1 ? "Hold" : "Released",
    production_status:
      item.production_status === 1
        ? "Assigned"
        : "Pending",
    production_damage_status:
      item.production_damage_status === 1
        ? "Damage"
        : "Safe",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Panel Unique No", key: "panel_unique_no" },
    { label: "Panel No", key: "panel_no" },
    { label: "Capacity", key: "panel_capacity" },
    { label: "Hold Status", key: "hold_status" },
    { label: "Production Status", key: "production_status" },
    {
      label: "Production Damage Status",
      key: "production_damage_status",
    },
  ];

  return (
    <>
      <PageHeader
        title="Hold Panel Details"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Hold Production", to: "/hold-production/list" },
          { label: "Panel Details" },
        ]}
        subtitle={`Hold ID: ${id}`}
      />
      <Col lg={12}>
      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
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
          </ListToolbar>
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
                <th>Production Status</th>
                <th>P Damage Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={item._id}>
                    <td>
                      {startIndex + index + 1}
                    </td>

                    <td>
                      {item.panel_unique_no}
                    </td>

                    <td>{item.panel_no}</td>

                    <td>
                      {item.panel_capacity} WP
                    </td>

                    <td>
                      {item.hold_status === 1 ? (
                        <Badge bg="danger">
                          Hold
                        </Badge>
                      ) : (
                        <Badge bg="success">
                          Released
                        </Badge>
                      )}
                    </td>

                    <td>
                      {item.production_status === 1 ? (
                        <Badge bg="success">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge bg="warning">
                          Pending
                        </Badge>
                      )}
                    </td>

                    <td>
                      {item.production_damage_status ===
                      1 ? (
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center"
                  >
                    No Panels Found
                  </td>
                </tr>
              )}
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
    </>
  );
};

export default ViewHoldPanels;