import { Fragment, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { createPanelSerial } from "./GeneratepanelApis";

const Generatepanel = () => {
  const [formData, setFormData] = useState({
    date: "",
    total_panels: "",
    panel_capacity: "",
    panel_type: "",
    panel_category: "",
    prefix: "",
    starting_no: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createPanelSerial(formData);
      alert("Serial numbers generated successfully");
    } catch (error) {
      console.log("ERROR:", error?.response?.data);
      alert(error?.response?.data?.message || "Failed to generate");
    }
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Generate Panel"
        motherMenu="Panel Generation"
      />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Generate Panel Serial Number</h4>
            </div>

            <div className="card-body">
              <form className="form-valide" onSubmit={handleSubmit}>
                <div className="row">

                  {/* Date */}
                  <div className="col-xl-6 col-md-6">
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

                  {/* No of Panels */}
                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        No of Panels <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="total_panels"
                        value={formData.total_panels}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Capacity */}

                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Capacity (W) <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="panel_capacity"
                        value={formData.panel_capacity}
                        onChange={handleChange}
                        required >
                        <option value="">Select Capacity</option>
                        <option value="510">510</option>
                        <option value="520">520</option>
                        <option value="525">525</option>
                        <option value="530">530</option>
                        <option value="535">535</option>
                        <option value="540">540</option>
                      </select>
                    </div>
                  </div>

                  {/* Panel Type */}
                  <div className="col-xl-6 col-md-6">
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
                        <option value="1">Poly</option>
                        <option value="2">Mono</option>                                               
                        <option value="3">Bifacial</option>
                      </select>
                    </div>
                  </div>

                  {/* Panel Category */}
                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Panel Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="panel_category"
                        value={formData.panel_category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="1">Type 1</option>
                        <option value="2">Type 2</option>
                      </select>
                    </div>
                  </div>

                  {/* Prefix */}
                  <div className="col-xl-6 col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Prefix <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="prefix"
                        placeholder="e.g. KLK"
                        value={formData.prefix}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Starting No */}
                  <div className="col-xl-12 col-md-12">
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Starting No
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="starting_no"
                        placeholder="e.g. 1"
                        value={formData.starting_no}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                </div>

                <div className="row mt-3">
                  <div className="col-lg-12 text-center">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                    >
                      Generate Serial No
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Generatepanel;