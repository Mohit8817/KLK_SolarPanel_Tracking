import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import axios from "axios";

const ViewRelease = ({ holdData }) => {
  const [releaseList, setReleaseList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReleaseHistory = async () => {
    try {
      if (!holdData?._id) return;

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/release-panels/${holdData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReleaseList(response.data.data || []);
      }
    } catch (error) {
      console.error("Release History Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleaseHistory();
  }, [holdData]);

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Project Name</th>
          <th>Project State</th>
          <th>Starting No</th>
          <th>Last No</th>
          <th>Release Lot</th>
          <th>Release Date</th>
          <th>Remarks</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan="8" className="text-center">
              Loading...
            </td>
          </tr>
        ) : releaseList.length > 0 ? (
          releaseList.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>{item.project}</td>
              <td>{item.state}</td>
              <td>{item.start_panel_no}</td>
              <td>{item.end_panel_no}</td>
              <td>{item.release_count}</td>
              <td>
                {item.release_date
                  ? new Date(item.release_date).toLocaleDateString("en-GB")
                  : "-"}
              </td>

              <td>{item.remarks}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="text-center">
              No Release History Found
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ViewRelease;