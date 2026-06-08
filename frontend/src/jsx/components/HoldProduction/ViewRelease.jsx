import { Table } from "react-bootstrap";

const ViewRelease = () => {
  const releaseList = [
    {
      start: 1001,
      lot_size: 500,
      release_date: "2026-06-06",
      count: 200,
      project_name: "JAKEDA",
      project_state: "Rajasthan",
      remarks: "Released for Project",
    },
    {
      start: 1201,
      lot_size: 500,
      release_date: "2026-06-08",
      count: 100,
      project_name: "Solar Park",
      project_state: "Haryana",
      remarks: "Dispatch Ready",
    },
  ];

  return (
    <Table responsive  hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Start</th>
          <th>Lot Size</th>
          <th>Release Date</th>
          <th>Count</th>
          <th>Project Name</th>
          <th>Project State</th>
          <th>Remarks</th>
        </tr>
      </thead>

      <tbody>
        {releaseList.map((item, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.start}</td>
            <td>{item.lot_size}</td>
            <td>{item.release_date}</td>
            <td>{item.count}</td>
            <td>{item.project_name}</td>
            <td>{item.project_state}</td>
            <td>{item.remarks}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ViewRelease;