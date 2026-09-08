import { Fragment, useState, useEffect } from "react";
import PageHeader from "../../Common/PageHeader";
import StateSelect from "../../Common/StateSelect";
import FormSubmitButton from "../../Common/FormSubmitButton";
import { InlineLoader } from "../../Common/LoadingState";
import { notifySuccess, notifyError } from "../../../utils/toast";

const INITIAL_FORM = {
    date: "",
    category: "LIGHT", // LIGHT or BATTERY
    light_type: "SEMI", // INBUILT or SEMI (only for LIGHT)
    wattage: "", // for LIGHT
    chemistry: "", // for BATTERY
    capacity: "", // for BATTERY (Ah/Wh spec)
    generated_year: "",
    prefix: "",
    item_count: "",
    project: "",
    state: "",
    vendor_id: "",
};

const AddLightBatteryProduction = () => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [wattages, setWattages] = useState([]);
    const [capacities, setCapacities] = useState([]);
    const [years, setYears] = useState([]);
    const [prefixes, setPrefixes] = useState([]);

    const [availableData, setAvailableData] = useState(null);

    const [loadingWattages, setLoadingWattages] = useState(false);
    const [loadingCapacities, setLoadingCapacities] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingPrefixes, setLoadingPrefixes] = useState(false);
    const [loadingAvailable, setLoadingAvailable] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});

    const isLight = formData.category === "LIGHT";

    // ---------------- CATEGORY SWITCH ----------------
    const handleCategoryChange = (cat) => {
        setFormData((prev) => ({
            ...INITIAL_FORM,
            date: prev.date,
            category: cat,
            project: prev.project,
            vendor_id: prev.vendor_id,
            state: prev.state,
        }));
        setYears([]);
        setPrefixes([]);
        setAvailableData(null);
    };

    // ---------------- FIELD CHANGE ----------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "wattage" || name === "chemistry" || name === "capacity") {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                generated_year: "",
                prefix: "",
            }));
            setYears([]);
            setPrefixes([]);
            setAvailableData(null);
        }

        if (name === "generated_year") {
            setFormData((prev) => ({
                ...prev,
                generated_year: value,
                prefix: "",
            }));
            setPrefixes([]);
            setAvailableData(null);
        }

        if (name === "prefix") {
            setAvailableData(null);
        }
    };

    // ---------------- FETCH WATTAGE (LIGHT) ----------------
    const fetchWattages = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}holdlight/hold-wattage`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) setWattages(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    // ---------------- FETCH CAPACITY (BATTERY) ----------------
    const fetchCapacities = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}holdbattery/hold-capacity`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) setCapacities(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    // ---------------- FETCH VENDORS ----------------
    const fetchVendors = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}users/vendor-list`,
                { method: "GET", headers: { Authorization: `Bearer ${token}` } }
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

    useEffect(() => {
        fetchVendors();
        fetchWattages();
        fetchCapacities();
    }, []);

    // ---------------- FETCH YEARS ----------------
    useEffect(() => {
        const specValue = isLight ? formData.wattage : formData.chemistry && formData.capacity;
        if (!specValue) return;

        const fetchYears = async () => {
            setLoadingYears(true);
            try {
                const token = localStorage.getItem("token");
                const endpoint = isLight
                    ? `holdlight/generated-year?wattage=${formData.wattage}`
                    : `holdbattery/generated-year?chemistry=${formData.chemistry}&capacity=${formData.capacity}`;

                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await response.json();
                if (data.success) setYears(data.data);
            } finally {
                setLoadingYears(false);
            }
        };

        fetchYears();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.wattage, formData.chemistry, formData.capacity, isLight]);

    // ---------------- FETCH PREFIXES ----------------
    useEffect(() => {
        const specValue = isLight ? formData.wattage : formData.chemistry && formData.capacity;
        if (!specValue || !formData.generated_year) return;

        const fetchPrefixes = async () => {
            setLoadingPrefixes(true);
            try {
                const token = localStorage.getItem("token");
                const endpoint = isLight
                    ? `holdlight/company-prefix?wattage=${formData.wattage}&generated_year=${formData.generated_year}`
                    : `holdbattery/company-prefix?chemistry=${formData.chemistry}&capacity=${formData.capacity}&generated_year=${formData.generated_year}`;

                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await response.json();
                if (data.success) setPrefixes(data.data);
            } finally {
                setLoadingPrefixes(false);
            }
        };

        fetchPrefixes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.wattage, formData.chemistry, formData.capacity, formData.generated_year, isLight]);

    // ---------------- FETCH AVAILABLE COUNT ----------------
    useEffect(() => {
        const specValue = isLight ? formData.wattage : formData.chemistry && formData.capacity;
        if (!specValue || !formData.generated_year || !formData.prefix) return;

        const fetchAvailable = async () => {
            setLoadingAvailable(true);
            try {
                const token = localStorage.getItem("token");
                const endpoint = isLight
                    ? `holdlight/available-count?wattage=${formData.wattage}&generated_year=${formData.generated_year}&prefix=${formData.prefix}&light_type=${formData.light_type}`
                    : `holdbattery/available-count?chemistry=${formData.chemistry}&capacity=${formData.capacity}&generated_year=${formData.generated_year}&prefix=${formData.prefix}`;

                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await response.json();
                if (data.success) setAvailableData(data);
            } finally {
                setLoadingAvailable(false);
            }
        };

        fetchAvailable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formData.wattage,
        formData.chemistry,
        formData.capacity,
        formData.generated_year,
        formData.prefix,
        formData.light_type,
        isLight,
    ]);

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        if (
            availableData &&
            Number(formData.item_count) > Number(availableData.available_count)
        ) {
            notifyError(
                `Item count cannot exceed available (${availableData.available_count})`
            );
            setFieldErrors({
                item_count: `Maximum ${availableData.available_count} items available`,
            });
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));

            const endpoint = isLight
                ? "production/create-production-light"
                : "production/create-production-battery";

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`,
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
                notifySuccess(
                    `${isLight ? "Light" : "Battery"} production entry saved successfully`
                );
                setFormData({ ...INITIAL_FORM, category: formData.category });
                setYears([]);
                setPrefixes([]);
                setAvailableData(null);
            } else {
                notifyError(data.message || "Failed to save production");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            notifyError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <PageHeader
                title="Add Light & Battery Production"
                breadcrumbs={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Production", to: "/production/light-battery/list" },
                    { label: "Add Production" },
                ]}
            />

            <div className="card klk-form-card klk-production-form">
                <div className="card-body">
                    <form className="form-valide klk-production-form__form" onSubmit={handleSubmit}>

                        {/* CATEGORY SELECTOR */}
                        <div className="row mb-3">
                            <div className="col-12">
                                <label className="form-label fw-bold d-block">
                                    Select Product Category <span className="text-danger">*</span>
                                </label>
                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        className={`btn px-4 py-2 ${
                                            isLight ? "btn-primary" : "btn-outline-secondary"
                                        }`}
                                        onClick={() => handleCategoryChange("LIGHT")}
                                    >
                                        <i className="fa-solid fa-lightbulb me-2"></i> Solar Street Light
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn px-4 py-2 ${
                                            !isLight ? "btn-info" : "btn-outline-secondary"
                                        }`}
                                        onClick={() => handleCategoryChange("BATTERY")}
                                    >
                                        <i className="fa-solid fa-car-battery me-2"></i> Battery Pack
                                    </button>
                                </div>
                            </div>
                        </div>

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
                                        {isLight ? "Item Count (Lights)" : "Item Count (Batteries)"}{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control${
                                            fieldErrors.item_count ? " is-invalid" : ""
                                        }`}
                                        name="item_count"
                                        placeholder={isLight ? "Enter number of lights" : "Enter number of batteries"}
                                        value={formData.item_count}
                                        onChange={handleChange}
                                        required
                                    />
                                    {fieldErrors.item_count && (
                                        <div className="invalid-feedback d-block">
                                            {fieldErrors.item_count}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isLight ? (
                                <>
                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Light Type <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-control"
                                                name="light_type"
                                                value={formData.light_type}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="SEMI">Semi-Integrated (External Battery)</option>
                                                <option value="INBUILT">All-In-One (Inbuilt Battery)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Wattage / Model <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-control"
                                                name="wattage"
                                                value={formData.wattage}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    {loadingWattages ? "Loading..." : "Select Wattage"}
                                                </option>
                                                {wattages.length > 0
                                                    ? wattages.map((w) => (
                                                          <option key={w} value={w}>
                                                              {w}
                                                          </option>
                                                      ))
                                                    : ["12W", "15W", "20W", "30W", "40W", "60W"].map((w) => (
                                                          <option key={w} value={w}>
                                                              {w}
                                                          </option>
                                                      ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Battery Chemistry <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-control"
                                                name="chemistry"
                                                value={formData.chemistry}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Chemistry</option>
                                                <option value="LiFePO4">Lithium Ferro Phosphate (LiFePO4)</option>
                                                <option value="Li-ion">Lithium-ion (NMC)</option>
                                                <option value="LeadAcid">Tubular Lead Acid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-xl-6 col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Capacity (Ah / Wh) <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-control"
                                                name="capacity"
                                                value={formData.capacity}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    {loadingCapacities ? "Loading..." : "Select Capacity"}
                                                </option>
                                                {capacities.length > 0
                                                    ? capacities.map((c) => (
                                                          <option key={c} value={c}>
                                                              {c}
                                                          </option>
                                                      ))
                                                    : [
                                                          "12.8V 18Ah",
                                                          "12.8V 30Ah",
                                                          "12.8V 42Ah",
                                                          "25.6V 30Ah",
                                                      ].map((c) => (
                                                          <option key={c} value={c}>
                                                              {c}
                                                          </option>
                                                      ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

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
                                        disabled={
                                            (isLight ? !formData.wattage : !(formData.chemistry && formData.capacity)) ||
                                            loadingYears
                                        }
                                    >
                                        <option value="">
                                            {loadingYears ? "Loading years..." : "Select Year"}
                                        </option>

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
                                        disabled={!formData.generated_year || loadingPrefixes}
                                    >
                                        <option value="">
                                            {loadingPrefixes ? "Loading prefixes..." : "Select Prefix"}
                                        </option>

                                        {prefixes.map((prefix) => (
                                            <option key={prefix} value={prefix}>
                                                {prefix}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {loadingAvailable && (
                                <div className="col-12 mb-2">
                                    <InlineLoader message="Loading available info..." />
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
                                    <label className="form-label">Vendor</label>

                                    <select
                                        className="form-control"
                                        name="vendor_id"
                                        value={formData.vendor_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Vendor</option>
                                        <option value="0">Not Assign</option>

                                        {vendors.map((vendor) => (
                                            <option key={vendor._id} value={vendor._id}>
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

                                    <StateSelect
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                        </div>

                        {availableData && (
                            <div className="klk-available-panel-card mb-3">
                                <div className="card border-primary shadow-sm">
                                    <div className="card-header bg-primary text-white py-2">
                                        <strong>
                                            Available {isLight ? "Light" : "Battery"} Information
                                        </strong>
                                    </div>

                                    <div className="card-body">
                                        <div className="row text-center g-3">
                                            <div className="col-md-4">
                                                <div className="border rounded p-3 h-100">
                                                    <h6 className="text-muted mb-1">
                                                        Available {isLight ? "Lights" : "Batteries"}
                                                    </h6>
                                                    <h4 className="mb-0 text-primary">
                                                        {availableData.available_count}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="border rounded p-3 h-100">
                                                    <h6 className="text-muted mb-1">Starting No</h6>
                                                    <h4 className="mb-0 text-success">
                                                        {availableData.starting_no}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="border rounded p-3 h-100">
                                                    <h6 className="text-muted mb-1">Starting Unique No</h6>
                                                    <div className="fw-bold text-dark klk-available-panel-card__serial">
                                                        {availableData.starting_unique_no}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <FormSubmitButton
                            loading={loading}
                            label={`Save ${isLight ? "Light" : "Battery"} Production`}
                            loadingLabel="Saving..."
                        />

                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default AddLightBatteryProduction;