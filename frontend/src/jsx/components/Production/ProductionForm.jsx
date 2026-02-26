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
                                             <option value="50">50</option>
                                            <option value="55">55</option>
                                            <option value="60">60</option>
                                            <option value="65">65</option>
                                            <option value="70">70</option>
                                            <option value="75">75</option>
                                            <option value="80">80</option>
                                            <option value="85">85</option>
                                            <option value="90">90</option>
                                            <option value="95">95</option>
                                            <option value="100">100</option>
                                            <option value="105">105</option>
                                            <option value="110">110</option>
                                            <option value="115">115</option>
                                            <option value="120">120</option>
                                            <option value="125">125</option>
                                            <option value="130">130</option>
                                            <option value="135">135</option>
                                            <option value="140">140</option>
                                            <option value="145">145</option>
                                            <option value="150">150</option>
                                            <option value="155">155</option>
                                            <option value="160">160</option>
                                            <option value="165">165</option>
                                            <option value="170">170</option>
                                            <option value="175">175</option>
                                            <option value="180">180</option>
                                            <option value="185">185</option>
                                            <option value="190">190</option>
                                            <option value="195">195</option>
                                            <option value="200">200</option>
                                            <option value="205">205</option>
                                            <option value="210">210</option>
                                            <option value="215">215</option>
                                            <option value="220">220</option>
                                            <option value="225">225</option>
                                            <option value="230">230</option>
                                            <option value="235">235</option>
                                            <option value="240">240</option>
                                            <option value="245">245</option>
                                            <option value="250">250</option>
                                            <option value="255">255</option>
                                            <option value="260">260</option>
                                            <option value="265">265</option>
                                            <option value="270">270</option>
                                            <option value="275">275</option>
                                            <option value="280">280</option>
                                            <option value="285">285</option>
                                            <option value="290">290</option>
                                            <option value="295">295</option>
                                            <option value="300">300</option>
                                            <option value="305">305</option>
                                            <option value="310">310</option>
                                            <option value="315">315</option>
                                            <option value="320">320</option>
                                            <option value="325">325</option>
                                            <option value="330">330</option>
                                            <option value="335">335</option>
                                            <option value="340">340</option>
                                            <option value="345">345</option>
                                            <option value="350">350</option>
                                            <option value="355">355</option>
                                            <option value="360">360</option>
                                            <option value="365">365</option>
                                            <option value="370">370</option>
                                            <option value="375">375</option>
                                            <option value="380">380</option>
                                            <option value="385">385</option>
                                            <option value="390">390</option>
                                            <option value="395">395</option>
                                            <option value="400">400</option>
                                            <option value="405">405</option>
                                            <option value="410">410</option>
                                            <option value="415">415</option>
                                            <option value="420">420</option>
                                            <option value="425">425</option>
                                            <option value="430">430</option>
                                            <option value="435">435</option>
                                            <option value="440">440</option>
                                            <option value="445">445</option>
                                            <option value="450">450</option>
                                            <option value="455">455</option>
                                            <option value="460">460</option>
                                            <option value="465">465</option>
                                            <option value="470">470</option>
                                            <option value="475">475</option>
                                            <option value="480">480</option>
                                            <option value="485">485</option>
                                            <option value="490">490</option>
                                            <option value="495">495</option>
                                            <option value="500">500</option>
                                            <option value="505">505</option>
                                            <option value="510">510</option>
                                            <option value="515">515</option>
                                            <option value="520">520</option>
                                            <option value="525">525</option>
                                            <option value="530">530</option>
                                            <option value="535">535</option>
                                            <option value="540">540</option>
                                            <option value="545">545</option>
                                            <option value="550">550</option>
                                            <option value="555">555</option>
                                            <option value="560">560</option>
                                            <option value="565">565</option>
                                            <option value="570">570</option>
                                            <option value="575">575</option>
                                            <option value="580">580</option>
                                            <option value="585">585</option>
                                            <option value="590">590</option>
                                            <option value="595">595</option>
                                            <option value="600">600</option>
                                            <option value="605">605</option>
                                            <option value="610">610</option>
                                            <option value="615">615</option>
                                            <option value="620">620</option>
                                            <option value="625">625</option>
                                            <option value="630">630</option>
                                            <option value="635">635</option>
                                            <option value="640">640</option>
                                            <option value="645">645</option>
                                            <option value="650">650</option>
                                            <option value="655">655</option>
                                            <option value="660">660</option>
                                            <option value="665">665</option>
                                            <option value="670">670</option>
                                            <option value="675">675</option>
                                            <option value="680">680</option>
                                            <option value="685">685</option>
                                            <option value="690">690</option>
                                            <option value="695">695</option>
                                            <option value="700">700</option>
                                            <option value="705">705</option>
                                            <option value="710">710</option>
                                            <option value="715">715</option>
                                            <option value="720">720</option>
                                            <option value="725">725</option>
                                            <option value="730">730</option>
                                            <option value="735">735</option>
                                            <option value="740">740</option>
                                            <option value="745">745</option>
                                            <option value="750">750</option>
                                            <option value="755">755</option>
                                            <option value="760">760</option>
                                            <option value="765">765</option>
                                            <option value="770">770</option>
                                            <option value="775">775</option>
                                            <option value="780">780</option>
                                            <option value="785">785</option>
                                            <option value="790">790</option>
                                            <option value="795">795</option>
                                            <option value="800">800</option>
                                            <option value="805">805</option>
                                            <option value="810">810</option>
                                            <option value="815">815</option>
                                            <option value="820">820</option>
                                            <option value="825">825</option>
                                            <option value="830">830</option>
                                            <option value="835">835</option>
                                            <option value="840">840</option>
                                            <option value="845">845</option>
                                            <option value="850">850</option>
                                            <option value="855">855</option>
                                            <option value="860">860</option>
                                            <option value="865">865</option>
                                            <option value="870">870</option>
                                            <option value="875">875</option>
                                            <option value="880">880</option>
                                            <option value="885">885</option>
                                            <option value="890">890</option>
                                            <option value="895">895</option>
                                            <option value="900">900</option>
                                            <option value="905">905</option>
                                            <option value="910">910</option>
                                            <option value="915">915</option>
                                            <option value="920">920</option>
                                            <option value="925">925</option>
                                            <option value="930">930</option>
                                            <option value="935">935</option>
                                            <option value="940">940</option>
                                            <option value="945">945</option>
                                            <option value="950">950</option>
                                            <option value="955">955</option>
                                            <option value="960">960</option>
                                            <option value="965">965</option>
                                            <option value="970">970</option>
                                            <option value="975">975</option>
                                            <option value="980">980</option>
                                            <option value="985">985</option>
                                            <option value="990">990</option>
                                            <option value="995">995</option>
                                            <option value="1000">1000</option>
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
