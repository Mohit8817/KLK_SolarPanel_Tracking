import { useState } from "react";
import { Card, Col, Table, Row, Modal } from "react-bootstrap";
import Search, { useSearch } from "../Common/Search";
import CommonPagination from "../Common/Pagination";
import TableExportActions from "../Common/TableExportActions";
import { Link } from "react-router-dom";

import ReleaseForm from "./ReleaseForm";
import ViewRelease from "./ViewRelease";

const ViewHoldProduction = () => {
  const [holdList] = useState([
    {
      _id: "1",
      date: "2026-06-06",
      hold_status: "Hold",
      panel_count: 500,
      panel_capacity: 550,
      panel_type: "Mono",
      state: "Haryana",
      starting_no: 1001,
      ending_no: 1500,
      hold_by: "Mohit",
      reason: "Quality Issue",
    },
  ]);

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

  const SEARCH_KEYS = [
    "date",
    "hold_status",
    "panel_type",
    "panel_count",
    "panel_capacity",
    "state",
    "hold_by",
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
    date: item.date,
    hold_status: item.hold_status,
    panel_count: item.panel_count,
    panel_capacity: item.panel_capacity,
    panel_type: item.panel_type,
    state: item.state,
    starting_no: item.starting_no,
    ending_no: item.ending_no,
    hold_by: item.hold_by,
    reason: item.reason,
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Date", key: "date" },
    { label: "Status", key: "hold_status" },
    { label: "Panel Count", key: "panel_count" },
    { label: "Capacity", key: "panel_capacity" },
    { label: "Panel Type", key: "panel_type" },
    { label: "State", key: "state" },
    { label: "Start No", key: "starting_no" },
    { label: "End No", key: "ending_no" },
    { label: "Hold By", key: "hold_by" },
    { label: "Reason", key: "reason" },
  ];

  return (
    <>
      <Col lg={12}>
        <Card>
          <Card.Header as={Row} className="align-items-center">
            <Col lg={4}>
              <Card.Title>View Hold Production</Card.Title>
            </Col>

            <Col
              lg={8}
              className="d-flex justify-content-end align-items-center gap-2"
            >
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
            </Col>
          </Card.Header>

          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Panel Count</th>
                  <th>Capacity</th>
                  <th>Type</th>
                  <th>State</th>
                  <th>Start No</th>
                  <th>End No</th>
                  <th>Hold By</th>
                  <th>Reason</th>
                  <th>Release Panel</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item._id}>
                      <td>{startIndex + index + 1}</td>

                      <td>{item.date}</td>

                      <td>
                        <span
                          className={`badge ${
                            item.hold_status === "Hold"
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {item.hold_status}
                        </span>
                      </td>

                      <td>{item.panel_count}</td>
                      <td>{item.panel_capacity} WP</td>
                      <td>{item.panel_type}</td>
                      <td>{item.state}</td>
                      <td>{item.starting_no}</td>
                      <td>{item.ending_no}</td>
                      <td>{item.hold_by}</td>
                      <td>{item.reason}</td>

                      {/* Release Panel */}
                      <td className="">
                        <div className="d-flex gap-3 text-center justify-content-center">
                          <button
                            className="btn btn-primary btn-xs sharp"
                            title="Add Release"
                            onClick={() =>
                              handleOpenReleaseModal(item)
                            }
                          >
                            <i className="fa fa-plus" />
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

                      {/* Actions */}
                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            to="/hold-production-panels"
                            className="btn btn-info btn-xs sharp"
                          >
                            <i className="fa fa-eye" />
                          </Link>

                          <button className="btn btn-danger btn-xs sharp">
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center">
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

      {/* Add Release Modal */}
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
          <ReleaseForm />
        </Modal.Body>
      </Modal>

      {/* View Release Modal */}
      <Modal
        show={showReleaseView}
        onHide={() => setShowReleaseView(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Release Panel History
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ViewRelease />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewHoldProduction;