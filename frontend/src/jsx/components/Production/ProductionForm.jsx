import { Fragment, useState, useEffect } from "react";
import PageTitle from "../../layouts/PageTitle";

const ProductionForm = () => {
    const [formData, setFormData] = useState({
            date: "",
            panel_capacity: "",
            generated_year: "",
            prefix: "",
            panel_count: "",
            panel_type: "",
            project: "",
            state: "",
            vendor_id: "",
            });
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [capacities, setCapacities] = useState([]);
    const [years, setYears] = useState([]);
    const [prefixes, setPrefixes] = useState([]);
    const [panelTypes, setPanelTypes] = useState([]);
    const [availableData, setAvailableData] = useState(null);

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "panel_capacity") {
    setFormData((prev) => ({
      ...prev,
      panel_capacity: value,
      generated_year: "",
      prefix: "",
      panel_type: "",
    }));

    setYears([]);
    setPrefixes([]);
    setPanelTypes([]);
    setAvailableData(null);
  }

  if (name === "generated_year") {
    setFormData((prev) => ({
      ...prev,
      generated_year: value,
      prefix: "",
      panel_type: "",
    }));

    setPrefixes([]);
    setPanelTypes([]);
    setAvailableData(null);
  }

  if (name === "prefix") {
    setFormData((prev) => ({
      ...prev,
      prefix: value,
      panel_type: "",
    }));

    setPanelTypes([]);
    setAvailableData(null);
  }
};


const fetchCapacities = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/hold-capacity`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setCapacities(data.data);
    }
  } catch (error) {
    console.log(error);
  }
};


useEffect(() => {
  if (!formData.panel_capacity) return;

  const fetchYears = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/generated-year?panel_capacity=${formData.panel_capacity}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setYears(data.data);
    }
  };

  fetchYears();
}, [formData.panel_capacity]);

useEffect(() => {
  if (
    !formData.panel_capacity ||
    !formData.generated_year
  )
    return;

  const fetchPrefixes = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/company-prefix?panel_capacity=${formData.panel_capacity}&generated_year=${formData.generated_year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setPrefixes(data.data);
    }
  };

  fetchPrefixes();
}, [
  formData.panel_capacity,
  formData.generated_year,
]);


useEffect(() => {
  if (
    !formData.panel_capacity ||
    !formData.generated_year ||
    !formData.prefix
  )
    return;

  const fetchPanelTypes = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/panel-type?panel_capacity=${formData.panel_capacity}&generated_year=${formData.generated_year}&prefix=${formData.prefix}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setPanelTypes(data.data);
    }
  };

  fetchPanelTypes();
}, [
  formData.panel_capacity,
  formData.generated_year,
  formData.prefix,
]);


useEffect(() => {
  if (
    !formData.panel_capacity ||
    !formData.generated_year ||
    !formData.prefix ||
    !formData.panel_type
  )
    return;

  const fetchAvailable = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}holdpanel/available-count?panel_capacity=${formData.panel_capacity}&generated_year=${formData.generated_year}&prefix=${formData.prefix}&panel_type=${formData.panel_type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setAvailableData(data);
    }
  };

  fetchAvailable();
}, [
  formData.panel_capacity,
  formData.generated_year,
  formData.prefix,
  formData.panel_type,
]);


    // FETCH VENDOR LIST
    useEffect(() => {

        fetchVendors();
        fetchCapacities();

    }, []);

    const fetchVendors = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}users/vendor-list`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {

                setVendors(data || []);

            } else {

                console.log("Vendor fetch failed");

            }

        } catch (error) {

            console.log("Vendor API Error:", error);

        }

    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}production/create-production-panel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...formData,
                        company_id: user?.company_id || "COMP001",
                        created_by: user?.name || "admin",
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Production entry submitted successfully!");

                setFormData({
                    date: "",
                    panel_capacity: "",
                    panel_count: "",
                    panel_type: "",
                    project: "",
                    state: "",
                });
            } else {
                alert(data.message || "Failed to save production");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            alert("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <PageTitle
                activeMenu="Production Form"
                motherMenu="Production"
            />

            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Add Production Details</h4>
                        </div>

                        <div className="card-body">
                            <form className="form-valide" onSubmit={handleSubmit}>
                                <div className="row">

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

                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Panel Count <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="panel_count"
                                                placeholder="Enter number of panels"
                                                value={formData.panel_count}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

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
                                                required>
                                                <option value="">Select Capacity</option>
                                                {capacities.map((capacity) => (
                                                <option key={capacity} value={capacity}>
                                                    {capacity}
                                                </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-xl-6 col-md-6">
  <div className="form-group mb-3">
    <label className="form-label">
      Generated Year <span className="text-danger">*</span>
    </label>

    <select
      className="form-control"
      name="generated_year"
      value={formData.generated_year}
      onChange={handleChange}
      required
    >
      <option value="">Select Year</option>

      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>
</div>

<div className="col-xl-6 col-md-6">
  <div className="form-group mb-3">
    <label className="form-label">
      Prefix <span className="text-danger">*</span>
    </label>

    <select
      className="form-control"
      name="prefix"
      value={formData.prefix}
      onChange={handleChange}
      required
    >
      <option value="">Select Prefix</option>

      {prefixes.map((prefix) => (
        <option key={prefix} value={prefix}>
          {prefix}
        </option>
      ))}
    </select>
  </div>
</div>

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

                                                {panelTypes.map((item) => (
                                                <option key={item._id} value={item._id}>
                                                    {item._id == 1
                                                    ? "Poly"
                                                    : item._id == 2
                                                    ? "Mono"
                                                    : "Bifacial"} ({item.count})
                                                </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                             {availableData && (
  <div className="col-lg-12 mb-3">
    <div className="card border-primary shadow-sm">
      <div className="card-header bg-primary text-white py-2">
        <strong>Available Panel Information</strong>
      </div>

      <div className="card-body">
        <div className="row text-center">

          <div className="col-md-4 mb-3">
            <div className="border rounded p-3 h-100">
              <h6 className="text-muted mb-1">
                Available Panels
              </h6>
              <h4 className="mb-0 text-primary">
                {availableData.available_count}
              </h4>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="border rounded p-3 h-100">
              <h6 className="text-muted mb-1">
                Starting Panel No
              </h6>
              <h4 className="mb-0 text-success">
                {availableData.starting_panel_no}
              </h4>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="border rounded p-3 h-100">
              <h6 className="text-muted mb-1">
                Starting Unique No
              </h6>
              <div
                className="fw-bold text-dark"
                style={{
                  wordBreak: "break-all",
                  fontSize: "14px",
                }}
              >
                {availableData.starting_panel_unique_no}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
)}



                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Project <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="project"
                                                placeholder="Enter project name"
                                                value={formData.project}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>


                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">

                                            <label className="form-label">
                                                Vendor
                                            </label>

                                            <select
                                                className="form-control"
                                                name="vendor_id"
                                                value={formData.vendor_id}
                                                onChange={handleChange}
                                            >

                                                {/* DEFAULT */}
                                                <option value="">Select Vendor</option>

                                                {/* NOT ASSIGN OPTION */}
                                                <option value="0">
                                                    Not Assign
                                                </option>

                                                {/* API VENDORS */}
                                                {vendors.map((vendor) => (

                                                    <option
                                                        key={vendor._id}
                                                        value={vendor._id}
                                                    >
                                                        {vendor.first_name} {vendor.last_name} ({vendor.email})
                                                    </option>

                                                ))}

                                            </select>

                                        </div>
                                    </div>

                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                State <span className="text-danger">*</span>
                                            </label>

                                            <select
                                                className="form-control"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select State</option>

                                                {/* States */}
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
                                                <option value="Manipur">Manipur</option>
                                                <option value="Meghalaya">Meghalaya</option>
                                                <option value="Mizoram">Mizoram</option>
                                                <option value="Nagaland">Nagaland</option>
                                                <option value="Odisha">Odisha</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                                <option value="Sikkim">Sikkim</option>
                                                <option value="Tamil_Nadu">Tamil Nadu</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="Tripura">Tripura</option>
                                                <option value="Uttar_Pradesh">Uttar Pradesh</option>
                                                <option value="Uttarakhand">Uttarakhand</option>
                                                <option value="West_Bengal">West Bengal</option>

                                                {/* Union Territories */}
                                                <option value="Andaman_Nicobar">Andaman and Nicobar Islands</option>
                                                <option value="Chandigarh">Chandigarh</option>
                                                <option value="Dadra_Nagar_Haveli_Daman_Diu">
                                                    Dadra and Nagar Haveli and Daman and Diu
                                                </option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Jammu_Kashmir">Jammu and Kashmir</option>
                                                <option value="Ladakh">Ladakh</option>
                                                <option value="Lakshadweep">Lakshadweep</option>
                                                <option value="Puducherry">Puducherry</option>
                                            </select>
                                        </div>
                                    </div>

                                </div>

                                <div className="row mt-3">
                                    <div className="col-lg-12 text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-success px-4"
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save Production"}
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

export default ProductionForm;