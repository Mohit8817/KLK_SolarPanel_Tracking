/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useContext } from "react";

import { Link } from "react-router-dom";
/// Scroll
// import PerfectScrollbar from "react-perfect-scrollbar";

/// Image
// import avatar from "../../../assets/images/avatar/1.jpg";
import profile from "../../../assets/images/profile/profileimg3.jpg";

import { Dropdown } from "react-bootstrap";
import LogoutPage from './Logout';

import { ThemeContext } from "../../../context/ThemeContext";


const baseURL = import.meta.env.VITE_BACKEND_URL;

const Header = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  var path = window.location.pathname.split("/").filter(Boolean);

  var lastSegment = path[path.length - 1];

  var isMongoId = /^[0-9a-fA-F]{24}$/.test(lastSegment);

  var segment = isMongoId ? path[path.length - 2] : lastSegment;

  var name = segment ? segment.split("-") : [];

  var filterName = name.length >= 3 ? name.filter((n, i) => i > 0) : name;
  var finalName = filterName.includes("app")
    ? filterName.filter((f) => f !== "app")
    : filterName.includes("ui")
      ? filterName.filter((f) => f !== "ui")
      : filterName.includes("uc")
        ? filterName.filter((f) => f !== "uc")
        : filterName.includes("basic")
          ? filterName.filter((f) => f !== "basic")
          : filterName.includes("jquery")
            ? filterName.filter((f) => f !== "jquery")
            : filterName.includes("table")
              ? filterName.filter((f) => f !== "table")
              : filterName.includes("page")
                ? filterName.filter((f) => f !== "page")
                : filterName.includes("email")
                  ? filterName.filter((f) => f !== "email")
                  : filterName.includes("ecom")
                    ? filterName.filter((f) => f !== "ecom")
                    : filterName.includes("chart")
                      ? filterName.filter((f) => f !== "chart")
                      : filterName.includes("editor")
                        ? filterName.filter((f) => f !== "editor")
                        : filterName;

  const { background, changeBackground } = useContext(ThemeContext);
  function ChangeColor() {
    if (background.value === "light") {
      changeBackground({ value: "dark", label: "Dark" });
    }
    else {
      changeBackground({ value: "light", label: "Light" });
    }
  }
  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              
              <div
                className="dashboard_bar"
                style={{ textTransform: "capitalize" }}
              >
                {finalName.join(" ").length === 0
                  ? "Dashboard"
                  : finalName.join(" ") === "dashboard dark"
                    ? "Dashboard"
                    : finalName.join(" ")}
              </div>


              
            </div>
            <ul className="navbar-nav header-right main-notification">

             

              <li className="nav-item">
                <div className="input-group search-area">
                  <input type="text" className="form-control" placeholder="Search here..." />
                  <span className="input-group-text"><Link to={"#"}> <i className="flaticon-381-search-2"></i></Link></span>
                </div>
              </li>


               <li className="nav-item dropdown notification_dropdown">
                <Link to={"#"} className={`nav-link bell dz-theme-mode p-0 ${background.value === "dark" ? 'active' : ''}`}
                  onClick={ChangeColor}
                >
                  <i id="icon-light" className="fas fa-sun" />
                  <i id="icon-dark" className="fas fa-moon" />
                </Link>
              </li>




              {/* <li className="nav-item">
                <Link to={"#"} className="btn btn-primary d-sm-inline-block d-none">Generate Report<i className="las la-signal ms-3 scale5"></i></Link>
              </li> */}

              <Dropdown as="li" className="nav-item dropdown header-profile">
                <Dropdown.Toggle
                  variant=""
                  as="a"
                  className=" i-false c-pointer"
                  // href="#"
                  role="button"
                  data-toggle="dropdown"
                >
                  <img
                    src={
                      user?.emp_image
                        ? `${baseURL}/uploads/${user.emp_image}`
                        : profile
                    }
                    onError={(e) => {
                      e.target.src = profile;
                    }}
                    width="50"
                    height="50"
                    alt="profile"
                    className="rounded-circle object-fit-cover"
                  />

                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="mt-2 dropdown-menu dropdown-menu-end">
                  <Link to="/app-profile" className="dropdown-item ai-icon">
                    <svg
                      id="icon-user1"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx={12} cy={7} r={4} />
                    </svg>
                    <span className="ms-2">Profile </span>
                  </Link>

                  <LogoutPage />

                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;