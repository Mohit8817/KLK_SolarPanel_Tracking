import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ReleaseForm = ({ holdData, onSuccess }) => {
  const [formData, setFormData] = useState({
    release_date: "",
    start_panel_no: "",
    release_count: "",
    project: "",
    state: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(null);

  useEffect(() => {
    if (holdData?._id) {
      fetchRange();
    }
  }, [holdData]);

 const fetchRange = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/hold-details/${holdData._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setRange(response.data.data);
    }
  } catch (error) {
    console.error("Range Fetch Error:", error);

    Swal.fire(
      "Error",
      "Unable to fetch hold panel details",
      "error"
    );
  }
};

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!holdData?._id) {
        return Swal.fire(
          "Error",
          "Hold panel data not found",
          "error"
        );
      }

      if (!range) {
        return Swal.fire(
          "Error",
          "Panel range not loaded",
          "error"
        );
      }

      if (
        Number(formData.start_panel_no) < Number(range.starting_no) ||
        Number(formData.start_panel_no) > Number(range.ending_no)
      ) {
        return Swal.fire(
          "Error",
          `Start Panel Number must be between ${range.starting_no} and ${range.ending_no}`,
          "error"
        );
      }

      if (!formData.release_date) {
        return Swal.fire(
          "Error",
          "Please select release date",
          "error"
        );
      }

      if (!formData.release_count) {
        return Swal.fire(
          "Error",
          "Please enter release count",
          "error"
        );
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/release-panels`,
        {
          hold_id: holdData._id,
          release_date: formData.release_date,
          start_panel_no: Number(formData.start_panel_no),
          release_count: Number(formData.release_count),
          project: formData.project,
          state: formData.state,
          remarks: formData.remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire(
        "Success",
        response.data.message,
        "success"
      );

      setFormData({
        release_date: "",
        start_panel_no: "",
        release_count: "",
        project: "",
        state: "",
        remarks: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      {/* Hold Range */}

      <div className="col-md-12 mb-3">
  {!range ? (
    <div className="alert alert-warning">
      Loading Hold Panel Details...
    </div>
  ) : (
    <div className="card border-primary">
      <div className="card-header bg-primary text-white">
        Hold Panel Details
      </div>

      <div className="card-body">
        <div className="row g-3">

          <div className="col-md-4">
            <label className="fw-bold">Panel Range</label>
            <div>
              {range.starting_no} - {range.ending_no}
            </div>
          </div>

          <div className="col-md-4">
            <label className="fw-bold">First Unique No</label>
            <div>{range.first_panel_unique_no}</div>
          </div>

          <div className="col-md-4">
            <label className="fw-bold">Last Unique No</label>
            <div>{range.last_panel_unique_no}</div>
          </div>

          <div className="col-md-4">
            <label className="fw-bold">Capacity</label>
            <div>{range.panel_capacity} W</div>
          </div>

          <div className="col-md-4">
            <label className="fw-bold">Panel Type</label>
            <div>
              {range.panel_type == 1
                ? "Poly"
                : range.panel_type == 2
                ? "Mono"
                : range.panel_type == 3
                ? "Bifacial"
                : range.panel_type}
            </div>
          </div>

          <div className="col-md-4">
            <label className="fw-bold">Available Panels</label>
            <div>{range.panel_count}</div>
          </div>

        </div>
      </div>
    </div>
  )}
</div>

      {/* Release Date */}

      <div className="col-md-6 mb-3">
        <label className="form-label">Release Date</label>

        <input
          type="date"
          className="form-control"
          name="release_date"
          value={formData.release_date}
          onChange={handleChange}
        />
      </div>

      {/* Start Panel */}

      <div className="col-md-6 mb-3">
        <label className="form-label">Start Panel No</label>

        <input
          type="number"
          className="form-control"
          name="start_panel_no"
          value={formData.start_panel_no}
          onChange={handleChange}
          placeholder="Enter Start Panel No"
        />
      </div>

      {/* Release Count */}

      <div className="col-md-6 mb-3">
        <label className="form-label">Release Count</label>

        <input
          type="number"
          className="form-control"
          name="release_count"
          value={formData.release_count}
          onChange={handleChange}
          placeholder="Enter Release Count"
        />
      </div>

      {/* Project */}

      <div className="col-md-6 mb-3">
        <label className="form-label">Project Name</label>

        <input
          type="text"
          className="form-control"
          name="project"
          value={formData.project}
          onChange={handleChange}
          placeholder="Project Name"
        />
      </div>

      {/* State */}

      <div className="col-md-12 mb-3">
        <label className="form-label">Project State</label>

        <select
          className="form-control"
          name="state"
          value={formData.state}
          onChange={handleChange}
        >
          <option value="">Select State</option>
          <option value="Andhra_Pradesh">Andhra Pradesh</option>
          <option value="Arunachal_Pradesh">Arunachal Pradesh</option>
          <option value="Assam">Assam</option>
          <option value="Bihar">Bihar</option>
          <option value="Chhattisgarh">Chhattisgarh</option>
          <option value="Goa">Goa</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Haryana">Haryana</option>
          <option value="Himachal_Pradesh">Himachal Pradesh</option>
          <option value="Jharkhand">Jharkhand</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Kerala">Kerala</option>
          <option value="Madhya_Pradesh">Madhya Pradesh</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Punjab">Punjab</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Tamil_Nadu">Tamil Nadu</option>
          <option value="Telangana">Telangana</option>
          <option value="Tripura">Tripura</option>
          <option value="Uttar_Pradesh">Uttar Pradesh</option>
          <option value="Uttarakhand">Uttarakhand</option>
          <option value="West_Bengal">West Bengal</option>
        </select>
      </div>

      {/* Remarks */}

      <div className="col-md-12 mb-3">
        <label className="form-label">Remarks</label>

        <textarea
          rows="3"
          className="form-control"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter Remarks"
        />
      </div>

      {/* Save */}

      <div className="col-md-12 text-end">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Saving..." : "Save Release"}
        </button>
      </div>
    </div>
  );
};

export default ReleaseForm;