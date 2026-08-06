import { Modal, Table, Badge } from "react-bootstrap";
import PrefixCell from "../Common/PrefixCell";

const ScannedPanelsModal = ({ show, onHide, dispatch }) => {
  if (!dispatch) return null;

  const panels =
    dispatch.dispatchType === "DCR"
      ? dispatch.dcrScannedPanels || []
      : dispatch.nonDcrScannedPanels || [];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Scanned Panels
          <Badge
            className="ms-2"
            bg={dispatch.dispatchType === "DCR" ? "primary" : "primary"}
          >
            {dispatch.dispatchType}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Prefix</th>
              <th>Panel Code</th>
            </tr>
          </thead>
          <tbody>
            {panels.length > 0 ? (
              panels.map((panel, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><PrefixCell serial={panel} /></td>
                  <td>
                    <strong>{panel}</strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  No scanned panels found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default ScannedPanelsModal;
