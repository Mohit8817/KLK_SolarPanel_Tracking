import { Link } from 'react-router-dom';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { Dropdown } from 'react-bootstrap';
import { Tab, Nav, Accordion } from 'react-bootstrap';

//Images
import circle from './../../../assets/images/pattern/circle.png';
import avatar1 from './../../../assets/images/avatar/1.jpg';
import avatar2 from './../../../assets/images/avatar/2.jpg';
import avatar3 from './../../../assets/images/avatar/3.jpg';
import avatar4 from './../../../assets/images/avatar/4.jpg';
import avatar5 from './../../../assets/images/avatar/5.jpg';

import { AccordionBlog1, AccordionBlog2, AccordionBlog3 } from '../Dompet/MyWallet/TabData';

const WeeklyPieChart = loadable(() =>
	pMinDelay(import("../Dompet/MyWallet/WeeklyPieChart"), 1000)
);
const WeeklyApexChart = loadable(() =>
	pMinDelay(import("../Dompet/MyWallet/WeeklyApexChart"), 1000)
);


const MyWallet = () => {

	return (
		<>
			<div className="row">
				<div className="col-xl-9 col-xxl-12">
					<div className="row">
						<div className="col-xl-12">
							<div className="card">
								<div className="card-header flex-wrap border-0 pb-0 align-items-end">
									<div className="mb-3 me-3">
										<h5 className="fs-20 text-black font-w500">Main Balance</h5>
										<span className="text-num text-black fs-36 font-w500">$673,412.66</span>
									</div>
									<div className="me-3 mb-3">
										<p className="fs-14 mb-1">VALID THRU</p>
										<span className="text-black fs-16">08/21</span>
									</div>
									<div className="me-3 mb-3">
										<p className="fs-14 mb-1">CARD HOLDER</p>
										<span className="text-black fs-16">WilliamFacyson</span>
									</div>
									<span className="fs-20 text-black font-w500 me-3 mb-3">**** **** **** 1234</span>
									<Dropdown className="mb-auto">
										<Dropdown.Toggle variant="" as="div" className="btn-link i-false" >
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#575757"  ></path>
												<path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="#575757"   ></path>
												<path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="#575757"   ></path>
											</svg>
										</Dropdown.Toggle>
										<Dropdown.Menu className="dropdown-menu-right" >
											<Dropdown.Item >Delete </Dropdown.Item>
											<Dropdown.Item >Edit </Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</div>
								<div className="card-body">
									<div className="progress default-progress">
										<div className="progress-bar bg-gradient-5 progress-animated" style={{ width: "50%", height: "20px" }} role="progressbar">
											<span className="sr-only">50% Complete</span>
										</div>
									</div>
									<div className="row mt-4 pt-3">
										<div className="col-xl-4 col-xxl-5 col-lg-6">
											<div className="row">
												<div className="col-sm-6 col-7">
													<h4 className="card-title">Weekly Summary</h4>
													<ul className="card-list mt-3">
														<li className="mb-2"><span className="bg-success circle"></span><span className="ms-0">Income</span><span className="text-black fs-18">50%</span></li>
														<li className="mb-2"><span className="bg-danger circle"></span><span className="ms-0">Expense</span><span className="text-black fs-18">30%</span></li>
														<li className="mb-2"><span className="bg-light circle"></span><span className="ms-0">Unknown</span><span className="text-black fs-18">20%</span></li>
													</ul>
												</div>
												<div className="col-sm-6 col-5">
													<WeeklyPieChart />
													<div id="pieChart">
													</div>
												</div>
											</div>
										</div>
										<div className="col-xl-8 col-xxl-7 col-lg-6">
											<div id="line-chart" className="bar-chart">
												<WeeklyApexChart />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-12">
							<div className="card">
								<Tab.Container defaultActiveKey={'Month'}>
									<div className="card-header d-block d-sm-flex border-0">
										<div className="me-3">
											<h4 className="card-title mb-2">Payment History</h4>
											<span className="fs-12">Lorem ipsum dolor sit amet, consectetur</span>
										</div>
										<div className="card-tabs mt-3 mt-sm-0">
											<Nav as="ul" className="nav nav-tabs" role="tablist">
												<Nav.Item as="li">
													<Nav.Link eventKey="Month">Monthly</Nav.Link>
												</Nav.Item>
												<Nav.Item as="li">
													<Nav.Link eventKey="Weekly">Weekly</Nav.Link>
												</Nav.Item>
												<Nav.Item as="li">
													<Nav.Link eventKey="Today">Today</Nav.Link>
												</Nav.Item>
											</Nav>
										</div>
									</div>
									<Tab.Content className="card-body p-0">
										<Tab.Pane eventKey="Month">
											<Accordion className="style-1" defaultActiveKey="0" >
												{AccordionBlog1.map((data, i) => (
													<Accordion.Item className="accordion-item" key={i} eventKey={`${i}`}>
														<Accordion.Header as="div" variant="">
															<div className="d-flex align-items-center">
																<div className="profile-image">
																	<img src={data.image} alt="" />
																	<span className="bg-success">
																		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
																			<g clipPath="url(#clip3)">
																				<path d="M10.4125 14.85C10.225 14.4625 10.3906 13.9937 10.7781 13.8062C11.8563 13.2875 12.7688 12.4812 13.4188 11.4719C14.0844 10.4375 14.4375 9.23749 14.4375 7.99999C14.4375 4.44999 11.55 1.56249 8 1.56249C4.45 1.56249 1.5625 4.44999 1.5625 7.99999C1.5625 9.23749 1.91562 10.4375 2.57812 11.475C3.225 12.4844 4.14062 13.2906 5.21875 13.8094C5.60625 13.9969 5.77187 14.4625 5.58437 14.8531C5.39687 15.2406 4.93125 15.4062 4.54062 15.2187C3.2 14.575 2.06562 13.575 1.2625 12.3187C0.4375 11.0312 -4.16897e-07 9.53749 -3.49691e-07 7.99999C-2.56258e-07 5.86249 0.83125 3.85312 2.34375 2.34374C3.85313 0.831242 5.8625 -7.37314e-06 8 -7.2797e-06C10.1375 -7.18627e-06 12.1469 0.831243 13.6563 2.34374C15.1688 3.85624 16 5.86249 16 7.99999C16 9.53749 15.5625 11.0312 14.7344 12.3187C13.9281 13.5719 12.7938 14.575 11.4563 15.2187C11.0656 15.4031 10.6 15.2406 10.4125 14.85Z" fill="white" />
																				<path d="M11.0407 8.41563C11.1938 8.56876 11.2688 8.76876 11.2688 8.96876C11.2688 9.16876 11.1938 9.36876 11.0407 9.52188L9.07503 11.4875C8.78753 11.775 8.40628 11.9313 8.00315 11.9313C7.60003 11.9313 7.21565 11.7719 6.93127 11.4875L4.96565 9.52188C4.6594 9.21563 4.6594 8.72188 4.96565 8.41563C5.2719 8.10938 5.76565 8.10938 6.0719 8.41563L7.22502 9.56876L7.22502 5.12814C7.22502 4.69689 7.57503 4.34689 8.00628 4.34689C8.43753 4.34689 8.78753 4.69689 8.78753 5.12814L8.78753 9.57188L9.94065 8.41876C10.2407 8.11251 10.7344 8.11251 11.0407 8.41563Z" fill="white" />
																			</g>
																			<defs>
																				<clipPath id="clip3">
																					<rect width="16" height="16" fill="white" transform="matrix(-4.37114e-08 1 1 4.37114e-08 0 -7.62939e-06)" />
																				</clipPath>
																			</defs>
																		</svg>
																	</span>
																</div>
																<div className="user-info">
																	<h6 className="fs-16 font-w700 mb-0"><Link to={"#"}>XYZ Store ID</Link></h6>
																	<span className="fs-14">Online Shop</span>
																</div>
															</div>
															<span>June 5, 2020, 08:22 AM</span>
															<span>+$5,553</span>
															<span>MasterCard 404</span>
															{data.status}
														</Accordion.Header>
														<Accordion.Collapse eventKey={`${i}`} className="accordion_body" >
															{data.cardbody}
														</Accordion.Collapse>
													</Accordion.Item >
												))}
											</Accordion>
										</Tab.Pane>
										<Tab.Pane eventKey="Weekly">
											<Accordion className="style-1" defaultActiveKey="0" >
												{AccordionBlog2.map((data, i) => (
													<Accordion.Item className="accordion-item" key={i} eventKey={`${i}`}>
														<Accordion.Header as="div" variant="">
															<div className="d-flex align-items-center">
																<div className="profile-image">
																	<img src={data.image} alt="" />
																	<span className="bg-success">
																		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
																			<g clipPath="url(#clip3)">
																				<path d="M10.4125 14.85C10.225 14.4625 10.3906 13.9937 10.7781 13.8062C11.8563 13.2875 12.7688 12.4812 13.4188 11.4719C14.0844 10.4375 14.4375 9.23749 14.4375 7.99999C14.4375 4.44999 11.55 1.56249 8 1.56249C4.45 1.56249 1.5625 4.44999 1.5625 7.99999C1.5625 9.23749 1.91562 10.4375 2.57812 11.475C3.225 12.4844 4.14062 13.2906 5.21875 13.8094C5.60625 13.9969 5.77187 14.4625 5.58437 14.8531C5.39687 15.2406 4.93125 15.4062 4.54062 15.2187C3.2 14.575 2.06562 13.575 1.2625 12.3187C0.4375 11.0312 -4.16897e-07 9.53749 -3.49691e-07 7.99999C-2.56258e-07 5.86249 0.83125 3.85312 2.34375 2.34374C3.85313 0.831242 5.8625 -7.37314e-06 8 -7.2797e-06C10.1375 -7.18627e-06 12.1469 0.831243 13.6563 2.34374C15.1688 3.85624 16 5.86249 16 7.99999C16 9.53749 15.5625 11.0312 14.7344 12.3187C13.9281 13.5719 12.7938 14.575 11.4563 15.2187C11.0656 15.4031 10.6 15.2406 10.4125 14.85Z" fill="white" />
																				<path d="M11.0407 8.41563C11.1938 8.56876 11.2688 8.76876 11.2688 8.96876C11.2688 9.16876 11.1938 9.36876 11.0407 9.52188L9.07503 11.4875C8.78753 11.775 8.40628 11.9313 8.00315 11.9313C7.60003 11.9313 7.21565 11.7719 6.93127 11.4875L4.96565 9.52188C4.6594 9.21563 4.6594 8.72188 4.96565 8.41563C5.2719 8.10938 5.76565 8.10938 6.0719 8.41563L7.22502 9.56876L7.22502 5.12814C7.22502 4.69689 7.57503 4.34689 8.00628 4.34689C8.43753 4.34689 8.78753 4.69689 8.78753 5.12814L8.78753 9.57188L9.94065 8.41876C10.2407 8.11251 10.7344 8.11251 11.0407 8.41563Z" fill="white" />
																			</g>
																			<defs>
																				<clipPath id="clip3">
																					<rect width="16" height="16" fill="white" transform="matrix(-4.37114e-08 1 1 4.37114e-08 0 -7.62939e-06)" />
																				</clipPath>
																			</defs>
																		</svg>
																	</span>
																</div>
																<div className="user-info">
																	<h6 className="fs-16 font-w700 mb-0"><Link to={"#"}>XYZ Store ID</Link></h6>
																	<span className="fs-14">Online Shop</span>
																</div>
															</div>
															<span>June 5, 2020, 08:22 AM</span>
															<span>+$5,553</span>
															<span>MasterCard 404</span>
															{data.status}
														</Accordion.Header>
														<Accordion.Collapse eventKey={`${i}`} className="accordion_body" >
															{data.cardbody}
														</Accordion.Collapse>
													</Accordion.Item >
												))}
											</Accordion>
										</Tab.Pane>
										<Tab.Pane eventKey="Today">
											<Accordion className="style-1" defaultActiveKey="0" >
												{AccordionBlog3.map((data, i) => (
													<Accordion.Item className="accordion-item" key={i} eventKey={`${i}`}>
														<Accordion.Header as="div" variant="">
															<div className="d-flex align-items-center">
																<div className="profile-image">
																	<img src={data.image} alt="" />
																	<span className="bg-success">
																		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
																			<g clipPath="url(#clip3)">
																				<path d="M10.4125 14.85C10.225 14.4625 10.3906 13.9937 10.7781 13.8062C11.8563 13.2875 12.7688 12.4812 13.4188 11.4719C14.0844 10.4375 14.4375 9.23749 14.4375 7.99999C14.4375 4.44999 11.55 1.56249 8 1.56249C4.45 1.56249 1.5625 4.44999 1.5625 7.99999C1.5625 9.23749 1.91562 10.4375 2.57812 11.475C3.225 12.4844 4.14062 13.2906 5.21875 13.8094C5.60625 13.9969 5.77187 14.4625 5.58437 14.8531C5.39687 15.2406 4.93125 15.4062 4.54062 15.2187C3.2 14.575 2.06562 13.575 1.2625 12.3187C0.4375 11.0312 -4.16897e-07 9.53749 -3.49691e-07 7.99999C-2.56258e-07 5.86249 0.83125 3.85312 2.34375 2.34374C3.85313 0.831242 5.8625 -7.37314e-06 8 -7.2797e-06C10.1375 -7.18627e-06 12.1469 0.831243 13.6563 2.34374C15.1688 3.85624 16 5.86249 16 7.99999C16 9.53749 15.5625 11.0312 14.7344 12.3187C13.9281 13.5719 12.7938 14.575 11.4563 15.2187C11.0656 15.4031 10.6 15.2406 10.4125 14.85Z" fill="white" />
																				<path d="M11.0407 8.41563C11.1938 8.56876 11.2688 8.76876 11.2688 8.96876C11.2688 9.16876 11.1938 9.36876 11.0407 9.52188L9.07503 11.4875C8.78753 11.775 8.40628 11.9313 8.00315 11.9313C7.60003 11.9313 7.21565 11.7719 6.93127 11.4875L4.96565 9.52188C4.6594 9.21563 4.6594 8.72188 4.96565 8.41563C5.2719 8.10938 5.76565 8.10938 6.0719 8.41563L7.22502 9.56876L7.22502 5.12814C7.22502 4.69689 7.57503 4.34689 8.00628 4.34689C8.43753 4.34689 8.78753 4.69689 8.78753 5.12814L8.78753 9.57188L9.94065 8.41876C10.2407 8.11251 10.7344 8.11251 11.0407 8.41563Z" fill="white" />
																			</g>
																			<defs>
																				<clipPath id="clip3">
																					<rect width="16" height="16" fill="white" transform="matrix(-4.37114e-08 1 1 4.37114e-08 0 -7.62939e-06)" />
																				</clipPath>
																			</defs>
																		</svg>
																	</span>
																</div>
																<div className="user-info">
																	<h6 className="fs-16 font-w700 mb-0"><Link to={"#"}>XYZ Store ID</Link></h6>
																	<span className="fs-14">Online Shop</span>
																</div>
															</div>
															<span>June 5, 2020, 08:22 AM</span>
															<span>+$5,553</span>
															<span>MasterCard 404</span>
															{data.status}
														</Accordion.Header>
														<Accordion.Collapse eventKey={`${i}`} className="accordion_body" >
															{data.cardbody}
														</Accordion.Collapse>
													</Accordion.Item >
												))}
											</Accordion>
										</Tab.Pane>
									</Tab.Content>
								</Tab.Container>
							</div>
						</div>
					</div>
				</div>

				<div className="col-xl-3 col-xxl-12">
					<div className="row">
						<div className="col-xl-12 col-xxl-4 col-lg-5 col-sm-6">
							<div className="card bg-blue action-card">
								<div className="card-body text-white">
									<img src={circle} className="mb-4" alt="" />
									<h2 className="text-white fs-36">$824,571.93</h2>
									<p className="fs-16">Wallet Balance</p>
									<span>+0,8% than last week</span>
									<div className="ic-card">
										<Link to="./invoices">
											<i className="bg-danger">
												<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M22.1667 1.16669H5.83342C4.59574 1.16669 3.40875 1.65835 2.53358 2.53352C1.65841 3.40869 1.16675 4.59568 1.16675 5.83335V14C1.16675 14.3094 1.28966 14.6062 1.50846 14.825C1.72725 15.0438 2.024 15.1667 2.33341 15.1667H8.16675V25.6667C8.1662 25.8898 8.22965 26.1085 8.34959 26.2966C8.46952 26.4848 8.6409 26.6346 8.84342 26.7284C9.0464 26.8218 9.27195 26.855 9.49325 26.824C9.71455 26.7929 9.92228 26.699 10.0917 26.5534L13.4167 23.7067L16.7417 26.5534C16.9531 26.7341 17.222 26.8334 17.5001 26.8334C17.7782 26.8334 18.0471 26.7341 18.2584 26.5534L21.5834 23.7067L24.9084 26.5534C25.1197 26.7341 25.3887 26.8334 25.6667 26.8334C25.8355 26.8322 26.0023 26.7964 26.1567 26.7284C26.3593 26.6346 26.5306 26.4848 26.6506 26.2966C26.7705 26.1085 26.834 25.8898 26.8334 25.6667V5.83335C26.8334 4.59568 26.3418 3.40869 25.4666 2.53352C24.5914 1.65835 23.4044 1.16669 22.1667 1.16669ZM3.50008 12.8334V5.83335C3.50008 5.21452 3.74591 4.62102 4.1835 4.18344C4.62108 3.74585 5.21458 3.50002 5.83342 3.50002C6.45225 3.50002 7.04575 3.74585 7.48333 4.18344C7.92092 4.62102 8.16675 5.21452 8.16675 5.83335V12.8334H3.50008ZM24.5001 23.135L22.3417 21.28C22.1304 21.0993 21.8615 20.9999 21.5834 20.9999C21.3053 20.9999 21.0364 21.0993 20.8251 21.28L17.5001 24.1267L14.1751 21.28C13.9638 21.0993 13.6948 20.9999 13.4167 20.9999C13.1387 20.9999 12.8697 21.0993 12.6584 21.28L10.5001 23.135V5.83335C10.4986 5.01375 10.2813 4.20898 9.87008 3.50002H22.1667C22.7856 3.50002 23.3791 3.74585 23.8167 4.18344C24.2542 4.62102 24.5001 5.21452 24.5001 5.83335V23.135ZM22.1667 7.00002C22.1667 7.30944 22.0438 7.60619 21.825 7.82498C21.6062 8.04377 21.3095 8.16669 21.0001 8.16669H14.0001C13.6907 8.16669 13.3939 8.04377 13.1751 7.82498C12.9563 7.60619 12.8334 7.30944 12.8334 7.00002C12.8334 6.6906 12.9563 6.39386 13.1751 6.17506C13.3939 5.95627 13.6907 5.83335 14.0001 5.83335H21.0001C21.3095 5.83335 21.6062 5.95627 21.825 6.17506C22.0438 6.39386 22.1667 6.6906 22.1667 7.00002ZM22.1667 11.6667C22.1667 11.9761 22.0438 12.2729 21.825 12.4916C21.6062 12.7104 21.3095 12.8334 21.0001 12.8334H14.0001C13.6907 12.8334 13.3939 12.7104 13.1751 12.4916C12.9563 12.2729 12.8334 11.9761 12.8334 11.6667C12.8334 11.3573 12.9563 11.0605 13.1751 10.8417C13.3939 10.6229 13.6907 10.5 14.0001 10.5H21.0001C21.3095 10.5 21.6062 10.6229 21.825 10.8417C22.0438 11.0605 22.1667 11.3573 22.1667 11.6667ZM22.1667 16.3334C22.1667 16.6428 22.0438 16.9395 21.825 17.1583C21.6062 17.3771 21.3095 17.5 21.0001 17.5H14.0001C13.6907 17.5 13.3939 17.3771 13.1751 17.1583C12.9563 16.9395 12.8334 16.6428 12.8334 16.3334C12.8334 16.0239 12.9563 15.7272 13.1751 15.5084C13.3939 15.2896 13.6907 15.1667 14.0001 15.1667H21.0001C21.3095 15.1667 21.6062 15.2896 21.825 15.5084C22.0438 15.7272 22.1667 16.0239 22.1667 16.3334Z" fill="#fff"></path>
												</svg>
											</i>
											<span>Send Invoices</span>
										</Link>
										<Link to="/transaction-history">
											<i className="bg-success">
												<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
													<g opacity="0.98" >
														<path d="M9.77812 2.0125C10.1062 2.69062 9.81641 3.51094 9.13828 3.83906C7.25156 4.74688 5.65469 6.15781 4.51719 7.92422C3.35234 9.73437 2.73438 11.8344 2.73438 14C2.73438 20.2125 7.7875 25.2656 14 25.2656C20.2125 25.2656 25.2656 20.2125 25.2656 14C25.2656 11.8344 24.6477 9.73437 23.4883 7.91875C22.3563 6.15234 20.7539 4.74141 18.8672 3.83359C18.1891 3.50547 17.8992 2.69063 18.2273 2.00703C18.5555 1.32891 19.3703 1.03906 20.0539 1.36719C22.4 2.49375 24.3852 4.24375 25.7906 6.44219C27.2344 8.69531 28 11.3094 28 14C28 17.7406 26.5453 21.257 23.8984 23.8984C21.257 26.5453 17.7406 28 14 28C10.2594 28 6.74297 26.5453 4.10156 23.8984C1.45469 21.2516 1.22342e-07 17.7406 1.66948e-07 14C1.99034e-07 11.3094 0.765625 8.69531 2.21484 6.44219C3.62578 4.24922 5.61094 2.49375 7.95156 1.36719C8.63516 1.04453 9.45 1.3289 9.77812 2.0125Z" fill="#fff"></path>
														<path d="M8.67896 13.2726C8.41099 13.0047 8.27974 12.6547 8.27974 12.3047C8.27974 11.9547 8.41099 11.6047 8.67896 11.3367L12.1188 7.89685C12.6219 7.39373 13.2891 7.12029 13.9946 7.12029C14.7 7.12029 15.3727 7.3992 15.8704 7.89685L19.3102 11.3367C19.8461 11.8726 19.8461 12.7367 19.3102 13.2726C18.7743 13.8086 17.9102 13.8086 17.3743 13.2726L15.3563 11.2547L15.3563 19.0258C15.3563 19.7804 14.7438 20.3929 13.9891 20.3929C13.2344 20.3929 12.6219 19.7804 12.6219 19.0258L12.6219 11.2492L10.604 13.2672C10.079 13.8031 9.21489 13.8031 8.67896 13.2726Z" fill="#fff"></path>
													</g>
													<defs>
														<clipPath id="clip11">
															<rect width="28" height="28" fill="white" transform="matrix(1.19249e-08 -1 -1 -1.19249e-08 28 28)"></rect>
														</clipPath>
													</defs>
												</svg>
											</i>
											<span>Transfer</span>
										</Link>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-12 col-xxl-8 col-lg-7  col-sm-6">
							<div className="card">
								<div className="card-header d-block d-sm-flex border-0">
									<div>
										<h4 className="card-title mb-2">Invoices Sent</h4>
										<span className="fs-12">Lorem ipsum dolor sit amet, consectetur</span>
									</div>
								</div>
								<div className="card-body p-0">
									<div className="invoice-list">
										<img src={avatar1} alt="" className="rounded-circle me-3" />
										<div className="me-auto">
											<h6 className="fs-16 font-w600 mb-0"><Link to={"/invoices"} className="text-black">FSoziety</Link></h6>
											<span className="fs-12">4h ago</span>
										</div>
										<span className="fs-16 text-black font-w600">$45</span>
									</div>
									<div className="invoice-list">
										<img src={avatar2} alt="" className="rounded-circle me-3" />
										<div className="me-auto">
											<h6 className="fs-16 font-w600 mb-0"><Link to={"/invoices"} className="text-black">FSoziety</Link></h6>
											<span className="fs-12">4h ago</span>
										</div>
										<span className="fs-16 text-black font-w600">$45</span>
									</div>
									<div className="invoice-list">
										<img src={avatar3} alt="" className="rounded-circle me-3" />
										<div className="me-auto">
											<h6 className="fs-16 font-w600 mb-0"><Link to={"/invoices"} className="text-black">FSoziety</Link></h6>
											<span className="fs-12">4h ago</span>
										</div>
										<span className="fs-16 text-black font-w600">$45</span>
									</div>
									<div className="invoice-list">
										<img src={avatar4} alt="" className="rounded-circle me-3" />
										<div className="me-auto">
											<h6 className="fs-16 font-w600 mb-0"><Link to={"/invoices"} className="text-black">FSoziety</Link></h6>
											<span className="fs-12">4h ago</span>
										</div>
										<span className="fs-16 text-black font-w600">$45</span>
									</div>
									<div className="invoice-list">
										<img src={avatar5} alt="" className="rounded-circle me-3" />
										<div className="me-auto">
											<h6 className="fs-16 font-w600 mb-0"><Link to={"/invoices"} className="text-black">FSoziety</Link></h6>
											<span className="fs-12">4h ago</span>
										</div>
										<span className="fs-16 text-black font-w600">$45</span>
									</div>
								</div>
								<div className="card-footer border-0">
									<Link to={"#"} className="btn btn-outline-primary d-block btn-lg">View More</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
export default MyWallet;