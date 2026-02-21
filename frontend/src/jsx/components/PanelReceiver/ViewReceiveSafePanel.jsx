import { useState } from "react";
import { Card, Col, Table } from "react-bootstrap";
import CommonPagination from "../Common/Pagination";

const ReceiveList = () => {

  const dummyData = [
    {
      id: 1,
      truckNo: "DL01AB1234",
      challanNo: "CH001",
      panels: ["PNL001", "PNL002", "PNL003"],
      total: 3
    },
    {
      id: 2,
      truckNo: "DL01CD5678",
      challanNo: "CH002",
      panels: ["PNL010", "PNL011"],
      total: 2
    }
  ];

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = dummyData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Col lg={12}>
      <Card>

        <Card.Header>
          <Card.Title>
            Receive Truck List
          </Card.Title>
        </Card.Header>

        <Card.Body>

          <Table responsive hover>

            <thead>
              <tr>
                <th>S no.</th>
                <th>Truck No</th>
                <th>Challan No</th>
                <th>Total Panels</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {currentData.map((item, index) => (

                <tr key={item.id}>

                  <td>
                    {startIndex + index + 1}
                  </td>

                  <td>
                    {item.truckNo}
                  </td>

                  <td>
                    {item.challanNo}
                  </td>

                  <td>
                    {item.total}
                  </td>

                  <td>
                    <button className="btn btn-primary btn-sm">
                      View Panels
                    </button>
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

export default ReceiveList;