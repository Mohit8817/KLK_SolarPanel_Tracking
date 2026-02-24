import { Fragment, useState } from "react";
import PageTitle from "../../layouts/PageTitle";

const ProductionForm = () => {
    const [formData, setFormData] = useState({
        date: "",
        panel_capacity: "",
        panel_count: "",
        panel_type: "",
        project: "",
        state: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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
                                                <option value="510">510</option>
                                                <option value="520">520</option>
                                                <option value="525">525</option>
                                                <option value="530">530</option>
                                                <option value="535">535</option>
                                                <option value="540">540</option>
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
                                                <option value="1">Poly</option>
                                                <option value="2">Mono</option>                                               
                                                <option value="3">Bifacial</option>
                                            </select>
                                        </div>
                                    </div>

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
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="state"
                                                placeholder="Enter state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                            />
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
