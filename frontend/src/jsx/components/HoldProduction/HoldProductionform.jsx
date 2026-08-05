import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import PageTitle from "../../layouts/PageTitle";
import FormSubmitButton from "../Common/FormSubmitButton";

const HoldProductionform = () => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

  const [formData, setFormData] = useState({
    hold_date: "",
    panel_capacity: "",
    generated_year: "",
    prefix: "",
    panel_type: "",
    panel_count: "",
    reason: "",
  });

  const [capacities, setCapacities] = useState([]);
  const [years, setYears] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [panelTypes, setPanelTypes] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [startingPanelNo, setStartingPanelNo] = useState("");
  const [startingPanelUniqueNo, setStartingPanelUniqueNo] =
  useState("");
  const [loading, setLoading] = useState(false);

  // ===========================
  // Load Capacities
  // ===========================
  useEffect(() => {
    fetchCapacities();
  }, []);

  // ===========================
  // Capacity -> Years
  // ===========================
  useEffect(() => {
    if (formData.panel_capacity) {
      fetchYears();

      setFormData((prev) => ({
        ...prev,
        generated_year: "",
        prefix: "",
        panel_type: "",
        panel_count: "",
      }));

      setYears([]);
      setPrefixes([]);
      setPanelTypes([]);
      setAvailableCount(0);
    }
  }, [formData.panel_capacity]);

  // ===========================
  // Year -> Prefix
  // ===========================
  useEffect(() => {
    if (
      formData.panel_capacity &&
      formData.generated_year
    ) {
      fetchPrefixes();

      setFormData((prev) => ({
        ...prev,
        prefix: "",
        panel_type: "",
        panel_count: "",
      }));

      setPrefixes([]);
      setPanelTypes([]);
      setAvailableCount(0);
    }
  }, [formData.generated_year]);

  // ===========================
  // Prefix -> Panel Types
  // ===========================
  useEffect(() => {
    if (
      formData.panel_capacity &&
      formData.generated_year &&
      formData.prefix
    ) {
      fetchPanelTypes();

      setFormData((prev) => ({
        ...prev,
        panel_type: "",
        panel_count: "",
      }));

      setPanelTypes([]);
      setAvailableCount(0);
    }
  }, [formData.prefix]);

  // ===========================
  // Panel Type -> Count
  // ===========================
  useEffect(() => {
    if (
      formData.panel_capacity &&
      formData.generated_year &&
      formData.prefix &&
      formData.panel_type
    ) {
      fetchAvailableCount();
    }
  }, [formData.panel_type]);

  const fetchCapacities = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}holdpanel/hold-capacity`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCapacities(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}holdpanel/generated-year?panel_capacity=${formData.panel_capacity}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setYears(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPrefixes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}holdpanel/company-prefix?panel_capacity=${formData.panel_capacity}&generated_year=${formData.generated_year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPrefixes(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPanelTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}holdpanel/panel-type?panel_capacity=${formData.panel_capacity}&generated_year=${formData.generated_year}&prefix=${formData.prefix}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPanelTypes(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

const fetchAvailableCount = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}holdpanel/available-count?panel_capacity=${formData.panel_capacity}&generated_year=${formData.generated_year}&prefix=${formData.prefix}&panel_type=${formData.panel_type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAvailableCount(
      response.data.available_count || 0
    );

    setStartingPanelNo(
      response.data.starting_panel_no || ""
    );

    setStartingPanelUniqueNo(
      response.data.starting_panel_unique_no || ""
    );
  } catch (error) {
    console.error(error);

    setAvailableCount(0);
    setStartingPanelNo("");
    setStartingPanelUniqueNo("");
  }
};

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      Number(formData.panel_count) >
      Number(availableCount)
    ) {
      return alert(
        `Only ${availableCount} panels available`
      );
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}holdpanel/hold-panel`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Hold Production Created Successfully"
      );

      setFormData({
        hold_date: "",
        panel_capacity: "",
        generated_year: "",
        prefix: "",
        panel_type: "",
        panel_count: "",
        reason: "",
      });

      setYears([]);
      setPrefixes([]);
      setPanelTypes([]);
      setAvailableCount(0);

      fetchCapacities();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <PageTitle
        activeMenu="Hold Production"
        motherMenu="Production Management"
        motherLink="/hold-production/list"
      />

      <div className="card klk-form-card klk-production-form klk-hold-production-form">
        <div className="card-body">
          <form className="klk-production-form__form" onSubmit={handleSubmit}>
            <div className="row">

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Hold Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        name="hold_date"
                        value={formData.hold_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Panel Capacity
                      </label>

                      <select
                        className="form-control"
                        name="panel_capacity"
                        value={formData.panel_capacity}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Capacity
                        </option>

                        {capacities.map((capacity) => (
                          <option
                            key={capacity}
                            value={capacity}
                          >
                            {capacity} W
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Generated Year
                      </label>

                      <select
                        className="form-control"
                        name="generated_year"
                        value={formData.generated_year}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Year
                        </option>

                        {years.map((year) => (
                          <option
                            key={year}
                            value={year}
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Company Prefix
                      </label>

                      <select
                        className="form-control"
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Prefix
                        </option>

                        {prefixes.map((prefix) => (
                          <option
                            key={prefix}
                            value={prefix}
                          >
                            {prefix}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>



                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Panel Type
                      </label>

                      <select
                        className="form-control"
                        name="panel_type"
                        value={formData.panel_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Panel Type
                        </option>

                        {panelTypes.map((item) => (
                          <option
                            key={item._id}
                            value={item._id}
                          >
                            {item._id === 1
                              ? "Poly"
                              : item._id === 2
                              ? "Mono"
                              : item._id === 3
                              ? "Bifacial"
                              : `Type ${item._id}`}
                            {" "}
                            ({item.count})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Available Panel Count
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        value={availableCount}
                        readOnly
                      />
                    </div>
                  </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Starting Panel Unique No
                    </label>

                    <input
                      type="text"
                      className="form-control klk-available-panel-card__serial"
                      value={startingPanelUniqueNo}
                      readOnly
                    />
                  </div>
                </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Hold Panel Count
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="panel_count"
                        value={formData.panel_count}
                        onChange={handleChange}
                        min="1"
                        max={availableCount}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Reason
                      </label>

                      <textarea
                        rows="4"
                        className="form-control"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

            </div>

            <FormSubmitButton
              loading={loading}
              label="Save Hold Production"
              loadingLabel="Saving..."
            />
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default HoldProductionform;