/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";

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
	const [dashboardData, setDashboardData] = useState(null);

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
	const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

	// Token helper
	const getToken = () => {
		return localStorage.getItem("token");
	};

	useEffect(() => {
		fetchDashboard();
	}, []);

	const fetchDashboard = async () => {
		try {
			const response = await axios.get(
				`${BASE_URL}dashboard/main-dashboard`,
				{
					headers: {
						Authorization: `Bearer ${getToken()}`
					}
				}
			);
			setDashboardData(response.data.data);

		} catch (error) {
			console.log("API ERROR:", error);
		}
	};


	/* ================= SAFE VALUES ================= */
	const totalPanelsProduced = dashboardData?.stock?.totalPanelsProduced || 0;
	const totalProduction = dashboardData?.production?.totalProduction || 0;
	const totalDispatched = dashboardData?.dispatch?.totalDispatched || 0;
	const productionDamaged = dashboardData?.damage?.productionDamaged || 0;
	const dispatchedDamaged = dashboardData?.damage?.dispatchedDamaged || 0;
	const collectedDamaged = dashboardData?.damage?.dispatchedAndCollectedDamaged || 0;
	const totalDamage = dashboardData?.damage?.totalDamage || 0;



	const currentMonth = new Date().getMonth() + 1;
	const currentYear = new Date().getFullYear();

	const currentMonthData = dashboardData?.monthWiseData?.find(
		(m) =>
			m?._id?.month === currentMonth &&
			m?._id?.year === currentYear
	);



	const getPercent = (val) =>
		totalDamage ? ((val / totalDamage) * 100).toFixed(0) : 0;


	return (
		<>
			<div className="row invoice-card-row">
				{/* Total Panels Generated */}
				<div className="col-xl-3 col-xxl-4 col-sm-4">
					<div className="card bg-primary invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								<svg width="33px" height="32px">
									<path fill="rgb(255, 255, 255)" d="M31.963,30.931 C31.818,31.160 31.609,31.342 31.363,31.455 C31.175,31.538 30.972,31.582 30.767,31.583 C30.429,31.583 30.102,31.463 29.845,31.243 L25.802,27.786 L21.758,31.243 C21.502,31.463 21.175,31.583 20.837,31.583 C20.498,31.583 20.172,31.463 19.915,31.243 L15.872,27.786 L11.829,31.243 C11.622,31.420 11.370,31.534 11.101,31.572 C10.832,31.609 10.558,31.569 10.311,31.455 C10.065,31.342 9.857,31.160 9.710,30.931 C9.565,30.703 9.488,30.437 9.488,30.167 L9.488,17.416 L2.395,17.416 C2.019,17.416 1.658,17.267 1.392,17.001 C1.126,16.736 0.976,16.375 0.976,16.000 L0.976,6.083 C0.976,4.580 1.574,3.139 2.639,2.076 C3.703,1.014 5.146,0.417 6.651,0.417 L26.511,0.417 C28.016,0.417 29.459,1.014 30.524,2.076 C31.588,3.139 32.186,4.580 32.186,6.083 L32.186,30.167 C32.186,30.437 32.109,30.703 31.963,30.931 ZM9.488,6.083 C9.488,5.332 9.189,4.611 8.657,4.080 C8.125,3.548 7.403,3.250 6.651,3.250 C5.898,3.250 5.177,3.548 4.645,4.080 C4.113,4.611 3.814,5.332 3.814,6.083 L3.814,14.583 L9.488,14.583 L9.488,6.083 ZM29.348,6.083 C29.348,5.332 29.050,4.611 28.517,4.080 C27.985,3.548 27.263,3.250 26.511,3.250 L11.559,3.250 C12.059,4.111 12.324,5.088 12.325,6.083 L12.325,27.092 L14.950,24.840 C15.207,24.620 15.534,24.500 15.872,24.500 C16.210,24.500 16.537,24.620 16.794,24.840 L20.837,28.296 L24.880,24.840 C25.137,24.620 25.463,24.500 25.802,24.500 C26.140,24.500 26.467,24.620 26.724,24.840 L29.348,27.092 L29.348,6.083 ZM25.092,20.250 L16.581,20.250 C16.205,20.250 15.844,20.101 15.578,19.835 C15.312,19.569 15.162,19.209 15.162,18.833 C15.162,18.457 15.312,18.097 15.578,17.831 C15.844,17.566 16.205,17.416 16.581,17.416 L25.092,17.416 C25.469,17.416 25.829,17.566 26.096,17.831 C26.362,18.097 26.511,18.457 26.511,18.833 C26.511,19.209 26.362,19.569 26.096,19.835 C25.829,20.101 25.469,20.250 25.092,20.250 ZM25.092,14.583 L16.581,14.583 C16.205,14.583 15.844,14.434 15.578,14.168 C15.312,13.903 15.162,13.542 15.162,13.167 C15.162,12.791 15.312,12.430 15.578,12.165 C15.844,11.899 16.205,11.750 16.581,11.750 L25.092,11.750 C25.469,11.750 25.829,11.899 26.096,12.165 C26.362,12.430 26.511,12.791 26.511,13.167 C26.511,13.542 26.362,13.903 26.096,14.168 C25.829,14.434 25.469,14.583 25.092,14.583 ZM25.092,8.916 L16.581,8.916 C16.205,8.916 15.844,8.767 15.578,8.501 C15.312,8.236 15.162,7.875 15.162,7.500 C15.162,7.124 15.312,6.764 15.578,6.498 C15.844,6.232 16.205,6.083 16.581,6.083 L25.092,6.083 C25.469,6.083 25.829,6.232 26.096,6.498 C26.362,6.764 26.511,7.124 26.511,7.500 C26.511,7.875 26.362,8.236 26.096,8.501 C25.829,8.767 25.469,8.916 25.092,8.916 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{totalPanelsProduced}</h2>
								<span className="text-white fs-18">Total Panels Generated</span>
							</div>
						</div>
					</div>
				</div>

				{/* Panels Dispatched */}
				<div className="col-xl-3 col-xxl-4 col-sm-4">
					<div className="card bg-secondary invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								<svg width="35px" height="34px">
									<path fill="rgb(255, 255, 255)"
										d="M32.482,9.730 C31.092,6.789 28.892,4.319 26.120,2.586 C22.265,0.183 17.698,-0.580 13.271,0.442 C8.843,1.458 5.074,4.140 2.668,7.990 C0.255,11.840 -0.509,16.394 0.514,20.822 C1.538,25.244 4.224,29.008 8.072,31.411 C10.785,33.104 13.896,34.000 17.080,34.000 L17.286,34.000 C20.456,33.960 23.541,33.044 26.213,31.358 C26.991,30.866 27.217,29.844 26.725,29.067 C26.234,28.291 25.210,28.065 24.432,28.556 C22.285,29.917 19.799,30.654 17.246,30.687 C14.627,30.720 12.067,29.997 9.834,28.609 C6.730,26.671 4.569,23.644 3.752,20.085 C2.934,16.527 3.546,12.863 5.486,9.763 C9.488,3.370 17.957,1.418 24.359,5.414 C26.592,6.808 28.360,8.793 29.477,11.157 C30.568,13.460 30.993,16.016 30.707,18.539 C30.607,19.448 31.259,20.271 32.177,20.371 C33.087,20.470 33.911,19.820 34.011,18.904 C34.363,15.764 33.832,12.591 32.482,9.730 L32.482,9.730 Z" />
									<path fill="rgb(255, 255, 255)"
										d="M22.593,11.237 L14.575,19.244 L11.604,16.277 C10.952,15.626 9.902,15.626 9.250,16.277 C8.599,16.927 8.599,17.976 9.250,18.627 L13.399,22.770 C13.725,23.095 14.150,23.254 14.575,23.254 C15.001,23.254 15.427,23.095 15.753,22.770 L24.940,13.588 C25.592,12.937 25.592,11.888 24.940,11.237 C24.289,10.593 23.238,10.593 22.593,11.237 L22.593,11.237 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{totalProduction}</h2>
								<span className="text-white fs-18">Total Production</span>
							</div>
						</div>
					</div>
				</div>

				{/* Pending Dispatch */}
				<div className="col-xl-3 col-xxl-4 col-sm-4">
					<div className="card bg-success  invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								<svg width="35px" height="34px">
									<path fill="rgb(255, 255, 255)"
										d="M33.002,9.728 C31.612,6.787 29.411,4.316 26.638,2.583 C22.781,0.179 18.219,-0.584 13.784,0.438 C9.356,1.454 5.585,4.137 3.178,7.989 C0.764,11.840 -0.000,16.396 1.023,20.825 C2.048,25.247 4.734,29.013 8.584,31.417 C11.297,33.110 14.409,34.006 17.594,34.006 L17.800,34.006 C20.973,33.967 24.058,33.050 26.731,31.363 C27.509,30.872 27.735,29.849 27.243,29.072 C26.751,28.296 25.727,28.070 24.949,28.561 C22.801,29.922 20.314,30.660 17.761,30.693 C15.141,30.726 12.581,30.002 10.346,28.614 C7.241,26.675 5.080,23.647 4.262,20.088 C3.444,16.515 4.056,12.850 5.997,9.748 C10.001,3.353 18.473,1.401 24.876,5.399 C27.110,6.793 28.879,8.779 29.996,11.143 C31.087,13.447 31.513,16.004 31.227,18.527 C31.126,19.437 31.778,20.260 32.696,20.360 C33.607,20.459 34.432,19.809 34.531,18.892 C34.884,15.765 34.352,12.591 33.002,9.728 L33.002,9.728 Z" />
									<path fill="rgb(255, 255, 255)"
										d="M23.380,11.236 C22.728,10.585 21.678,10.585 21.026,11.236 L17.608,14.656 L14.190,11.243 C13.539,10.592 12.488,10.592 11.836,11.243 C11.184,11.893 11.184,12.942 11.836,13.593 L15.254,17.006 L11.836,20.420 C11.184,21.071 11.184,22.120 11.836,22.770 C12.162,23.096 12.588,23.255 13.014,23.255 C13.438,23.255 13.864,23.096 14.190,22.770 L17.608,19.357 L21.026,22.770 C21.352,23.096 21.777,23.255 22.203,23.255 C22.629,23.255 23.054,23.096 23.380,22.770 C24.031,22.120 24.031,21.071 23.380,20.420 L19.962,17.000 L23.380,13.587 C24.031,12.936 24.031,11.887 23.380,11.236 L23.380,11.236 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{totalDispatched}</h2>
								<span className="text-white fs-18">Panels Dispatched</span>
							</div>
						</div>
					</div>
				</div>

				{/* Damaged Panels */}
				<div className="col-xl-3 col-xxl-3 col-sm-3">
					<div className="card bg-warning invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								{/* SVG SAME */}
								<svg width="33px" height="32px">
									<path fill="rgb(255, 255, 255)"
										d="M31.963,30.931 C31.818,31.160 31.609,31.342 31.363,31.455 C31.175,31.538 30.972,31.582 30.767,31.583 C30.429,31.583 30.102,31.463 29.845,31.243 L25.802,27.786 L21.758,31.243 C21.502,31.463 21.175,31.583 20.837,31.583 C20.498,31.583 20.172,31.463 19.915,31.243 L15.872,27.786 L11.829,31.243 C11.622,31.420 11.370,31.534 11.101,31.572 C10.832,31.609 10.558,31.569 10.311,31.455 C10.065,31.342 9.857,31.160 9.710,30.931 C9.565,30.703 9.488,30.437 9.488,30.167 L9.488,17.416 L2.395,17.416 C2.019,17.416 1.658,17.267 1.392,17.001 C1.126,16.736 0.976,16.375 0.976,16.000 L0.976,6.083 C0.976,4.580 1.574,3.139 2.639,2.076 C3.703,1.014 5.146,0.417 6.651,0.417 L26.511,0.417 C28.016,0.417 29.459,1.014 30.524,2.076 C31.588,3.139 32.186,4.580 32.186,6.083 L32.186,30.167 C32.186,30.437 32.109,30.703 31.963,30.931 ZM9.488,6.083 C9.488,5.332 9.189,4.611 8.657,4.080 C8.125,3.548 7.403,3.250 6.651,3.250 C5.898,3.250 5.177,3.548 4.645,4.080 C4.113,4.611 3.814,5.332 3.814,6.083 L3.814,14.583 L9.488,14.583 L9.488,6.083 ZM29.348,6.083 C29.348,5.332 29.050,4.611 28.517,4.080 C27.985,3.548 27.263,3.250 26.511,3.250 L11.559,3.250 C12.059,4.111 12.324,5.088 12.325,6.083 L12.325,27.092 L14.950,24.840 C15.207,24.620 15.534,24.500 15.872,24.500 C16.210,24.500 16.537,24.620 16.794,24.840 L20.837,28.296 L24.880,24.840 C25.137,24.620 25.463,24.500 25.802,24.500 C26.140,24.500 26.467,24.620 26.724,24.840 L29.348,27.092 L29.348,6.083 ZM25.092,20.250 L16.581,20.250 C16.205,20.250 15.844,20.101 15.578,19.835 C15.312,19.569 15.162,19.209 15.162,18.833 C15.162,18.457 15.312,18.097 15.578,17.831 C15.844,17.566 16.205,17.416 16.581,17.416 L25.092,17.416 C25.469,17.416 25.829,17.566 26.096,17.831 C26.362,18.097 26.511,18.457 26.511,18.833 C26.511,19.209 26.362,19.569 26.096,19.835 C25.829,20.101 25.469,20.250 25.092,20.250 ZM25.092,14.583 L16.581,14.583 C16.205,14.583 15.844,14.434 15.578,14.168 C15.312,13.903 15.162,13.542 15.162,13.167 C15.162,12.791 15.312,12.430 15.578,12.165 C15.844,11.899 16.205,11.750 16.581,11.750 L25.092,11.750 C25.469,11.750 25.829,11.899 26.096,12.165 C26.362,12.430 26.511,12.791 26.511,13.167 C26.511,13.542 26.362,13.903 26.096,14.168 C25.829,14.434 25.469,14.583 25.092,14.583 ZM25.092,8.916 L16.581,8.916 C16.205,8.916 15.844,8.767 15.578,8.501 C15.312,8.236 15.162,7.875 15.162,7.500 C15.162,7.124 15.312,6.764 15.578,6.498 C15.844,6.232 16.205,6.083 16.581,6.083 L25.092,6.083 C25.469,6.083 25.829,6.232 26.096,6.498 C26.362,6.764 26.511,7.124 26.511,7.500 C26.511,7.875 26.362,8.236 26.096,8.501 C25.829,8.767 25.469,8.916 25.092,8.916 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{totalDamage}</h2>
								<span className="text-white fs-18">Damaged Panels Reported</span>
							</div>
						</div>
					</div>
				</div>


				{/* production damage  */}

				<div className="col-xl-3 col-xxl-3 col-sm-3">
					<div className="card bg-info invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								{/* SVG SAME */}
								<svg width="33px" height="32px">
									<path fill="rgb(255, 255, 255)"
										d="M31.963,30.931 C31.818,31.160 31.609,31.342 31.363,31.455 C31.175,31.538 30.972,31.582 30.767,31.583 C30.429,31.583 30.102,31.463 29.845,31.243 L25.802,27.786 L21.758,31.243 C21.502,31.463 21.175,31.583 20.837,31.583 C20.498,31.583 20.172,31.463 19.915,31.243 L15.872,27.786 L11.829,31.243 C11.622,31.420 11.370,31.534 11.101,31.572 C10.832,31.609 10.558,31.569 10.311,31.455 C10.065,31.342 9.857,31.160 9.710,30.931 C9.565,30.703 9.488,30.437 9.488,30.167 L9.488,17.416 L2.395,17.416 C2.019,17.416 1.658,17.267 1.392,17.001 C1.126,16.736 0.976,16.375 0.976,16.000 L0.976,6.083 C0.976,4.580 1.574,3.139 2.639,2.076 C3.703,1.014 5.146,0.417 6.651,0.417 L26.511,0.417 C28.016,0.417 29.459,1.014 30.524,2.076 C31.588,3.139 32.186,4.580 32.186,6.083 L32.186,30.167 C32.186,30.437 32.109,30.703 31.963,30.931 ZM9.488,6.083 C9.488,5.332 9.189,4.611 8.657,4.080 C8.125,3.548 7.403,3.250 6.651,3.250 C5.898,3.250 5.177,3.548 4.645,4.080 C4.113,4.611 3.814,5.332 3.814,6.083 L3.814,14.583 L9.488,14.583 L9.488,6.083 ZM29.348,6.083 C29.348,5.332 29.050,4.611 28.517,4.080 C27.985,3.548 27.263,3.250 26.511,3.250 L11.559,3.250 C12.059,4.111 12.324,5.088 12.325,6.083 L12.325,27.092 L14.950,24.840 C15.207,24.620 15.534,24.500 15.872,24.500 C16.210,24.500 16.537,24.620 16.794,24.840 L20.837,28.296 L24.880,24.840 C25.137,24.620 25.463,24.500 25.802,24.500 C26.140,24.500 26.467,24.620 26.724,24.840 L29.348,27.092 L29.348,6.083 ZM25.092,20.250 L16.581,20.250 C16.205,20.250 15.844,20.101 15.578,19.835 C15.312,19.569 15.162,19.209 15.162,18.833 C15.162,18.457 15.312,18.097 15.578,17.831 C15.844,17.566 16.205,17.416 16.581,17.416 L25.092,17.416 C25.469,17.416 25.829,17.566 26.096,17.831 C26.362,18.097 26.511,18.457 26.511,18.833 C26.511,19.209 26.362,19.569 26.096,19.835 C25.829,20.101 25.469,20.250 25.092,20.250 ZM25.092,14.583 L16.581,14.583 C16.205,14.583 15.844,14.434 15.578,14.168 C15.312,13.903 15.162,13.542 15.162,13.167 C15.162,12.791 15.312,12.430 15.578,12.165 C15.844,11.899 16.205,11.750 16.581,11.750 L25.092,11.750 C25.469,11.750 25.829,11.899 26.096,12.165 C26.362,12.430 26.511,12.791 26.511,13.167 C26.511,13.542 26.362,13.903 26.096,14.168 C25.829,14.434 25.469,14.583 25.092,14.583 ZM25.092,8.916 L16.581,8.916 C16.205,8.916 15.844,8.767 15.578,8.501 C15.312,8.236 15.162,7.875 15.162,7.500 C15.162,7.124 15.312,6.764 15.578,6.498 C15.844,6.232 16.205,6.083 16.581,6.083 L25.092,6.083 C25.469,6.083 25.829,6.232 26.096,6.498 C26.362,6.764 26.511,7.124 26.511,7.500 C26.511,7.875 26.362,8.236 26.096,8.501 C25.829,8.767 25.469,8.916 25.092,8.916 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{productionDamaged}</h2>
								<span className="text-white fs-18">Production Damaged</span>
							</div>
						</div>
					</div>
				</div>

				<div className="col-xl-3 col-xxl-3 col-sm-3">
					<div className="card bg-light-green invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								{/* SVG SAME */}
								<svg width="33px" height="32px">
									<path fill="rgb(255, 255, 255)"
										d="M31.963,30.931 C31.818,31.160 31.609,31.342 31.363,31.455 C31.175,31.538 30.972,31.582 30.767,31.583 C30.429,31.583 30.102,31.463 29.845,31.243 L25.802,27.786 L21.758,31.243 C21.502,31.463 21.175,31.583 20.837,31.583 C20.498,31.583 20.172,31.463 19.915,31.243 L15.872,27.786 L11.829,31.243 C11.622,31.420 11.370,31.534 11.101,31.572 C10.832,31.609 10.558,31.569 10.311,31.455 C10.065,31.342 9.857,31.160 9.710,30.931 C9.565,30.703 9.488,30.437 9.488,30.167 L9.488,17.416 L2.395,17.416 C2.019,17.416 1.658,17.267 1.392,17.001 C1.126,16.736 0.976,16.375 0.976,16.000 L0.976,6.083 C0.976,4.580 1.574,3.139 2.639,2.076 C3.703,1.014 5.146,0.417 6.651,0.417 L26.511,0.417 C28.016,0.417 29.459,1.014 30.524,2.076 C31.588,3.139 32.186,4.580 32.186,6.083 L32.186,30.167 C32.186,30.437 32.109,30.703 31.963,30.931 ZM9.488,6.083 C9.488,5.332 9.189,4.611 8.657,4.080 C8.125,3.548 7.403,3.250 6.651,3.250 C5.898,3.250 5.177,3.548 4.645,4.080 C4.113,4.611 3.814,5.332 3.814,6.083 L3.814,14.583 L9.488,14.583 L9.488,6.083 ZM29.348,6.083 C29.348,5.332 29.050,4.611 28.517,4.080 C27.985,3.548 27.263,3.250 26.511,3.250 L11.559,3.250 C12.059,4.111 12.324,5.088 12.325,6.083 L12.325,27.092 L14.950,24.840 C15.207,24.620 15.534,24.500 15.872,24.500 C16.210,24.500 16.537,24.620 16.794,24.840 L20.837,28.296 L24.880,24.840 C25.137,24.620 25.463,24.500 25.802,24.500 C26.140,24.500 26.467,24.620 26.724,24.840 L29.348,27.092 L29.348,6.083 ZM25.092,20.250 L16.581,20.250 C16.205,20.250 15.844,20.101 15.578,19.835 C15.312,19.569 15.162,19.209 15.162,18.833 C15.162,18.457 15.312,18.097 15.578,17.831 C15.844,17.566 16.205,17.416 16.581,17.416 L25.092,17.416 C25.469,17.416 25.829,17.566 26.096,17.831 C26.362,18.097 26.511,18.457 26.511,18.833 C26.511,19.209 26.362,19.569 26.096,19.835 C25.829,20.101 25.469,20.250 25.092,20.250 ZM25.092,14.583 L16.581,14.583 C16.205,14.583 15.844,14.434 15.578,14.168 C15.312,13.903 15.162,13.542 15.162,13.167 C15.162,12.791 15.312,12.430 15.578,12.165 C15.844,11.899 16.205,11.750 16.581,11.750 L25.092,11.750 C25.469,11.750 25.829,11.899 26.096,12.165 C26.362,12.430 26.511,12.791 26.511,13.167 C26.511,13.542 26.362,13.903 26.096,14.168 C25.829,14.434 25.469,14.583 25.092,14.583 ZM25.092,8.916 L16.581,8.916 C16.205,8.916 15.844,8.767 15.578,8.501 C15.312,8.236 15.162,7.875 15.162,7.500 C15.162,7.124 15.312,6.764 15.578,6.498 C15.844,6.232 16.205,6.083 16.581,6.083 L25.092,6.083 C25.469,6.083 25.829,6.232 26.096,6.498 C26.362,6.764 26.511,7.124 26.511,7.500 C26.511,7.875 26.362,8.236 26.096,8.501 C25.829,8.767 25.469,8.916 25.092,8.916 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{dispatchedDamaged}</h2>
								<span className="text-white fs-16">Dispatch Damaged</span>
							</div>
						</div>
					</div>
				</div>

				{/* collection damage	 */}
				<div className="col-xl-3 col-xxl-3 col-sm-3">
					<div className="card bg-orange invoice-card">
						<div className="card-body d-flex">
							<div className="icon me-3">
								{/* SVG SAME */}
								<svg width="33px" height="32px">
									<path fill="rgb(255, 255, 255)"
										d="M31.963,30.931 C31.818,31.160 31.609,31.342 31.363,31.455 C31.175,31.538 30.972,31.582 30.767,31.583 C30.429,31.583 30.102,31.463 29.845,31.243 L25.802,27.786 L21.758,31.243 C21.502,31.463 21.175,31.583 20.837,31.583 C20.498,31.583 20.172,31.463 19.915,31.243 L15.872,27.786 L11.829,31.243 C11.622,31.420 11.370,31.534 11.101,31.572 C10.832,31.609 10.558,31.569 10.311,31.455 C10.065,31.342 9.857,31.160 9.710,30.931 C9.565,30.703 9.488,30.437 9.488,30.167 L9.488,17.416 L2.395,17.416 C2.019,17.416 1.658,17.267 1.392,17.001 C1.126,16.736 0.976,16.375 0.976,16.000 L0.976,6.083 C0.976,4.580 1.574,3.139 2.639,2.076 C3.703,1.014 5.146,0.417 6.651,0.417 L26.511,0.417 C28.016,0.417 29.459,1.014 30.524,2.076 C31.588,3.139 32.186,4.580 32.186,6.083 L32.186,30.167 C32.186,30.437 32.109,30.703 31.963,30.931 ZM9.488,6.083 C9.488,5.332 9.189,4.611 8.657,4.080 C8.125,3.548 7.403,3.250 6.651,3.250 C5.898,3.250 5.177,3.548 4.645,4.080 C4.113,4.611 3.814,5.332 3.814,6.083 L3.814,14.583 L9.488,14.583 L9.488,6.083 ZM29.348,6.083 C29.348,5.332 29.050,4.611 28.517,4.080 C27.985,3.548 27.263,3.250 26.511,3.250 L11.559,3.250 C12.059,4.111 12.324,5.088 12.325,6.083 L12.325,27.092 L14.950,24.840 C15.207,24.620 15.534,24.500 15.872,24.500 C16.210,24.500 16.537,24.620 16.794,24.840 L20.837,28.296 L24.880,24.840 C25.137,24.620 25.463,24.500 25.802,24.500 C26.140,24.500 26.467,24.620 26.724,24.840 L29.348,27.092 L29.348,6.083 ZM25.092,20.250 L16.581,20.250 C16.205,20.250 15.844,20.101 15.578,19.835 C15.312,19.569 15.162,19.209 15.162,18.833 C15.162,18.457 15.312,18.097 15.578,17.831 C15.844,17.566 16.205,17.416 16.581,17.416 L25.092,17.416 C25.469,17.416 25.829,17.566 26.096,17.831 C26.362,18.097 26.511,18.457 26.511,18.833 C26.511,19.209 26.362,19.569 26.096,19.835 C25.829,20.101 25.469,20.250 25.092,20.250 ZM25.092,14.583 L16.581,14.583 C16.205,14.583 15.844,14.434 15.578,14.168 C15.312,13.903 15.162,13.542 15.162,13.167 C15.162,12.791 15.312,12.430 15.578,12.165 C15.844,11.899 16.205,11.750 16.581,11.750 L25.092,11.750 C25.469,11.750 25.829,11.899 26.096,12.165 C26.362,12.430 26.511,12.791 26.511,13.167 C26.511,13.542 26.362,13.903 26.096,14.168 C25.829,14.434 25.469,14.583 25.092,14.583 ZM25.092,8.916 L16.581,8.916 C16.205,8.916 15.844,8.767 15.578,8.501 C15.312,8.236 15.162,7.875 15.162,7.500 C15.162,7.124 15.312,6.764 15.578,6.498 C15.844,6.232 16.205,6.083 16.581,6.083 L25.092,6.083 C25.469,6.083 25.829,6.232 26.096,6.498 C26.362,6.764 26.511,7.124 26.511,7.500 C26.511,7.875 26.362,8.236 26.096,8.501 C25.829,8.767 25.469,8.916 25.092,8.916 Z" />
								</svg>
							</div>
							<div>
								<h2 className="text-white invoice-num">{collectedDamaged}</h2>
								<span className="text-white fs-16">Collected Damaged</span>
							</div>
						</div>
					</div>
				</div>




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
												{dashboardData?.stock?.totalPanelsProduced || 0}
											</h2>
											<p className="fs-16">Total Panels Tracked</p>
											<span>
												Today Produced: {dashboardData?.production?.todayProduction || 0}
											</span>
										</div>
										<Link to={"/"} className="change-btn">
											<i className="fa fa-caret-up up-ico" /> Update
											<span className="reload-icon">
												<i className="fa fa-refresh reload active" />
											</span>
										</Link>
									</div>
								</div>

								{/* RIGHT SIDE */}
								<div className="col-xl-6">
									<div>
										<h4 className="card-title">Panel Status Overview</h4>
										<span>
											Real-time distribution of solar panels across generation, dispatch, and inspection stages.
										</span>
									</div>
									<div className="row mt-xl-0 mt-4">

										<div className="col-md-6">

											<ul className="card-list mt-4">
												<li>
													<span className="bg-blue circle"></span>
													Production
													<span>{dashboardData?.production?.totalProduction || 0}</span>
												</li>
												<li>
													<span className="bg-success circle"></span>
													Dispatched
													<span>{dashboardData?.dispatch?.totalDispatched || 0}</span>
												</li>
												<li>
													<span className="bg-warning circle"></span>
													In Stock
													<span>{dashboardData?.stock?.inStock || 0}</span>
												</li>
												<li>
													<span className="bg-light circle"></span>
													Damaged
													<span>{dashboardData?.damage?.totalDamage || 0}</span>
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
				<div className="col-xl-12 col-xxl-12">
					<div className="card">
						<div className="card-header pb-0 border-0">
							<div>
								<h4 className="card-title mb-2">panel Activity</h4>
							</div>
							<ul className="card-list d-flex align-items-center mb-0 gap-3">

								<li>
									<span className="bg-success circle me-1 ms-2"></span>
									Panels Produced :
									{currentMonthData?.totalGenerated || 0}
								</li>

								<li>
									<span className="oranger-bg circle me-1 ms-2"></span>
									Total Production :
									{currentMonthData?.totalProduction || 0}
								</li>

								<li>
									<span style={{ backgroundColor: "#2196F3" }} className="circle me-1 ms-2"></span>
									Total Dispatched :
									{currentMonthData?.totalDispatched || 0}
								</li>

								<li>
									<span style={{ backgroundColor: "#F44336" }} className="circle me-1 ms-2"></span>
									Total Damage :
									{currentMonthData?.totalDamage || 0}
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

				{/* ================= Operational COMPONENTS  ================= */}


				<div className="col-xl-3 col-xxl-5">
					<div className="card">
						<div className="card-header border-0 pb-0">
							<div>
								<h4 className="card-title mb-2">ALL Damage panels</h4>
								<span className="fs-12">
									Current progress of solar panel operations
								</span>
							</div>
						</div>

						<div className="card-body">

							{/* Production Damage */}
							<div className="progress default-progress">
								<div
									className="progress-bar bg-danger progress-animated"
									style={{ width: `${getPercent(productionDamaged)}%`, height: "20px" }}
								/>
							</div>
							<div className="d-flex justify-content-between mt-2 pb-3">
								<span>Production Damage</span>
								<span className="fs-18">
									<span className="text-black pe-2">{productionDamaged}</span>/{totalDamage}
								</span>
							</div>

							{/* Dispatched Damage */}
							<div className="progress default-progress mt-4">
								<div
									className="progress-bar bg-warning progress-animated"
									style={{ width: `${getPercent(dispatchedDamaged)}%`, height: "20px" }}
								/>
							</div>
							<div className="d-flex justify-content-between mt-2 pb-3">
								<span>Dispatched Damage</span>
								<span className="fs-18">
									<span className="text-black pe-2">{dispatchedDamaged}</span>/{totalDamage}
								</span>
							</div>

							{/* Collected Damage */}
							<div className="progress default-progress mt-4">
								<div
									className="progress-bar bg-info progress-animated"
									style={{ width: `${getPercent(collectedDamaged)}%`, height: "20px" }}
								/>
							</div>
							<div className="d-flex justify-content-between mt-2 pb-3">
								<span>Collected Damage</span>
								<span className="fs-18">
									<span className="text-black pe-2">{collectedDamaged}</span>/{totalDamage}
								</span>
							</div>

							{/* Total Damage */}
							<div className="progress default-progress mt-4">
								<div
									className="progress-bar bg-dark progress-animated"
									style={{ width: `100%`, height: "20px" }}
								/>
							</div>
							<div className="d-flex justify-content-between mt-2">
								<span>Total Damage</span>
								<span className="fs-18">
									<span className="text-black pe-2">{totalDamage}</span> Units
								</span>
							</div>

						</div>

				
					</div>
				</div>

				<div className="col-xl-6 col-xxl-7">
					<div className="card">
						<div className="card-header d-flex flex-wrap border-0 pb-0">
							<div className="me-auto mb-sm-0 mb-3">
								<h4 className="card-title mb-2">
									Monthly Panel  Overview

								</h4>
								<span className="fs-12">
									Month-wise generated vs dispatched panels
								</span>
							</div>
				
						</div>

						<div className="card-body pb-2">
							<div className="d-sm-flex d-block">


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
								<TransactionApexBar data={dashboardData?.monthWiseData || []} /> 
							</div>
						</div>
					</div>
				</div>


				{/* table data  */}


				<div className="col-xl-6 col-xxl-12">
					<div className="card">

						<div className="card-header border-0">
							<div>
								<h4 className="card-title mb-2">Panel Capacity Details</h4>
								<span className="fs-12">
									Complete panel production, dispatch & damage data
								</span>
							</div>
						</div>

						<div className="card-body p-0">
							<div className="table-responsive">
								<table className="table table-responsive-md card-table transactions-table">

									<thead>
										<tr>
											<th>Capacity</th>
											<th>Total</th>
											<th>Produced</th>
											<th>Prod Damaged</th>
											<th>Dispatched</th>
											<th>Dispatch Damaged</th>
											<th>Not Collected</th>
											<th>Collected</th>
											<th>Collected Damaged</th>
											<th>Total Damage</th>
										</tr>
									</thead>

									<tbody>
										{dashboardData?.panelCapacityWise?.map((item, index) => (
											<tr key={index}>

												<td>
													<h6 className="fs-16 font-w600 mb-0">
														{item._id} W
													</h6>
													<span className="fs-12 text-muted">Capacity</span>
												</td>

												<td>{item.total}</td>
												<td>{item.totalProduced}</td>
												<td className="text-danger">{item.productionDamaged}</td>
												<td>{item.totalDispatched}</td>
												<td className="text-danger">{item.DispatchedDamaged}</td>
												<td>{item.dispatchedNotCollected}</td>
												<td>{item.dispatchedAndCollected}</td>
												<td className="text-danger">{item.dispatchedAndCollectedDamaged}</td>
												<td className="text-danger fw-bold">{item.totalDamage}</td>

											</tr>
										))}
									</tbody>

								</table>
							</div>
						</div>

					</div>
				</div>



				{/* <div className="col-xl-6 col-xxl-12">
					<div className="row">
						<div className="col-xl-12">
							<div className="card coin-card">
								<div className="card-body d-sm-flex d-block align-items-center">
									<span className="coin-icon">
										<svg width="38" height="41" viewBox="0 0 38 41" fill="none" xmlns="http://www.w3.org/2000/svg">
											<g>
												<path d="M14.0413 32.5832C15.7416 32.5934 17.4269 32.2659 18.9997 31.6199C20.5708 32.2714 22.2572 32.5991 23.958 32.5832C29.1218 32.5832 33.1663 29.8278 33.1663 26.3088V20.441C33.1663 16.922 29.1218 14.1666 23.958 14.1666C23.7186 14.1666 23.4834 14.1779 23.2497 14.1906V7.55498C23.2497 4.10823 19.2051 1.41656 14.0413 1.41656C8.87759 1.41656 4.83301 4.10823 4.83301 7.55498V26.4448C4.83301 29.8916 8.87759 32.5832 14.0413 32.5832ZM30.333 26.3088C30.333 27.9366 27.715 29.7499 23.958 29.7499C20.201 29.7499 17.583 27.9366 17.583 26.3088V24.9984C19.5015 26.1652 21.7131 26.7604 23.958 26.714C26.203 26.7604 28.4145 26.1652 30.333 24.9984V26.3088ZM23.958 16.9999C27.715 16.9999 30.333 18.8132 30.333 20.441C30.333 22.0687 27.715 23.8807 23.958 23.8807C20.201 23.8807 17.583 22.0673 17.583 20.441C17.583 18.8147 20.201 16.9999 23.958 16.9999ZM14.0413 4.2499C17.7983 4.2499 20.4163 5.9924 20.4163 7.55498C20.4163 9.11757 17.7983 10.8615 14.0413 10.8615C10.2843 10.8615 7.66634 9.11898 7.66634 7.55498C7.66634 5.99098 10.2843 4.2499 14.0413 4.2499Z" fill="#fff"></path>
											</g>
										</svg>
									</span>
									<div>
										<h3 className="text-white">Solar Tracker Dashboard</h3>
										<p>Monitor real-time performance of your solar panels, track energy output, and optimize sunlight capture for maximum efficiency.</p>
										<Link to={"#"} className="text-white">Learn more {`>>`}</Link>
									</div>
								</div>
							</div>
						</div>

						<div className="col-md-6">
							<div className="card progress-card">
								<div className="card-body d-flex">
									<div className="me-auto">
										<h4 className="card-title">Total Energy Generated</h4>
										<div className="d-flex align-items-center">
											<h2 className="fs-38 mb-0">12,340 kWh</h2>
											<div className="text-success transaction-caret">
												<i className="fa fa-sort-asc"></i>
												<p className="mb-0">+4.2%</p>
											</div>
										</div>
									</div>
									<div className="progress progress-vertical-bottom" style={{ minHeight: "110px", minWidth: "10px" }}>
										<div className="progress-bar bg-warning" style={{ width: "10px", height: "40%" }} role="progressbar">
											<span className="sr-only">40% Complete</span>
										</div>
									</div>
									<div className="progress progress-vertical-bottom" style={{ minHeight: "110px", minWidth: "10px" }}>
										<div className="progress-bar bg-warning" style={{ width: "10px", height: "55%" }} role="progressbar">
											<span className="sr-only">55% Complete</span>
										</div>
									</div>
									<div className="progress progress-vertical-bottom" style={{ minHeight: "110px", minWidth: "10px" }}>
										<div className="progress-bar bg-warning" style={{ width: "10px", height: "80%" }} role="progressbar">
											<span className="sr-only">80% Complete</span>
										</div>
									</div>
									<div className="progress progress-vertical-bottom" style={{ minHeight: "110px", minWidth: "10px" }}>
										<div className="progress-bar bg-warning" style={{ width: "10px", height: "50%" }} role="progressbar">
											<span className="sr-only">50% Complete</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="col-md-6">
							<div className="card">
								<div className="card-body">
									<h4 className="card-title">Panel Efficiency</h4>
									<div className="d-flex align-items-center">
										<div className="me-auto">
											<div className="progress mt-4" style={{ height: "10px" }}>
												<div className="progress-bar bg-warning progress-animated" style={{ width: "72%", height: "10px" }} role="progressbar">
													<span className="sr-only">72% Complete</span>
												</div>
											</div>
											<p className="fs-16 mb-0 mt-2"><span className="text-success">+3% </span>from last week</p>
										</div>
										<h2 className="fs-38">72%</h2>
									</div>
								</div>
							</div>
						</div>

						<div className="col-sm-6">
							<div className="card">
								<div className="card-body">
									<h4 className="card-title mt-2">Sunlight Exposure</h4>
									<div className="d-flex align-items-center mt-3 mb-2">
										<h2 className="fs-38 mb-0 me-3">8.5 hrs</h2>
										<span className="badge badge-success">+0.8%</span>
									</div>
								</div>
							</div>
						</div>

						<div className="col-sm-6">
							<div className="card">
								<div className="card-body">
									<h4 className="card-title mt-2">Operational Panels</h4>
									<div className="d-flex align-items-center mt-3 mb-2">
										<h2 className="fs-38 mb-0 me-3">146</h2>
										<span className="badge badge-danger">-1.5%</span>
									</div>
								</div>
							</div>
						</div>

					</div>
				</div> */}

			</div>	
		</>
	);
};

export default Home;