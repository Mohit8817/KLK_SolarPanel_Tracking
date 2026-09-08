import { useEffect, useState } from "react";
import { Card, Col, Table, Badge, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import Search, { useSearch } from "../../Common/Search";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import PrefixCell from "../../Common/PrefixCell";

// Same mock lots jo ViewSerialList me hain (lot ka summary yahin se milega)
const MOCK_LOTS = {
  "lot-1": {
    prefix: "SL",
    model: "20W LED Street Light",
    category: "LIGHT",
    starting_no: 1,
    ending_no: 250,
    alot_project: "Jaipur Smart Highway",
    alot_state: "Rajasthan",
  },
  "lot-2": {
    prefix: "BAT",
    model: "12.8V 30Ah Battery",
    category: "BATTERY",
    starting_no: 1,
    ending_no: 250,
    alot_project: "Jaipur Smart Highway",
    alot_state: "Rajasthan",
  },
  "lot-3": {
    prefix: "AIO",
    model: "40W Solar Street Light",
    category: "LIGHT",
    starting_no: 1,
    ending_no: 200,
    alot_project: "Lucknow Rural Solar",
    alot_state: "Uttar Pradesh",
  },
  "lot-4": {
    prefix: "BAT",
    model: "12.8V 42Ah Battery",
    category: "BATTERY",
    starting_no: 251,
    ending_no: 400,
    alot_project: "Bhopal Street Lighting",
    alot_state: "Madhya Pradesh",
  },
};

// Serial number ko prefix + zero padded 6 digit me banane ka helper
const pad = (num) => String(num).padStart(6, "0");

const ViewGenerateDetailsList = () => {
  const { id } = useParams();

  const [lot, setLot] = useState(null);
  const [serialList, setSerialList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = () => {
    setLoading(true);
    setTimeout(() => {
      const lotInfo = MOCK_LOTS[id] || null;
      setLot(lotInfo);

      if (lotInfo) {
        const list = [];
        for (let i = lotInfo.starting_no; i <= lotInfo.ending_no; i++) {
          // Static/dummy status pattern (har 7th damaged, har 4th pending) — sirf demo ke liye
          const production_status = i % 4 === 0 ? 0 : 1;
          const production_damage_status = i % 11 === 0 ? 1 : 0;
          const dispatch_status = i % 5 === 0 ? 0 : 1;
          const damage_status = i % 13 === 0 ? 1 : 0;
          const recieve_status = i % 6 === 0 ? 0 : 1;
          const recieve_damage_status = i % 17 === 0 ? 1 : 0;

          list.push({
            _id: `${id}-${i}`,
            unique_no: `${lotInfo.prefix}${pad(i)}`,
            prefix: lotInfo.prefix,
            model: lotInfo.model,
            production_status,
            production_damage_status,
            dispatch_status,
            damage_status,
            recieve_status,
            recieve_damage_status,
          });
        }
        setSerialList(list);
      }
      setLoading(false);
    }, 400);
  };

  const SEARCH_KEYS = ["unique_no", "prefix", "model"];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(serialList, SEARCH_KEYS, 100);

  /* ================= EXPORT ================= */
  const exportData = serialList.map((item, index) => ({
    sno: index + 1,
    uniqueNo: item.unique_no,
    prefix: item.prefix,
    model: item.model,
    production: item.production_status === 1 ? "Assigned" : "Pending",
    production_damage: item.production_damage_status === 1 ? "Damaged" : "Safe",
    dispatch: item.dispatch_status === 1 ? "Dispatched" : "Pending",
    damage: item.damage_status === 1 ? "Damaged" : "Safe",
    receive: item.recieve_status === 1 ? "Received" : "Pending",
    receive_damage: item.recieve_damage_status === 1 ? "Damaged" : "Safe",
  }));

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "Serial No", key: "uniqueNo" },
    { label: "Prefix", key: "prefix" },
    { label: "Model", key: "model" },
    { label: "Production", key: "production" },
    { label: "Production Damage", key: "production_damage" },
    { label: "Dispatch", key: "dispatch" },
    { label: "Damage", key: "damage" },
    { label: "Receive", key: "receive" },
    { label: "Receive Damage", key: "receive_damage" },
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-5 text-muted">
        <h6>Lot not found</h6>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Serial Lot Details"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Serial Generation", to: "/light/serial/list" },
          { label: "Lot Details" },
        ]}
        subtitle={`${lot.model} • ${lot.alot_project} (${lot.alot_state})`}
      />

      <Col lg={12}>
        <Card className="klk-list-card">
          <Card.Header>
            <ListToolbar>
              <Search
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search serial no"
              />
              <TableExportActions
                data={exportData}
                columns={exportColumns}
                fileName="Serial_Lot_Details_Report"
              />
            </ListToolbar>
          </Card.Header>

          <Card.Body>
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Serial No</th>
                  <th>Prefix</th>
                  <th>Category</th>
                  <th>Production</th>
                  <th>P Damage</th>
                  <th>Dispatch</th>
                  <th>D Damage</th>
                  <th>Receive</th>
                  <th>R Damage</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item._id}>
                      <td><strong>{startIndex + index + 1}</strong></td>
                      <td className="font-monospace">{item.unique_no}</td>
                      <td><PrefixCell value={item.prefix} /></td>
                      <td>
                        {lot.category === "LIGHT" ? (
                          <Badge bg="primary">Street Light</Badge>
                        ) : (
                          <Badge bg="info">Battery Pack</Badge>
                        )}
                      </td>

                      <td>
                        {item.production_status === 1
                          ? <Badge bg="success">Assigned</Badge>
                          : <Badge bg="warning">Pending</Badge>}
                      </td>

                      <td>
                        {item.production_damage_status === 1
                          ? <Badge bg="danger">Damaged</Badge>
                          : <Badge bg="success">Safe</Badge>}
                      </td>

                      <td>
                        {item.dispatch_status === 1
                          ? <Badge bg="success">Dispatched</Badge>
                          : <Badge bg="warning">Pending</Badge>}
                      </td>

                      <td>
                        {item.damage_status === 1
                          ? <Badge bg="danger">Damaged</Badge>
                          : <Badge bg="success">Safe</Badge>}
                      </td>

                      <td>
                        {item.recieve_status === 1
                          ? <Badge bg="success">Received</Badge>
                          : <Badge bg="warning">Pending</Badge>}
                      </td>

                      <td>
                        {item.recieve_damage_status === 1
                          ? <Badge bg="danger">Damaged</Badge>
                          : <Badge bg="success">Safe</Badge>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "No records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card.Body>
        </Card>
      </Col>
    </>
  );
};

export default ViewGenerateDetailsList;