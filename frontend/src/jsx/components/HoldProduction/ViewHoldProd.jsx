import { useState, useEffect } from "react";
import { Card, Col, Table, Modal } from "react-bootstrap";
import Search, { useSearch } from "../Common/Search";
import CommonPagination from "../Common/Pagination";
import TableExportActions from "../Common/TableExportActions";
import PageHeader from "../Common/PageHeader";
import ListToolbar from "../Common/ListToolbar";
import { Link } from "react-router-dom";
import axios from "axios";

import ReleaseForm from "./releaseForm";
import ViewRelease from "./ViewRelease";
import PrefixCell from "../Common/PrefixCell";

const ViewHoldProduction = () => {
  const [holdList, setHoldList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [showReleaseView, setShowReleaseView] = useState(false);
  const [selectedHold, setSelectedHold] = useState(null);

  const handleOpenReleaseModal = (item) => {
    setSelectedHold(item);
    setShowReleaseForm(true);
  };

  const handleOpenReleaseView = (item) => {
    setSelectedHold(item);
    setShowReleaseView(true);
  };

  const fetchHoldPanels = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/view-hold-panel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setHoldList(response.data.data || []);
      }
    } catch (error) {
      console.error("Fetch Hold Panels Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldPanels();
  }, []);

  const SEARCH_KEYS = [
    "hold_status",
    "panel_type",
    "panel_count",
    "panel_capacity",
    "prefix",
    "state",
    "created_by",
    "reason",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(holdList, SEARCH_KEYS, 50);

  const exportData = holdList.map((item, index) => ({
    sno: index + 1,
    date: item.hold_date
      ? new Date(item.hold_date).toLocaleDateString("en-GB")
      : "-",
    prefix: item.prefix,
    hold_status:
      item.hold_status === "H"
        ? "Hold"
        : "Released",
    panel_count: item.panel_count,
    panel_capacity: item.panel_capacity,
    panel_type:
      item.panel_type == 1
        ? "Poly"
        : item.panel_type == 2
        ? "Mono"
        : item.panel_type == 3
        ? "Bifacial"
        : item.panel_type,
    state: item.state || "-",
    starting_no: item.starting_no,
    ending_no: item.ending_no,
    hold_by: item.created_by,
    reason: item.reason,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Prefix", key: "prefix" },
    { label: "Status", key: "hold_status" },
    { label: "Panel Count", key: "panel_count" },
    { label: "Capacity", key: "panel_capacity" },
    { label: "Panel Type", key: "panel_type" },
    { label: "Hold By", key: "hold_by" },
    { label: "Reason", key: "reason" },
  ];

  return (
    <>
      <PageHeader
        title="Hold Production List"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Production Management" },
        ]}
        action={
          <Link to="/hold-production/add" className="btn btn-primary btn-sm">
            <i className="fa fa-plus me-1" /> Hold Production
          </Link>
        }
      />
      <Col lg={12}>
        <Card className="klk-list-card">
          <Card.Header>
            <ListToolbar>
              <Search
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search..."
              />
              <TableExportActions
                data={exportData}
                columns={exportColumns}
                fileName="Hold_Production_Report"
              />
            </ListToolbar>
          </Card.Header>

          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Date</th>
                  <th>Prefix</th>
                  <th>Status</th>
                  <th>Panel Count</th>
                  <th>Capacity</th>
                  <th>Type</th>
                  <th>Hold By</th>
                  <th>Reason</th>
                  <th>Release Panel</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="14" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item._id}>
                      <td>{startIndex + index + 1}</td>

                      <td>
                        {item.hold_date
                          ? new Date(
                              item.hold_date
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </td>

                      <td><PrefixCell value={item.prefix} /></td>

                      <td>
                        <span
                          className={`badge ${
                            item.hold_status === "H"
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {item.hold_status === "H"
                            ? "Hold"
                            : "Released"}
                        </span>
                      </td>

                      <td>{item.panel_count}</td>

                      <td>{item.panel_capacity}</td>

                      <td>
                        {item.panel_type == 1
                          ? "Poly"
                          : item.panel_type == 2
                          ? "Mono"
                          : item.panel_type == 3
                          ? "Bifacial"
                          : item.panel_type}
                      </td>

                      <td>{item.created_by ?? '-'}</td>

                      <td>{item.reason}</td>

                      <td>
                        <div className="d-flex gap-3 text-center justify-content-center">
                          <button
                            className="btn btn-primary btn-xs sharp"
                            title="Add Release"
                            onClick={() =>
                              handleOpenReleaseModal(item)
                            }
                          >
                            <i className="fa fa-minus" />
                          </button>

                          <button
                            className="btn btn-warning btn-xs sharp"
                            title="View Release"
                            onClick={() =>
                              handleOpenReleaseView(item)
                            }
                          >
                            <i className="fa fa-eye" />
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            to={`/hold-production-panels/${item._id}`}
                            className="btn btn-info btn-xs sharp"
                          >
                            <i className="fa fa-eye" />
                          </Link>

                          {/* <button className="btn btn-danger btn-xs sharp">
                            <i className="fa fa-trash" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center">
                      No Hold Production Found
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

      <Modal
        show={showReleaseForm}
        onHide={() => setShowReleaseForm(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Add Release Panel
            {selectedHold && (
              <span className="ms-2 text-muted">
                ({selectedHold.starting_no} -{" "}
                {selectedHold.ending_no})
              </span>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
        <ReleaseForm
          holdData={selectedHold}
          onSuccess={() => {
            setShowReleaseForm(false);
            fetchHoldPanels();
          }}
        />
      </Modal.Body>
      </Modal>

 <Modal
  show={showReleaseView}
  onHide={() => setShowReleaseView(false)}
  centered
  size="xl"
>
  <Modal.Header closeButton>
    <Modal.Title>
      Release Panel History
      {selectedHold && (
        <span className="ms-2 text-muted">
          ({selectedHold.panel_count} Panels)
        </span>
      )}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <ViewRelease holdData={selectedHold} />
  </Modal.Body>
</Modal>
    </>
  );
};

export default ViewHoldProduction;