import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";

// Components
import { ThemeContext } from "../../../context/ThemeContext";
import DropdownBlog from '../Dompet/DropdownBlog';
import PreviousTab from '../Dompet/Home/PreviousTab';
import InvoiceCard from '../Dompet/Home/InvoiceCard';
import SpendingsBlog from '../Dompet/Home/SpendingsBlog';
import QuickTransferBlog from '../Dompet/Home/QuickTransferBlog';
import CardBlog from '../Dompet/Home/CardBlog';

const PolarChart = loadable(() =>
	pMinDelay(import("../Dompet/Home/PolarChart"), 1000)
);
const ActivityApexBarGraph = loadable(() =>
	pMinDelay(import("../Dompet/Home/ActivityApexBarGraph"), 1000)
);
const TransactionApexBar = loadable(() =>
	pMinDelay(import("../Dompet/Home/TransactionApexBar"), 1000)
);

const Home = () => {
	const [checked, setChecked] = useState(true);
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);

	const {
		changeBackground,
		changePrimaryColor,
		chnageSidebarColor,
	} = useContext(ThemeContext);

	/* ================= THEME ================= */
	useEffect(() => {
		changeBackground({ value: "light", label: "Light" });
		changePrimaryColor("color_1");
		chnageSidebarColor("color_1");
	}, []);

	/* ================= FETCH DASHBOARD ================= */
	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const res = await fetch("/api/dashboard/main-dashboard");
				const data = await res.json();

				if (data.success) {
					setDashboardData(data.data);
				}
			} catch (error) {
				console.error("Dashboard Fetch Error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, []);

	/* ================= SAFE VALUES ================= */
	const totalPanels =
		dashboardData?.production?.totalPanelsProduced || 0;

	const totalDispatch =
		dashboardData?.dispatch?.totalDispatch || 0;

	const totalDamage =
		dashboardData?.damage?.totalDamage || 0;

	const generatedPercent = totalPanels
		? ((totalPanels - totalDispatch - totalDamage) / totalPanels) * 100
		: 0;

	const dispatchedPercent = totalPanels
		? (totalDispatch / totalPanels) * 100
		: 0;

	const damagedPercent = totalPanels
		? (totalDamage / totalPanels) * 100
		: 0;

	return (
		<>
			<div className="row invoice-card-row">
				<InvoiceCard />
			</div>

			<div className="row">

				{/* ================= MAIN PANEL CARD ================= */}
				<div className="col-xl-9 col-xxl-12">
					<div className="card">
						<div className="card-body">
							<div className="row align-items-center">

								{/* LEFT SIDE */}
								<div className="col-xl-6">
									<div className="card-bx bg-blue">
										<div className="card-info text-white">
											<h2 className="text-white card-balance">
												{totalPanels}
											</h2>
											<p className="fs-16">Total Panels Tracked</p>
											<span>
												Today Produced: {dashboardData?.production?.todayProduction || 0}
											</span>
										</div>
										<Link to={"#"} className="change-btn">
											<i className="fa fa-caret-up up-ico" /> Update
											<span className="reload-icon">
												<i className="fa fa-refresh reload active" />
											</span>
										</Link>
									</div>
								</div>

								{/* RIGHT SIDE */}
								<div className="col-xl-6">
									<div className="row mt-xl-0 mt-4">

										<div className="col-md-6">
											<h4 className="card-title">Panel Status Overview</h4>
											<span>
												Real-time distribution of solar panels across
												generation, dispatch, and inspection stages.
											</span>

											<ul className="card-list mt-4">
												<li>
													<span className="bg-blue circle"></span>
													Generated
													<span>{generatedPercent.toFixed(0)}%</span>
												</li>
												<li>
													<span className="bg-success circle"></span>
													Dispatched
													<span>{dispatchedPercent.toFixed(0)}%</span>
												</li>
												<li>
													<span className="bg-warning circle"></span>
													Pending Receive
													<span>
														{dashboardData?.dispatch?.pendingReceive || 0}
													</span>
												</li>
												<li>
													<span className="bg-light circle"></span>
													Damaged
													<span>{damagedPercent.toFixed(0)}%</span>
												</li>
											</ul>
										</div>

										<div className="col-md-6">
											<PolarChart data={dashboardData} />
										</div>

									</div>
								</div>

							</div>
						</div>
					</div>
				</div>

				{/* ================= PLANT ACTIVITY ================= */}
				<div className="col-xl-3 col-xxl-5">
					<div className="card">
						<div className="card-header pb-0 border-0">
							<div>
								<h4 className="card-title mb-2">Plant Activity</h4>
								<h2 className="mb-0">
									{dashboardData?.production?.totalProduction || 0}
								</h2>
							</div>
							<ul className="card-list">
								<li className="justify-content-end">
									Energy Generated
									<span className="bg-success circle me-0 ms-2"></span>
								</li>
								<li className="justify-content-end">
									Energy Dispatched
									<span className="oranger-bg circle me-0 ms-2"></span>
								</li>
							</ul>
						</div>
						<div className="card-body pb-0 pt-3">
							<div className="bar-chart flex-grow-1">
								<ActivityApexBarGraph data={dashboardData} />
							</div>
						</div>
					</div>
				</div>

				{/* ================= REMAINING COMPONENTS (UNCHANGED) ================= */}
				<div className="col-xl-3 col-xxl-7">
					<QuickTransferBlog />
				</div>

				<div className="col-xl-3 col-xxl-5">
					<SpendingsBlog />
				</div>

				<div className="col-xl-6 col-xxl-7">
					<div className="card">
						<div className="card-header d-flex flex-wrap border-0 pb-0">
							<div className="me-auto mb-sm-0 mb-3">
								<h4 className="card-title mb-2">
									Panel Movement Overview
								</h4>
								<span className="fs-12">
									Daily tracking of generated vs dispatched panels
								</span>
							</div>

							<Link
								to={"#"}
								className="btn btn-rounded btn-md btn-primary mr-3 me-3"
							>
								<i className="las la-download scale5 me-3" />
								Download Report
							</Link>

							<DropdownBlog />
						</div>

						<div className="card-body pb-2">
							<div className="d-sm-flex d-block">
								<div className="form-check toggle-switch text-end form-switch me-4">
									<input
										className="form-check-input"
										type="checkbox"
										defaultChecked={checked}
										onChange={() => setChecked(!checked)}
									/>
									<label className="form-check-label">
										Units
									</label>
								</div>

								<ul className="card-list d-flex mt-sm-0 mt-3">
									<li className="me-3">
										<span className="bg-success circle"></span>
										Panels Generated
									</li>
									<li>
										<span className="oranger-bg circle"></span>
										Panels Dispatched
									</li>
								</ul>
							</div>

							<div className="bar-chart">
								<TransactionApexBar data={dashboardData} />
							</div>
						</div>
					</div>
				</div>

				<div className="col-xl-6 col-xxl-12">
					<PreviousTab />
				</div>

				<div className="col-xl-6 col-xxl-12">
					<CardBlog />
				</div>

			</div>
		</>
	);
};

export default Home;