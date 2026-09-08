import { Fragment, useState, useEffect } from "react";
import PageHeader from "../../Common/PageHeader";
import FormSubmitButton from "../../Common/FormSubmitButton";
import { InlineLoader } from "../../Common/LoadingState";
import { notifySuccess, notifyError } from "../../../utils/toast";

const INITIAL_FORM = {
    category: "LIGHT", // LIGHT or BATTERY (production plan type)
};

// ---------------- BOM "PRODUCT MASTER" FIELDS ----------------
// This is the single top block of the Add BOM screen — the product this
// BOM belongs to. Filled once per requisition (not per material row).
const INITIAL_BOM_PRODUCT = {
    warehouse: "HO Warehouse",
    product_type: "PRODUCT",
    product_category: "",
    product_name: "",
    product_brand: "",
    product_unit: "",
    variant: "",
    attachment: null,
    remarks: "",
};

// ---------------- MATERIALS REQUIRED ROW TEMPLATE ----------------
const EMPTY_MATERIAL_ROW = () => ({
    warehouse: "",
    product_type: "",
    product_name: "",
    variant: "",
    quantity: "",
});

// ---------------- STATIC OPTION LISTS ----------------
// Replace/extend these (or wire them up to real APIs the same way
// fetchPlans() below talks to the backend) once master-data endpoints
// for warehouses / products / brands / units / variants / categories
// are ready on the backend.
const WAREHOUSE_OPTIONS = ["HO Warehouse"];

const PRODUCT_TYPE_OPTIONS = ["ITEMS", "PRODUCT"];

const PRODUCT_CATEGORY_OPTIONS = [
    "SCREW",
    "BATTERY TAPE",
    "HOME LIGHT",
    "STREET LIGHT",
    "POLE",
    "BATTERY",
    "STRUCTURE",
    "CONNECTORS",
    "SOLAR MODULES OR PANNELS",
    "INVERTER",
    "STICKER",
    "SOLAR PALNT STRUCTURE",
    "SOLAR PLANT",
    "WIRE",
    "MC",
    "PCB",
    "ALUMUIUM ARMD CABLE",
    "CABLE TIE",
    "FASTHNER",
    "SOLAR LIGHT",
    "BOLT",
    "NUT BOLT",
    "LIGHT",
    "FAN",
    "TAPE",
    "PIPE",
    "AJB BOX",
    "HDPE PIPE",
    "ACDB BOX",
    "BATTEN",
    "SOLAR PALNT BATTERY",
    "SOLAR PUMP",
    "TERMINAL",
    "SOLAR",
    "BUSBAR",
    "STREET-LIGHT",
];

// Product Name / Brand / Unit / Variant are normally dependent on the
// selected category & product (cascading dropdowns from the backend).
// Wire these up to real endpoints later — for now, static placeholders.
const PRODUCT_NAME_OPTIONS = ["LED Chip / Module", "Solar Panel", "Controller / Driver", "Battery Cells", "BMS Module"];
const PRODUCT_BRAND_OPTIONS = ["Brand A", "Brand B", "Brand C"];
const PRODUCT_UNIT_OPTIONS = ["PCS", "SET", "KG", "MTR"];
const PRODUCT_VARIANT_OPTIONS = ["Standard", "Premium", "Custom"];

const PRIORITY_BADGE = {
    LOW: "secondary",
    NORMAL: "info",
    HIGH: "warning",
    URGENT: "danger",
};

const STATUS_BADGE = {
    DRAFT: "secondary",
    ASSIGNED: "primary",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
};

const MaterialRequisition = () => {
    const [formData, setFormData] = useState(INITIAL_FORM);

    // Top "product master" block of the BOM (one per requisition).
    const [bomProduct, setBomProduct] = useState(INITIAL_BOM_PRODUCT);

    // Materials Required table rows.
    const [materials, setMaterials] = useState([EMPTY_MATERIAL_ROW()]);

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPlans, setLoadingPlans] = useState(false);

    const isLight = formData.category === "LIGHT";

    // ---------------- CATEGORY SWITCH ----------------
    const handleCategoryChange = (cat) => {
        setFormData({ category: cat });
        setBomProduct(INITIAL_BOM_PRODUCT);
        setMaterials([EMPTY_MATERIAL_ROW()]);
    };

    // ---------------- BOM PRODUCT (TOP BLOCK) HANDLERS ----------------
    const handleBomProductChange = (field, value) => {
        setBomProduct((prev) => ({ ...prev, [field]: value }));
    };

    const handleBomAttachmentChange = (e) => {
        const file = e.target.files?.[0] || null;
        setBomProduct((prev) => ({ ...prev, attachment: file }));
    };

    // ---------------- MATERIALS REQUIRED TABLE HANDLERS ----------------
    const handleMaterialFieldChange = (index, field, value) => {
        setMaterials((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    // "Add" lives inline in the same row (Action column, last row only) —
    // not as a separate button on the next line.
    const handleAddMaterialRow = () => {
        setMaterials((prev) => [...prev, EMPTY_MATERIAL_ROW()]);
    };

    const handleRemoveMaterialRow = (index) => {
        setMaterials((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    // ---------------- FETCH EXISTING PLANS ----------------
    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const token = localStorage.getItem("token");
            const endpoint = isLight
                ? "production-plan/list-light"
                : "production-plan/list-battery";

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (response.ok && data.success) setPlans(data.data || []);
            else setPlans([]);
        } catch (error) {
            console.log("Plan fetch error:", error);
            setPlans([]);
        } finally {
            setLoadingPlans(false);
        }
    };

    useEffect(() => {
        fetchPlans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.category]);

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        const bomProductRequired = [
            "warehouse",
            "product_type",
            "product_category",
            "product_name",
            "product_brand",
            "product_unit",
            "variant",
        ];
        if (bomProductRequired.some((field) => !bomProduct[field])) {
            notifyError("Please complete all required BOM product fields");
            return;
        }

        const incompleteRow = materials.some(
            (row) =>
                !row.warehouse ||
                !row.product_type ||
                !row.product_name ||
                !row.variant ||
                !row.quantity ||
                Number(row.quantity) <= 0
        );
        if (incompleteRow) {
            notifyError("Please complete all Materials Required rows before submitting");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));

            const endpoint = isLight
                ? "production-plan/create-light"
                : "production-plan/create-battery";

            // FormData is used since the BOM product block can carry a file.
            const payload = new FormData();
            payload.append("category", formData.category);

            const { attachment, ...bomProductRest } = bomProduct;
            payload.append("bom_product", JSON.stringify(bomProductRest));
            if (attachment) {
                payload.append("bom_attachment", attachment);
            }

            payload.append("materials", JSON.stringify(materials));
            payload.append("status", "DRAFT");
            payload.append("company_id", user?.company_id || "COMP001");
            payload.append("created_by", user?.name || "admin");

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // NOTE: don't set Content-Type manually for FormData,
                        // the browser sets the correct multipart boundary.
                    },
                    body: payload,
                }
            );

            const data = await response.json();

            if (response.ok) {
                notifySuccess("Production plan / work order created successfully");
                setBomProduct(INITIAL_BOM_PRODUCT);
                setMaterials([EMPTY_MATERIAL_ROW()]);
                fetchPlans();
            } else {
                notifyError(data.message || "Failed to create production plan");
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
                title="Production Plan / Work Order"
                subtitle="Create batch work orders with BOM and assign to production team"
                breadcrumbs={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Production" },
                    { label: "Production Plan" },
                ]}
            />

            <div className="card klk-form-card klk-production-form mb-4">
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
                                        className={`btn px-4 py-2 ${isLight ? "btn-primary" : "btn-outline-secondary"}`}
                                        onClick={() => handleCategoryChange("LIGHT")}
                                    >
                                        <i className="fa-solid fa-lightbulb me-2"></i> Solar Street Light
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn px-4 py-2 ${!isLight ? "btn-info" : "btn-outline-secondary"}`}
                                        onClick={() => handleCategoryChange("BATTERY")}
                                    >
                                        <i className="fa-solid fa-car-battery me-2"></i> Battery Pack
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ==================================================== */}
                        {/* ADD BILL OF MATERIALS — product master block          */}
                        {/* ==================================================== */}
                        <hr className="my-4" />
                        <h5 className="fw-bold mb-1">Add Bill of Materials</h5>
                        <p className="text-muted small mb-3">
                            The field labels marked with * are required input fields.
                        </p>

                        <div className="row">
                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Warehouse <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.warehouse}
                                        onChange={(e) => handleBomProductChange("warehouse", e.target.value)}
                                    >
                                        {WAREHOUSE_OPTIONS.map((w) => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Product Type <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.product_type}
                                        onChange={(e) => handleBomProductChange("product_type", e.target.value)}
                                    >
                                        {PRODUCT_TYPE_OPTIONS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Product Category <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.product_category}
                                        onChange={(e) => handleBomProductChange("product_category", e.target.value)}
                                    >
                                        <option value="">-- Select Category --</option>
                                        {PRODUCT_CATEGORY_OPTIONS.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Product Name <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.product_name}
                                        onChange={(e) => handleBomProductChange("product_name", e.target.value)}
                                    >
                                        <option value="">-- Select Product --</option>
                                        {PRODUCT_NAME_OPTIONS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Product Brand <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.product_brand}
                                        onChange={(e) => handleBomProductChange("product_brand", e.target.value)}
                                    >
                                        <option value="">-- Select Brand --</option>
                                        {PRODUCT_BRAND_OPTIONS.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Product Unit <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.product_unit}
                                        onChange={(e) => handleBomProductChange("product_unit", e.target.value)}
                                    >
                                        <option value="">-- Select Unit --</option>
                                        {PRODUCT_UNIT_OPTIONS.map((u) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">
                                        Select Variant <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        value={bomProduct.variant}
                                        onChange={(e) => handleBomProductChange("variant", e.target.value)}
                                    >
                                        <option value="">-- Select Variant --</option>
                                        {PRODUCT_VARIANT_OPTIONS.map((v) => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">Attach Document</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={handleBomAttachmentChange}
                                    />
                                    {bomProduct.attachment && (
                                        <small className="text-muted d-block mt-1">
                                            {bomProduct.attachment.name}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-group mb-3">
                                    <label className="form-label fw-bold">Remarks</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="Enter Remarks..."
                                        value={bomProduct.remarks}
                                        onChange={(e) => handleBomProductChange("remarks", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ==================================================== */}
                        {/* MATERIALS REQUIRED TABLE                              */}
                        {/* ==================================================== */}
                        <div className="mb-2">
                            <label className="form-label fw-bold mb-2 d-block">
                                Materials Required <span className="text-danger">*</span>
                            </label>

                            <div className="table-responsive border rounded">
                                <table className="table table-sm mb-0 align-middle">
                                    <thead className="table-secondary text-dark">
                                        <tr>
                                            <th style={{ minWidth: 160 }}>Warehouse</th>
                                            <th style={{ minWidth: 140 }}>Product Type</th>
                                            <th style={{ minWidth: 170 }}>Product Name</th>
                                            <th style={{ minWidth: 150 }}>Product Variant</th>
                                            <th style={{ minWidth: 110 }}>Quantity</th>
                                            <th style={{ width: 100 }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((row, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={row.warehouse}
                                                        onChange={(e) => handleMaterialFieldChange(index, "warehouse", e.target.value)}
                                                    >
                                                        <option value="">-- Select Warehouse --</option>
                                                        {WAREHOUSE_OPTIONS.map((w) => (
                                                            <option key={w} value={w}>{w}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={row.product_type}
                                                        onChange={(e) => handleMaterialFieldChange(index, "product_type", e.target.value)}
                                                    >
                                                        <option value="">-- Select Type --</option>
                                                        {PRODUCT_TYPE_OPTIONS.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={row.product_name}
                                                        onChange={(e) => handleMaterialFieldChange(index, "product_name", e.target.value)}
                                                    >
                                                        <option value="">-- Select Product --</option>
                                                        {PRODUCT_NAME_OPTIONS.map((p) => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={row.variant}
                                                        onChange={(e) => handleMaterialFieldChange(index, "variant", e.target.value)}
                                                    >
                                                        <option value="">-- Select Variant --</option>
                                                        {PRODUCT_VARIANT_OPTIONS.map((v) => (
                                                            <option key={v} value={v}>{v}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="form-control form-control-sm"
                                                        value={row.quantity}
                                                        onChange={(e) => handleMaterialFieldChange(index, "quantity", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleRemoveMaterialRow(index)}
                                                            disabled={materials.length === 1}
                                                            title="Remove row"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                        {/* Add button stays inline in the same row (last row only) */}
                                                        {index === materials.length - 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={handleAddMaterialRow}
                                                                title="Add row"
                                                            >
                                                                <i className="fa-solid fa-plus"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <FormSubmitButton
                                loading={loading}
                                label="Create Work Order"
                                loadingLabel="Creating..."
                            />
                        </div>

                    </form>
                </div>
            </div>

            {/* EXISTING PLANS LIST */}
            <div className="card klk-form-card">
                <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 fw-bold">
                        Recent {isLight ? "Light" : "Battery"} Work Orders
                    </h5>
                </div>
                <div className="card-body">
                    {loadingPlans && <InlineLoader message="Loading work orders..." />}

                    {!loadingPlans && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-secondary text-dark">
                                    <tr>
                                        <th>Work Order No</th>
                                        <th>Date</th>
                                        <th>Spec</th>
                                        <th>Quantity</th>
                                        <th>Priority</th>
                                        <th>Assigned Team</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">
                                                No work orders found for {isLight ? "Light" : "Battery"}.
                                            </td>
                                        </tr>
                                    ) : (
                                        plans.map((plan) => (
                                            <tr key={plan._id}>
                                                <td className="font-monospace fw-bold">{plan.work_order_no}</td>
                                                <td>{plan.date ? new Date(plan.date).toLocaleDateString() : "-"}</td>
                                                <td>{isLight ? `${plan.wattage} / ${plan.light_type}` : `${plan.chemistry} / ${plan.capacity}`}</td>
                                                <td>{plan.quantity}</td>
                                                <td>
                                                    <span className={`badge bg-${PRIORITY_BADGE[plan.priority] || "secondary"}`}>
                                                        {plan.priority}
                                                    </span>
                                                </td>
                                                <td>{plan.assigned_team?.name || "Unassigned"}</td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_BADGE[plan.status] || "secondary"}`}>
                                                        {plan.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default MaterialRequisition;