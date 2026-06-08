import { Fragment, useState } from "react";
import PageTitle from "../../layouts/PageTitle";

const HoldProductionform = () => {
  const [formData, setFormData] = useState({
    date: "",
    hold_status: "",
    panel_count: "",
    panel_capacity: "",
    panel_type: "",
    state: "",
    starting_no: "",
    ending_no: "",
    reason: "",
    hold_by: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Form Submitted Successfully");
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Hold Production"
        motherMenu="Production Management"
      />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Hold Production Form</h4>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">

                  {/* Date */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Hold Status */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Hold Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="hold_status"
                        value={formData.hold_status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Hold">Hold</option>
                        <option value="Released">Released</option>
                      </select>
                    </div>
                  </div>

                  {/* Panel Count */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Count <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="panel_count"
                        value={formData.panel_count}
                        onChange={handleChange}
                        placeholder="Enter Panel Count"
                        required
                      />
                    </div>
                  </div>

                  {/* Panel Capacity */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Capacity (W) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="panel_capacity"
                        value={formData.panel_capacity}
                        onChange={handleChange}
                        placeholder="Enter Capacity"
                        required
                      />
                    </div>
                  </div>

                  {/* Panel Type */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="panel_type"
                        value={formData.panel_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Poly">Poly</option>
                        <option value="Mono">Mono</option>
                        <option value="Bifacial">Bifacial</option>
                      </select>
                    </div>
                  </div>

                  {/* State */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        State <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter State"
                        required
                      />
                    </div>
                  </div>

                  {/* Starting No */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Starting No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="starting_no"
                        value={formData.starting_no}
                        onChange={handleChange}
                        placeholder="Enter Starting No"
                        required
                      />
                    </div>
                  </div>

                  {/* Ending No */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Ending No <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="ending_no"
                        value={formData.ending_no}
                        onChange={handleChange}
                        placeholder="Enter Ending No"
                        required
                      />
                    </div>
                  </div>

                  {/* Hold By */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Hold By <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="hold_by"
                        value={formData.hold_by}
                        onChange={handleChange}
                        placeholder="Enter Employee Name"
                        required
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="col-md-12">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Reason <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Enter Hold Reason"
                        required
                      />
                    </div>
                  </div>

                </div>

                <div className="text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary px-5"
                  >
                    Save Hold Production
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default HoldProductionform;